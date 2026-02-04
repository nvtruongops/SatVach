"""
SatVach Moderation Schemas
Pydantic schemas for moderation API endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.models.location import LocationStatus
from src.models.moderation_log import ModerationAction


class ModerationStatusUpdate(BaseModel):
    """Schema for updating location moderation status."""

    status: LocationStatus
    reason: str | None = Field(None, max_length=1000)


class ModerationLogResponse(BaseModel):
    """Response schema for moderation log entry."""

    id: int
    location_id: int
    action: ModerationAction
    reason: str | None
    moderator_id: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ModerationLogListResponse(BaseModel):
    """Paginated list of moderation logs."""

    items: list[ModerationLogResponse]
    total: int
    skip: int
    limit: int
