"""
SatVach ModerationLog Model
Audit trail for location moderation actions.
"""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.location import Location


class ModerationAction(str, Enum):
    """Types of moderation actions."""

    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    edited = "edited"
    deleted = "deleted"


class ModerationLog(Base):
    """
    ModerationLog model for audit trail.
    Records all moderation actions on locations.
    """

    __tablename__ = "moderation_logs"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Foreign key to location
    location_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Moderation details
    action: Mapped[ModerationAction] = mapped_column(
        SQLEnum(ModerationAction, name="moderation_action"),
        nullable=False,
        index=True,
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Moderator info (for future auth integration)
    moderator_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    moderator_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv6 max length

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # Relationship back to location
    location: Mapped["Location"] = relationship(
        "Location",
        back_populates="moderation_logs",
    )

    def __repr__(self) -> str:
        return (
            f"<ModerationLog(id={self.id}, action={self.action.value}, "
            f"location_id={self.location_id})>"
        )
