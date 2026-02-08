"""
SatVach Posts API Endpoints
Full CRUD for community posts with likes, comments, image uploads.
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.core.deps import get_current_active_user, get_db, get_s3_client
from src.models.post import Post, PostComment, PostImage, PostLike
from src.models.user import User
from src.schemas.post import (
    CommentCreate,
    PostAuthor,
    PostCommentResponse,
    PostCreate,
    PostImageResponse,
    PostListResponse,
    PostResponse,
    PostUpdate,
)

router = APIRouter()


def _post_to_response(post: Post, current_user_id: int | None = None) -> PostResponse:
    """Convert Post ORM object to PostResponse with computed fields."""
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        cover_image_url=post.cover_image_url,
        is_published=post.is_published,
        author=PostAuthor.model_validate(post.author),
        images=[PostImageResponse.model_validate(img) for img in post.images],
        likes_count=len(post.likes),
        comments_count=len(post.comments),
        is_liked=any(like.user_id == current_user_id for like in post.likes)
        if current_user_id
        else False,
        comments=[PostCommentResponse.model_validate(c) for c in post.comments],
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


# ---------- Posts CRUD ----------


@router.get("", response_model=PostListResponse)
async def list_posts(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List published posts (public, newest first)."""
    # Count
    count_stmt = select(func.count(Post.id)).where(Post.is_published == True)  # noqa: E712
    total = (await db.execute(count_stmt)).scalar() or 0

    # Fetch
    stmt = (
        select(Post)
        .where(Post.is_published == True)  # noqa: E712
        .options(
            selectinload(Post.author),
            selectinload(Post.likes),
            selectinload(Post.comments).selectinload(PostComment.user),
            selectinload(Post.images),
        )
        .order_by(desc(Post.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().unique().all()

    # Try to get current user for is_liked (optional auth)
    return PostListResponse(
        items=[_post_to_response(p) for p in posts],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/me", response_model=PostListResponse)
async def list_my_posts(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List current user's posts (including drafts)."""
    count_stmt = select(func.count(Post.id)).where(Post.author_id == current_user.id)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Post)
        .where(Post.author_id == current_user.id)
        .options(
            selectinload(Post.author),
            selectinload(Post.likes),
            selectinload(Post.comments).selectinload(PostComment.user),
            selectinload(Post.images),
        )
        .order_by(desc(Post.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().unique().all()

    return PostListResponse(
        items=[_post_to_response(p, current_user.id) for p in posts],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    *,
    db: AsyncSession = Depends(get_db),
    post_id: int,
) -> Any:
    """Get a single post by ID."""
    stmt = (
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.author),
            selectinload(Post.likes),
            selectinload(Post.comments).selectinload(PostComment.user),
            selectinload(Post.images),
        )
    )
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return _post_to_response(post)


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_in: PostCreate,
) -> Any:
    """Create a new post."""
    post = Post(
        author_id=current_user.id,
        title=post_in.title,
        content=post_in.content,
        cover_image_url=post_in.cover_image_url,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post, attribute_names=["author", "likes", "comments", "images"])

    return _post_to_response(post, current_user.id)


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
    post_in: PostUpdate,
) -> Any:
    """Update own post."""
    stmt = (
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.author),
            selectinload(Post.likes),
            selectinload(Post.comments).selectinload(PostComment.user),
            selectinload(Post.images),
        )
    )
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not your post")

    update_data = post_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    db.add(post)
    await db.commit()
    await db.refresh(post)

    return _post_to_response(post, current_user.id)


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
) -> None:
    """Delete own post."""
    stmt = select(Post).where(Post.id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not your post")

    await db.delete(post)
    await db.commit()


# ---------- Image Upload ----------


@router.post("/{post_id}/images", response_model=PostImageResponse, status_code=201)
async def upload_post_image(
    *,
    db: AsyncSession = Depends(get_db),
    s3=Depends(get_s3_client),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
    file: UploadFile = File(...),
    caption: str | None = None,
) -> Any:
    """Upload an image for a post."""
    # Verify post ownership
    stmt = select(Post).where(Post.id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")

    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    # Upload to S3
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    key = f"posts/{post_id}/{uuid.uuid4().hex}.{ext}"

    await s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=content,
        ContentType=file.content_type,
    )

    image_url = f"{settings.S3_PUBLIC_ENDPOINT}/{settings.S3_BUCKET}/{key}"

    # Count existing images for sort_order
    count_stmt = select(func.count(PostImage.id)).where(PostImage.post_id == post_id)
    count = (await db.execute(count_stmt)).scalar() or 0

    post_image = PostImage(
        post_id=post_id,
        image_url=image_url,
        caption=caption,
        sort_order=count,
    )
    db.add(post_image)
    await db.commit()
    await db.refresh(post_image)

    return PostImageResponse.model_validate(post_image)


# ---------- Likes ----------


@router.post("/{post_id}/like", status_code=201)
async def toggle_like(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
) -> dict:
    """Toggle like on a post. Returns new like state."""
    # Verify post exists
    post_stmt = select(Post).where(Post.id == post_id)
    post = (await db.execute(post_stmt)).scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check existing like
    stmt = select(PostLike).where(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id,
    )
    existing = (await db.execute(stmt)).scalars().first()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"liked": False}
    else:
        like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        await db.commit()
        return {"liked": True}


# ---------- Comments ----------


@router.post("/{post_id}/comments", response_model=PostCommentResponse, status_code=201)
async def create_comment(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
    comment_in: CommentCreate,
) -> Any:
    """Add a comment to a post."""
    post_stmt = select(Post).where(Post.id == post_id)
    post = (await db.execute(post_stmt)).scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_in.content,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment, attribute_names=["user"])

    return PostCommentResponse.model_validate(comment)


@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    post_id: int,
    comment_id: int,
) -> None:
    """Delete own comment or any comment if admin."""
    stmt = select(PostComment).where(
        PostComment.id == comment_id,
        PostComment.post_id == post_id,
    )
    comment = (await db.execute(stmt)).scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not your comment")

    await db.delete(comment)
    await db.commit()
