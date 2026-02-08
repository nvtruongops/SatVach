"""
SatVach User Schemas
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Shared properties."""

    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None
    avatar_url: str | None = None


class UserCreate(UserBase):
    """Properties to receive via API on creation."""

    password: str = Field(min_length=8)


class UserUpdate(UserBase):
    """Properties to receive via API on update (admin)."""

    password: str | None = None


class UserProfileUpdate(BaseModel):
    """Properties a user can update on their own profile."""

    username: str | None = Field(
        default=None, min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$"
    )
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, max_length=100)


class ChangePasswordRequest(BaseModel):
    """Change password request - requires current password."""

    current_password: str
    new_password: str = Field(min_length=8)


class UserInDBBase(UserBase):
    """Properties shared by models stored in DB."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Additional properties to return via API."""

    pass


class UserLogin(BaseModel):
    """Properties to receive via API on login."""

    username_or_email: str
    password: str


class UserListResponse(BaseModel):
    items: list[User]
    total: int
    skip: int
    limit: int


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(min_length=8)
