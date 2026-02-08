"""
SatVach Location Model
Main entity for hyperlocal listings with PostGIS geography support.
"""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from geoalchemy2 import Geography, Geometry
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy import (
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.image import Image
    from src.models.moderation_log import ModerationLog
    from src.models.user import User


class LocationStatus(str, Enum):
    """Status of a location listing."""

    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LocationCategory(str, Enum):
    """Categories for location listings."""

    food = "food"
    cafe = "cafe"
    shop = "shop"
    service = "service"
    entertainment = "entertainment"
    health = "health"
    education = "education"
    travel = "travel"
    other = "other"


class Location(Base):
    """
    Location model representing a hyperlocal listing.
    Uses PostGIS Geography type for accurate spatial queries.
    """

    __tablename__ = "locations"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Basic info
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Category and status
    category: Mapped[LocationCategory] = mapped_column(
        SQLEnum(LocationCategory, name="location_category"),
        nullable=False,
        default=LocationCategory.other,
        index=True,
    )
    status: Mapped[LocationStatus] = mapped_column(
        SQLEnum(LocationStatus, name="location_status"),
        nullable=False,
        default=LocationStatus.pending,
        index=True,
    )

    # PostGIS Geography column (POINT, SRID 4326 = WGS84)
    geom: Mapped[Geography] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
    )

    # Contact info (optional)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    user: Mapped["User"] = relationship("User", back_populates="locations", lazy="selectin")

    images: Mapped[list["Image"]] = relationship(
        "Image",
        back_populates="location",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    moderation_logs: Mapped[list["ModerationLog"]] = relationship(
        "ModerationLog",
        back_populates="location",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    # Computed fields for Pydantic serialization
    latitude: Mapped[float] = column_property(func.ST_Y(func.cast(geom, Geometry)))
    longitude: Mapped[float] = column_property(func.ST_X(func.cast(geom, Geometry)))

    def __repr__(self) -> str:
        return f"<Location(id={self.id}, title='{self.title}', status={self.status.value})>"
