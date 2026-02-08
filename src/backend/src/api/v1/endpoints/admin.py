"""
Admin API Endpoints
"""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import get_current_active_user, get_db
from src.models.contact_message import ContactMessage
from src.models.location import LocationStatus
from src.models.user import User
from src.schemas.contact import ContactMessageListResponse, ContactMessageResponse
from src.schemas.location import LocationListResponse, LocationResponse
from src.schemas.user import User as UserSchema
from src.schemas.user import UserListResponse
from src.services.location_service import location_service
from src.services.user_service import user_service


class DashboardStats(BaseModel):
    total_locations: int
    pending_locations: int
    approved_locations: int
    rejected_locations: int
    total_users: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_activity: list[LocationResponse]


router = APIRouter()


@router.get("/locations", response_model=LocationListResponse)
async def list_locations(
    status: LocationStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List locations, optionally filtered by status (e.g. pending).
    Intended for admin dashboard.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    items, total = await location_service.list_all(db, status, skip, limit)

    return LocationListResponse(items=items, total=total, skip=skip, limit=limit)


@router.patch("/locations/{id}/status", response_model=LocationResponse)
async def update_location_status(
    id: int,
    status: Annotated[LocationStatus, Body(embed=True)],
    reason: Annotated[str | None, Body(embed=True)] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update location moderation status (Approve/Reject).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    return await location_service.update_status(
        db,
        id,
        status,
        reason=reason,
        moderator_id=str(current_user.id),
        moderator_ip="127.0.0.1",
    )


@router.get("/dashboard/stats", response_model=DashboardResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get dashboard statistics.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    total_locations = await location_service.count(db)
    pending_locations = await location_service.count(db, LocationStatus.pending)
    approved_locations = await location_service.count(db, LocationStatus.approved)
    rejected_locations = await location_service.count(db, LocationStatus.rejected)

    # Count users (using direct query here or service if available)
    # We need to expose count in user_service or use list_all(limit=0)
    # Since we defined list_all returning tuple(items, total), we can use that with limit=1
    _, total_users = await user_service.list_all(db, limit=1)

    # Recent activity (latest 5 locations)
    recent_locations, _ = await location_service.list_all(db, limit=5)

    return {
        "stats": {
            "total_locations": total_locations,
            "pending_locations": pending_locations,
            "approved_locations": approved_locations,
            "rejected_locations": rejected_locations,
            "total_users": total_users,
        },
        "recent_activity": recent_locations,
    }


@router.get("/users", response_model=UserListResponse)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List users.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    items, total = await user_service.list_all(db, skip, limit)
    return UserListResponse(items=items, total=total, skip=skip, limit=limit)


@router.patch("/users/{id}/status", response_model=UserSchema)
async def update_user_status(
    id: int,
    is_active: Annotated[bool, Body(embed=True)],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Ban/Unban user.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = await user_service.update_status(db, id, is_active)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ─── Contact Messages ─────────────────────────────────────────────────


@router.get("/contact-messages", response_model=ContactMessageListResponse)
async def list_contact_messages(
    skip: int = 0,
    limit: int = 20,
    is_read: bool | None = Query(None),
    is_archived: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List contact messages for admin."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = select(ContactMessage)
    count_query = select(func.count(ContactMessage.id))

    if is_read is not None:
        query = query.where(ContactMessage.is_read == is_read)
        count_query = count_query.where(ContactMessage.is_read == is_read)
    if is_archived is not None:
        query = query.where(ContactMessage.is_archived == is_archived)
        count_query = count_query.where(ContactMessage.is_archived == is_archived)

    query = query.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    items = list(result.scalars().all())

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return ContactMessageListResponse(items=items, total=total, skip=skip, limit=limit)


@router.patch("/contact-messages/{id}", response_model=ContactMessageResponse)
async def update_contact_message(
    id: int,
    is_read: Annotated[bool | None, Body(embed=True)] = None,
    is_archived: Annotated[bool | None, Body(embed=True)] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update contact message status (mark read / archive)."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    result = await db.execute(select(ContactMessage).where(ContactMessage.id == id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if is_read is not None:
        msg.is_read = is_read
    if is_archived is not None:
        msg.is_archived = is_archived

    await db.commit()
    await db.refresh(msg)
    return msg
