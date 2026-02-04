"""
SatVach API - Main Application Entry Point
"""

from contextlib import asynccontextmanager

import aioboto3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api.v1.router import router as api_v1_router
from src.core.config import settings
from src.db.session import async_session_maker


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to SatVach Hyperlocal API"}


@app.get("/health")
async def health_check():
    """
    Basic health check endpoint for Docker.
    Returns ok if the application is running.
    """
    return {"status": "ok"}


@app.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.
    Verifies database connectivity before reporting ready.
    """
    checks = {
        "database": False,
        "minio": False,
    }

    # Check database connectivity
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            checks["database"] = True
    except Exception as e:
        checks["database"] = False
        checks["database_error"] = str(e)

    # Check MinIO connectivity
    try:
        session = aioboto3.Session()
        async with session.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        ) as s3:
            # Try to list buckets to verify connection
            await s3.list_buckets()
            checks["minio"] = True
    except Exception as e:
        checks["minio"] = False
        checks["minio_error"] = str(e)

    # Determine overall status
    all_healthy = checks["database"] and checks["minio"]

    return {
        "status": "ready" if all_healthy else "degraded",
        "checks": checks,
    }
