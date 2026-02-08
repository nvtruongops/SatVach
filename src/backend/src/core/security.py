"""
SatVach Security Utilities.
Handles input sanitization, password hashing, and token generation.
"""

from datetime import datetime, timedelta
from typing import Any

import bleach
from jose import jwt
from passlib.context import CryptContext

from src.core.config import settings

# Allowed HTML tags for description field (if we allow rich text later)
# For now, we strip mostly everything to be safe.
ALLOWED_TAGS = []  # No HTML allowed by default
ALLOWED_ATTRIBUTES = {}

# Password context
# Using pbkdf2_sha256 to avoid bcrypt build issues in some environments
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def sanitize_input(text: str) -> str:
    """
    Sanitize input text to prevent XSS.
    Removes all HTML tags and script injection attempts.

    Args:
        text: Input string (can be None)

    Returns:
        Sanitized string using bleach
    """
    if not text:
        return ""

    return bleach.clean(text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a hash for a password.
    """
    return pwd_context.hash(password)


def create_access_token(subject: int | str, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        subject: User ID to encode in the token
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
