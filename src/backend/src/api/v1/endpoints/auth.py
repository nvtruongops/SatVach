"""
Auth Endpoints
"""

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core import security
from src.core.config import settings
from src.core.deps import get_current_active_user, get_db
from src.models.user import User
from src.schemas.user import (
    ChangePasswordRequest,
    EmailVerificationRequest,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserProfileUpdate,
)
from src.schemas.user import User as UserSchema
from src.services.email import send_password_reset_email, send_verification_email

router = APIRouter()


@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Create new user.
    """
    # Check if user with same email or username already exists
    stmt = select(User).where(or_(User.email == user_in.email, User.username == user_in.username))
    result = await db.execute(stmt)
    existing_user = result.scalars().first()

    if existing_user:
        if existing_user.email == user_in.email:
            detail = "Email already registered"
        else:
            detail = "Username already taken"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )

    # Create new user
    # Create new user
    hashed_password = security.get_password_hash(user_in.password)

    # Generate verification code
    verification_code = secrets.token_hex(3).upper()  # 6 chars
    verification_code_expires_at = datetime.now(UTC) + timedelta(minutes=15)

    # New users are inactive by default unless superuser
    is_active = user_in.is_active if user_in.is_superuser else False

    db_user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        is_active=is_active,
        is_superuser=user_in.is_superuser,
        verification_code=verification_code,
        verification_code_expires_at=verification_code_expires_at,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Send verification email if not active
    if not is_active:
        background_tasks.add_task(send_verification_email, user_in.email, verification_code)

    return db_user


@router.post("/verify", response_model=dict)
async def verify_email(
    *,
    db: AsyncSession = Depends(get_db),
    verification_in: EmailVerificationRequest,
) -> Any:
    """
    Verify user email with code.
    """
    stmt = select(User).where(User.email == verification_in.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_active:
        return {"message": "User already active"}

    if not user.verification_code or user.verification_code != verification_in.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )

    if (
        not user.verification_code_expires_at
        or datetime.now(UTC) > user.verification_code_expires_at
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code expired",
        )

    # Activate user
    user.is_active = True
    user.verification_code = None
    user.verification_code_expires_at = None

    db.add(user)
    await db.commit()

    return {"message": "Email verified successfully"}


@router.post("/password-recovery/{email}", response_model=dict)
async def recover_password(
    email: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Password Recovery
    """
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # Return success even if user not found to prevent email enumeration
        return {"message": "If email exists, password recovery code sent"}

    # Generate reset code
    reset_code = secrets.token_hex(3).upper()
    reset_code_expires_at = datetime.now(UTC) + timedelta(minutes=15)

    user.verification_code = reset_code
    user.verification_code_expires_at = reset_code_expires_at

    db.add(user)
    await db.commit()

    background_tasks.add_task(send_password_reset_email, email, reset_code)

    return {"message": "If email exists, password recovery code sent"}


@router.post("/reset-password", response_model=dict)
async def reset_password(
    *,
    db: AsyncSession = Depends(get_db),
    body: ResetPasswordRequest,
) -> Any:
    """
    Reset password
    """
    stmt = select(User).where(User.email == body.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.verification_code or user.verification_code != body.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset code",
        )

    if (
        not user.verification_code_expires_at
        or datetime.now(UTC) > user.verification_code_expires_at
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code expired",
        )

    # Update password
    hashed_password = security.get_password_hash(body.new_password)
    user.hashed_password = hashed_password

    # Clear code
    user.verification_code = None
    user.verification_code_expires_at = None

    # Also activate user if not active (proving ownership of email)
    user.is_active = True

    db.add(user)
    await db.commit()

    return {"message": "Password reset successfully"}


@router.post("/login/access-token")
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Supports login by username OR email.
    """
    # Try to authenticate by username or email
    stmt = select(User).where(
        or_(User.email == form_data.username, User.username == form_data.username)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email/username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }


@router.post("/login", response_model=dict)
async def login(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserLogin,
) -> Any:
    """
    JSON body login.
    """
    stmt = select(User).where(
        or_(User.email == user_in.username_or_email, User.username == user_in.username_or_email)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email/username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
        "user": UserSchema.model_validate(user),
    }


@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.post("/me/avatar", response_model=UserSchema)
async def upload_avatar(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload user avatar.
    """
    # 1. Validate file (size, type) -> handled by storage_service, but let's be safe
    # 2. Upload to MinIO
    try:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large (max 5MB)",
            )

        from src.services.storage_service import storage_service

        # Use userId as prefix to organize files
        filename = f"avatars/{current_user.id}_{file.filename}"

        result = await storage_service.upload_image(
            content=content,
            original_filename=filename,
            content_type=file.content_type,
            optimize=True,
        )

        # 3. Update user profile
        current_user.avatar_url = result["url"]
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)

        return current_user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}",
        )


@router.patch("/me", response_model=UserSchema)
async def update_profile(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    profile_in: UserProfileUpdate,
) -> Any:
    """
    Update current user profile (username, email).
    """
    update_data = profile_in.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    # Check uniqueness for username/email if they are being changed
    if "username" in update_data and update_data["username"] != current_user.username:
        stmt = select(User).where(User.username == update_data["username"])
        result = await db.execute(stmt)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

    if "email" in update_data and update_data["email"] != current_user.email:
        stmt = select(User).where(User.email == update_data["email"])
        result = await db.execute(stmt)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/change-password", response_model=dict)
async def change_password(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    body: ChangePasswordRequest,
) -> Any:
    """
    Change current user password. Requires current password verification.
    """
    if not security.verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = security.get_password_hash(body.new_password)
    db.add(current_user)
    await db.commit()

    return {"message": "Password changed successfully"}
