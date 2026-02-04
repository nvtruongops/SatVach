"""
SatVach Location Schemas
Pydantic schemas for Location API endpoints.
"""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.models.location import LocationCategory, LocationStatus


# Custom validators
def validate_latitude(value: float) -> float:
    """Validate latitude is within valid range."""
    if not -90 <= value <= 90:
        raise ValueError("Latitude must be between -90 and 90")
    return value


def validate_longitude(value: float) -> float:
    """Validate longitude is within valid range."""
    if not -180 <= value <= 180:
        raise ValueError("Longitude must be between -180 and 180")
    return value


# Type aliases with constraints
Title = Annotated[str, Field(min_length=1, max_length=200)]
Description = Annotated[str | None, Field(max_length=2000)]
Address = Annotated[str | None, Field(max_length=500)]
Phone = Annotated[str | None, Field(max_length=20, pattern=r"^[\d\s\+\-\(\)]*$")]
Website = Annotated[str | None, Field(max_length=500)]


class LocationBase(BaseModel):
    """Base schema for Location with common fields."""

    title: Title
    description: Description = None
    address: Address = None
    category: LocationCategory = LocationCategory.other
    phone: Phone = None
    website: Website = None


class LocationCreate(LocationBase):
    """Schema for creating a new location."""

    latitude: float = Field(..., ge=-90, le=90, description="Latitude in WGS84")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in WGS84")

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        return validate_latitude(v)

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        return validate_longitude(v)


class LocationUpdate(BaseModel):
    """Schema for updating a location (all fields optional)."""

    title: Title | None = None
    description: Description = None
    address: Address = None
    category: LocationCategory | None = None
    phone: Phone = None
    website: Website = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float | None) -> float | None:
        if v is not None:
            return validate_latitude(v)
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float | None) -> float | None:
        if v is not None:
            return validate_longitude(v)
        return v


class LocationInDB(LocationBase):
    """Schema for Location as stored in database."""

    id: int
    status: LocationStatus
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImageResponse(BaseModel):
    """Schema for image in location response."""

    id: int
    filename: str
    url: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class LocationResponse(LocationInDB):
    """Schema for Location API response."""

    images: list[ImageResponse] = []
    distance_meters: float | None = None  # Populated in search results

    model_config = ConfigDict(from_attributes=True)


class LocationSearchParams(BaseModel):
    """Query parameters for location search."""

    # Center point for radius search
    latitude: float = Field(..., ge=-90, le=90, description="Center latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Center longitude")

    # Search radius in meters (500m to 50km)
    radius: int = Field(
        default=5000,
        ge=500,
        le=50000,
        description="Search radius in meters",
    )

    # Optional filters
    category: LocationCategory | None = None
    status: LocationStatus | None = Field(default=LocationStatus.approved)
    query: str | None = Field(None, max_length=200, description="Text search query")

    # Pagination
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        return validate_latitude(v)

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        return validate_longitude(v)


class LocationListResponse(BaseModel):
    """Paginated list of locations."""

    items: list[LocationResponse]
    total: int
    skip: int
    limit: int
