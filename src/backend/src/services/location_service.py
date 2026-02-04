"""
SatVach Location Service
Handles CRUD operations for locations with transaction management.
"""

import logging

from geoalchemy2.functions import ST_MakePoint
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.location import Location, LocationStatus
from src.models.moderation_log import ModerationAction, ModerationLog
from src.schemas.location import LocationCreate, LocationUpdate

logger = logging.getLogger(__name__)


class LocationServiceError(Exception):
    """Base exception for location service errors."""

    pass


class LocationNotFoundError(LocationServiceError):
    """Raised when location is not found."""

    pass


class LocationService:
    """Service for Location CRUD operations with transaction management."""

    # =========================================================================
    # BE-3.11: Create Location with Transaction Management
    # =========================================================================
    async def create(
        self,
        db: AsyncSession,
        data: LocationCreate,
        moderator_ip: str | None = None,
    ) -> Location:
        """
        Create a new location with transaction management.

        Creates the location and an initial moderation log entry atomically.

        Args:
            db: Database session
            data: Location creation data
            moderator_ip: IP address of submitter (optional)

        Returns:
            Created Location object

        Raises:
            LocationServiceError: If creation fails
        """
        try:
            # Create geometry from lat/lng
            geom = func.ST_SetSRID(ST_MakePoint(data.longitude, data.latitude), 4326)

            # Create location
            location = Location(
                title=data.title,
                description=data.description,
                address=data.address,
                category=data.category,
                phone=data.phone,
                website=data.website,
                geom=geom,
                status=LocationStatus.pending,
            )

            db.add(location)
            await db.flush()  # Get location.id before creating log

            # Create initial moderation log
            log = ModerationLog(
                location_id=location.id,
                action=ModerationAction.SUBMITTED,
                reason="Initial submission",
                moderator_ip=moderator_ip,
            )
            db.add(log)

            await db.commit()
            await db.refresh(location)

            logger.info(f"Created location: {location.id} - {location.title}")
            return location

        except IntegrityError as e:
            await db.rollback()
            logger.error(f"Create location failed: {e}")
            raise LocationServiceError(f"Failed to create location: {e}")

    # =========================================================================
    # BE-3.12: Read Location by ID
    # =========================================================================
    async def get_by_id(
        self,
        db: AsyncSession,
        location_id: int,
        include_pending: bool = False,
    ) -> Location:
        """
        Get location by ID with eager loaded relations.

        Args:
            db: Database session
            location_id: Location ID
            include_pending: Whether to include pending/rejected locations

        Returns:
            Location object

        Raises:
            LocationNotFoundError: If location not found
        """
        stmt = (
            select(Location)
            .options(selectinload(Location.images))
            .where(Location.id == location_id)
        )

        if not include_pending:
            stmt = stmt.where(Location.status == LocationStatus.approved)

        result = await db.execute(stmt)
        location = result.scalar_one_or_none()

        if not location:
            raise LocationNotFoundError(f"Location {location_id} not found")

        return location

    # =========================================================================
    # BE-3.13: Update Location
    # =========================================================================
    async def update(
        self,
        db: AsyncSession,
        location_id: int,
        data: LocationUpdate,
        moderator_id: str | None = None,
        moderator_ip: str | None = None,
    ) -> Location:
        """
        Update location with partial data.

        Only updates fields that are explicitly set in the update data.

        Args:
            db: Database session
            location_id: Location ID
            data: Update data (partial)
            moderator_id: Moderator ID (optional)
            moderator_ip: Moderator IP (optional)

        Returns:
            Updated Location object

        Raises:
            LocationNotFoundError: If location not found
        """
        location = await self.get_by_id(db, location_id, include_pending=True)

        # Update only provided fields
        update_data = data.model_dump(exclude_unset=True)

        # Handle lat/lng to geom conversion
        if "latitude" in update_data or "longitude" in update_data:
            lat = update_data.pop("latitude", None)
            lng = update_data.pop("longitude", None)

            if lat is not None and lng is not None:
                location.geom = func.ST_SetSRID(ST_MakePoint(lng, lat), 4326)

        # Apply other updates
        for field, value in update_data.items():
            setattr(location, field, value)

        # Create moderation log
        log = ModerationLog(
            location_id=location.id,
            action=ModerationAction.EDITED,
            reason=f"Updated fields: {', '.join(update_data.keys())}",
            moderator_id=moderator_id,
            moderator_ip=moderator_ip,
        )
        db.add(log)

        await db.commit()
        await db.refresh(location)

        logger.info(f"Updated location: {location.id}")
        return location

    # =========================================================================
    # BE-3.14: Delete Location (Cascade Images via FK)
    # =========================================================================
    async def delete(
        self,
        db: AsyncSession,
        location_id: int,
        moderator_id: str | None = None,
        moderator_ip: str | None = None,
    ) -> bool:
        """
        Delete location and cascade delete images.

        Cascade is handled by database FK constraint (ON DELETE CASCADE).

        Args:
            db: Database session
            location_id: Location ID
            moderator_id: Moderator ID (optional)
            moderator_ip: Moderator IP (optional)

        Returns:
            True if deleted

        Raises:
            LocationNotFoundError: If location not found
        """
        location = await self.get_by_id(db, location_id, include_pending=True)

        # Log before delete (log will be cascade deleted too)
        logger.info(
            f"Deleting location: {location.id} - {location.title} "
            f"(by moderator: {moderator_id or 'unknown'})"
        )

        await db.delete(location)
        await db.commit()

        return True

    # =========================================================================
    # BE-3.15: Moderation Status Handling
    # =========================================================================
    async def update_status(
        self,
        db: AsyncSession,
        location_id: int,
        new_status: LocationStatus,
        reason: str | None = None,
        moderator_id: str | None = None,
        moderator_ip: str | None = None,
    ) -> Location:
        """
        Update location moderation status with audit log.

        Args:
            db: Database session
            location_id: Location ID
            new_status: New status (approved, rejected)
            reason: Reason for status change
            moderator_id: Moderator ID
            moderator_ip: Moderator IP

        Returns:
            Updated Location object
        """
        location = await self.get_by_id(db, location_id, include_pending=True)
        old_status = location.status

        # Update status
        location.status = new_status

        # Determine action type
        if new_status == LocationStatus.approved:
            action = ModerationAction.APPROVED
        elif new_status == LocationStatus.rejected:
            action = ModerationAction.REJECTED
        else:
            action = ModerationAction.EDITED

        # Create moderation log
        log = ModerationLog(
            location_id=location.id,
            action=action,
            reason=reason or f"Status changed: {old_status.value} → {new_status.value}",
            moderator_id=moderator_id,
            moderator_ip=moderator_ip,
        )
        db.add(log)

        await db.commit()
        await db.refresh(location)

        logger.info(f"Location {location.id} status: {old_status.value} → {new_status.value}")
        return location

    # =========================================================================
    # Utility: List All Locations (with pagination)
    # =========================================================================
    async def list_all(
        self,
        db: AsyncSession,
        status: LocationStatus | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Location], int]:
        """
        List all locations with optional status filter.

        Args:
            db: Database session
            status: Filter by status (optional)
            skip: Offset for pagination
            limit: Max results

        Returns:
            Tuple of (locations list, total count)
        """
        stmt = select(Location).options(selectinload(Location.images))

        if status:
            stmt = stmt.where(Location.status == status)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt) or 0

        # Apply pagination
        stmt = stmt.order_by(Location.created_at.desc())
        stmt = stmt.offset(skip).limit(limit)

        result = await db.execute(stmt)
        locations = list(result.scalars().all())

        return locations, total


# Singleton instance
location_service = LocationService()
