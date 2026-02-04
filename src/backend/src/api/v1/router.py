"""
SatVach API v1 Router
Aggregates all v1 endpoint routers.
"""

from fastapi import APIRouter

from src.api.v1.endpoints import admin, images, locations

router = APIRouter()

router.include_router(locations.router, prefix="/locations", tags=["locations"])
router.include_router(images.router, prefix="/images", tags=["images"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
