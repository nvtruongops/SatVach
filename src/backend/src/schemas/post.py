"""
SatVach Post Schemas
"""

from datetime import datetime

from pydantic import BaseModel, Field


# ---------- Post ----------
class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    cover_image_url: str | None = None


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    content: str | None = None
    cover_image_url: str | None = None
    is_published: bool | None = None


class PostAuthor(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class PostImageResponse(BaseModel):
    id: int
    image_url: str
    caption: str | None = None
    sort_order: int = 0

    class Config:
        from_attributes = True


class PostCommentAuthor(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class PostCommentResponse(BaseModel):
    id: int
    content: str
    user: PostCommentAuthor
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    cover_image_url: str | None = None
    is_published: bool
    author: PostAuthor
    images: list[PostImageResponse] = []
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False  # Whether current user liked this post
    comments: list[PostCommentResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
    skip: int
    limit: int


# ---------- Comment ----------
class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
