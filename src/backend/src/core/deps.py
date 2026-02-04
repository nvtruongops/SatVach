"""
SatVach API Dependencies
Provides dependency injection for database sessions and S3 clients.
"""

from collections.abc import AsyncGenerator

import aioboto3
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.db.session import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session dependency.
    Yields an async database session and ensures proper cleanup.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_s3_client():
    """
    S3/MinIO client dependency.
    Returns an aioboto3 S3 client configured for MinIO.
    """
    session = aioboto3.Session()
    async with session.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
    ) as client:
        yield client
