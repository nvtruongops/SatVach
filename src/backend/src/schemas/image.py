"""
SatVach Image Schemas
Pydantic schemas for Image upload API endpoints.
"""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

# Type aliases
Filename = Annotated[str, Field(max_length=255)]
S3Key = Annotated[str, Field(max_length=500)]
Url = Annotated[str, Field(max_length=1000)]
ContentType = Annotated[str, Field(max_length=50)]


class ImageBase(BaseModel):
    """Base schema for Image."""

    filename: Filename
    content_type: ContentType
    size_bytes: int = Field(..., gt=0, le=5 * 1024 * 1024)  # Max 5MB


class ImageUploadResponse(BaseModel):
    """Response schema for successful image upload."""

    id: int
    location_id: int
    filename: str
    url: str
    content_type: str
    size_bytes: int
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImageUploadError(BaseModel):
    """Response schema for image upload error."""

    error: str
    detail: str


class ImageDeleteResponse(BaseModel):
    """Response schema for image deletion."""

    success: bool
    message: str
    deleted_id: int


class BulkImageUploadResponse(BaseModel):
    """Response schema for bulk image upload."""

    uploaded: list[ImageUploadResponse]
    failed: list[ImageUploadError]
    total_uploaded: int
    total_failed: int
