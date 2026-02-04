"""
Locations API Endpoints
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import get_db
from src.core.rate_limit import limiter
from src.core.security import sanitize_input
from src.models.location import LocationCategory
from src.schemas.location import (
    LocationCreate,
    LocationListResponse,
    LocationResponse,
    LocationSearchParams,
)
from src.services.location_service import location_service
from src.services.search_service import search_service

router = APIRouter()


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_location(
    request: Request,
    data: LocationCreate,
    db: AsyncSession = Depends(get_db),
    # client_ip will be handled by middleware/rate limiter in real app
):
    """
    Create a new location.

    The location is created with PENDING status and requires moderation approval.
    """
    # Sanitize inputs (SEC-1.4)
    data.title = sanitize_input(data.title)
    if data.description:
        data.description = sanitize_input(data.description)
    if data.address:
        data.address = sanitize_input(data.address)

    location = await location_service.create(db, data)
    return location


@router.get("/search", response_model=LocationListResponse)
@limiter.limit("100/minute")
async def search_locations(
    request: Request,
    latitude: Annotated[float, Query(..., ge=-90, le=90)],
    longitude: Annotated[float, Query(..., ge=-180, le=180)],
    radius: Annotated[int, Query(ge=500, le=50000)] = 5000,
    query: Annotated[str | None, Query(max_length=100)] = None,
    category: LocationCategory | None = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """
    Search locations within a radius with optional text and category filters.
    """
    if query:
        query = sanitize_input(query)

    params = LocationSearchParams(
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        query=query,
        category=category,
        skip=skip,
        limit=limit,
    )

    items, total = await search_service.search(db, params)

    return LocationListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/viewport", response_model=list[LocationResponse])
@limiter.limit("100/minute")
async def search_viewport(
    request: Request,
    min_lng: float,
    min_lat: float,
    max_lng: float,
    max_lat: float,
    category: LocationCategory | None = None,
    limit: Annotated[int, Query(le=100)] = 100,
    db: AsyncSession = Depends(get_db),
):
    """
    Search locations within a map viewport (bounding box).
    Used for lazy loading markers on the map.
    """
    locations = await search_service.search_viewport(
        db, min_lng, min_lat, max_lng, max_lat, category, limit=limit
    )
    return locations


@router.get("/{id}", response_model=LocationResponse)
@limiter.limit("100/minute")
async def get_location(
    request: Request,
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get location details by ID.
    """
    return await location_service.get_by_id(db, id)
