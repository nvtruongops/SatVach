"""
Admin API Endpoints
"""

from typing import Annotated

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import get_db
from src.models.location import LocationStatus
from src.schemas.location import LocationListResponse, LocationResponse
from src.services.location_service import location_service

router = APIRouter()


@router.get("/locations", response_model=LocationListResponse)
async def list_locations(
    status: LocationStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    List locations, optionally filtered by status (e.g. pending).
    Intended for admin dashboard.
    """
    items, total = await location_service.list_all(db, status, skip, limit)

    return LocationListResponse(items=items, total=total, skip=skip, limit=limit)


@router.patch("/locations/{id}/status", response_model=LocationResponse)
async def update_location_status(
    id: int,
    status: Annotated[LocationStatus, Body(embed=True)],
    reason: Annotated[str | None, Body(embed=True)] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Update location moderation status (Approve/Reject).
    """
    return await location_service.update_status(
        db,
        id,
        status,
        reason=reason,
        moderator_id="admin",  # Placeholder until Auth is implemented
        moderator_ip="127.0.0.1",
    )
