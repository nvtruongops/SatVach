"""
SatVach Contact Schemas
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(default="support", pattern="^(support|feedback|bug)$")
    message: str = Field(..., min_length=1, max_length=5000)


class ContactMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    user_id: int | None = None
    subject: str
    message: str
    is_read: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class ContactMessageListResponse(BaseModel):
    items: list[ContactMessageResponse]
    total: int
    skip: int
    limit: int
