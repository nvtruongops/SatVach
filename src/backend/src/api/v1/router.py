"""
SatVach API v1 Router
Aggregates all v1 endpoint routers.
"""

from fastapi import APIRouter

from src.api.v1.endpoints import admin, auth, contact, images, locations, posts

router = APIRouter()

router.include_router(locations.router, prefix="/locations", tags=["locations"])
router.include_router(images.router, prefix="/images", tags=["images"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(contact.router, prefix="/contact", tags=["contact"])
router.include_router(posts.router, prefix="/posts", tags=["posts"])
