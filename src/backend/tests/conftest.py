from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.fixture
def mock_db_session():
    """Mock SQLAlchemy AsyncSession."""
    session = AsyncMock(spec=AsyncSession)
    # Default behavior: commit and rollback do nothing
    session.commit.return_value = None
    session.rollback.return_value = None
    session.execute.return_value = MagicMock()
    return session


@pytest.fixture
def mock_s3_client():
    """Mock S3 Client."""
    client = AsyncMock()
    return client
