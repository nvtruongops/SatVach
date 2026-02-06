import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.core.config import settings
from src.core.deps import get_db, get_s3_client
from src.main import app


@pytest.fixture
async def test_engine():
    """
    Create a fresh engine for testing to ensure it attaches to the current event loop.
    """
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
    )
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine):
    """
    Fixture for a fresh database session with rollback.
    Connects to the REAL database configured in .env (Docker).
    """
    connection = await test_engine.connect()
    transaction = await connection.begin()

    session = AsyncSession(bind=connection, expire_on_commit=False)

    yield session

    # Clean up
    await session.close()
    if transaction.is_active:
        await transaction.rollback()
    await connection.close()


@pytest.fixture
async def async_client(db_session):
    """
    Fixture for AsyncClient with overridden DB dependency.
    """

    # Override get_db to use our rollback-session
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async def override_get_s3():
        # Mock S3 client using a simple async mock that mimics aioboto3 client
        class MockS3:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def put_object(self, **kwargs):
                return {}

            async def generate_presigned_url(self, **kwargs):
                return "http://minio/fake-url"

            async def delete_object(self, **kwargs):
                return {}

        yield MockS3()

    app.dependency_overrides[get_s3_client] = override_get_s3

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
