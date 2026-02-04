"""
SatVach Spatial Search Service
Handles location searches with PostGIS spatial queries and full-text search.
"""

import logging
from typing import TYPE_CHECKING

from geoalchemy2.functions import ST_Distance, ST_DWithin, ST_MakeEnvelope, ST_MakePoint
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.location import Location, LocationCategory, LocationStatus
from src.schemas.location import LocationSearchParams

if TYPE_CHECKING:
    from sqlalchemy.sql import Select

logger = logging.getLogger(__name__)


class SearchService:
    """Service for spatial and text-based location searches."""

    # =========================================================================
    # BE-3.6: ST_DWithin for Radius Search
    # =========================================================================
    def _apply_radius_filter(
        self,
        stmt: "Select",
        latitude: float,
        longitude: float,
        radius_meters: int,
    ) -> "Select":
        """
        Apply radius filter using ST_DWithin.

        This uses the GIST index on locations.geom for efficient queries.
        ST_DWithin returns true if geometries are within the specified distance.

        Args:
            stmt: SQLAlchemy select statement
            latitude: Center point latitude
            longitude: Center point longitude
            radius_meters: Search radius in meters

        Returns:
            Modified select statement with radius filter
        """
        center_point = ST_MakePoint(longitude, latitude)
        return stmt.where(
            ST_DWithin(
                Location.geom,
                func.ST_SetSRID(center_point, 4326),
                radius_meters,
            )
        )

    # =========================================================================
    # BE-3.7: ST_MakeEnvelope for Viewport Lazy Loading
    # =========================================================================
    def _apply_viewport_filter(
        self,
        stmt: "Select",
        min_lng: float,
        min_lat: float,
        max_lng: float,
        max_lat: float,
    ) -> "Select":
        """
        Apply viewport bounding box filter using ST_MakeEnvelope.

        Used for map viewport lazy loading - only fetch locations visible on screen.

        Args:
            stmt: SQLAlchemy select statement
            min_lng: Minimum longitude (west)
            min_lat: Minimum latitude (south)
            max_lng: Maximum longitude (east)
            max_lat: Maximum latitude (north)

        Returns:
            Modified select statement with viewport filter
        """
        envelope = ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
        return stmt.where(func.ST_Intersects(Location.geom, envelope))

    # =========================================================================
    # BE-3.8: PostgreSQL Full-Text Search
    # =========================================================================
    def _apply_text_filter(self, stmt: "Select", query: str) -> "Select":
        """
        Apply full-text search filter using pg_trgm.

        Uses the GIN index on locations.title and locations.description
        for efficient fuzzy text matching.

        Args:
            stmt: SQLAlchemy select statement
            query: Search query string

        Returns:
            Modified select statement with text filter
        """
        search_pattern = f"%{query}%"
        return stmt.where(
            or_(
                Location.title.ilike(search_pattern),
                Location.description.ilike(search_pattern),
            )
        )

    # =========================================================================
    # BE-3.9: Combined Spatial + Text + Category Filters
    # =========================================================================
    async def search(
        self,
        db: AsyncSession,
        params: LocationSearchParams,
    ) -> tuple[list[Location], int]:
        """
        Combined search with spatial, text, and category filters.

        Applies all filters efficiently using PostGIS indexes:
        - Radius filter (GIST index via ST_DWithin)
        - Text filter (GIN index via pg_trgm)
        - Category filter (B-Tree index)
        - Status filter (B-Tree index)

        Args:
            db: Database session
            params: Search parameters

        Returns:
            Tuple of (list of locations, total count)
        """
        # BE-3.10: Use selectinload to avoid N+1 queries
        stmt = select(Location).options(selectinload(Location.images))

        # Apply radius filter (BE-3.6)
        stmt = self._apply_radius_filter(
            stmt,
            params.latitude,
            params.longitude,
            params.radius,
        )

        # Apply category filter if specified
        if params.category:
            stmt = stmt.where(Location.category == params.category)

        # Apply status filter (default: approved only)
        if params.status:
            stmt = stmt.where(Location.status == params.status)

        # Apply text filter if specified (BE-3.8)
        if params.query:
            stmt = self._apply_text_filter(stmt, params.query)

        # Get total count before pagination
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt) or 0

        # Add distance column for sorting
        center_point = func.ST_SetSRID(ST_MakePoint(params.longitude, params.latitude), 4326)
        stmt = stmt.add_columns(ST_Distance(Location.geom, center_point).label("distance_meters"))

        # Order by distance (nearest first)
        stmt = stmt.order_by("distance_meters")

        # Apply pagination
        stmt = stmt.offset(params.skip).limit(params.limit)

        # Execute query
        result = await db.execute(stmt)
        rows = result.all()

        # Extract locations and attach distance
        locations = []
        for row in rows:
            location = row[0]
            location.distance_meters = row[1]  # type: ignore
            locations.append(location)

        logger.info(
            f"Search: {len(locations)}/{total} locations found "
            f"(radius={params.radius}m, category={params.category})"
        )

        return locations, total

    # =========================================================================
    # BE-3.7: Viewport Search for Map Lazy Loading
    # =========================================================================
    async def search_viewport(
        self,
        db: AsyncSession,
        min_lng: float,
        min_lat: float,
        max_lng: float,
        max_lat: float,
        category: LocationCategory | None = None,
        status: LocationStatus = LocationStatus.approved,
        limit: int = 100,
    ) -> list[Location]:
        """
        Search locations within map viewport bounds.

        Used for lazy loading locations as the user pans/zooms the map.

        Args:
            db: Database session
            min_lng: West bound
            min_lat: South bound
            max_lng: East bound
            max_lat: North bound
            category: Optional category filter
            status: Status filter (default: approved)
            limit: Maximum locations to return

        Returns:
            List of locations within viewport
        """
        # BE-3.10: Use selectinload to avoid N+1
        stmt = select(Location).options(selectinload(Location.images))

        # Apply viewport filter (BE-3.7)
        stmt = self._apply_viewport_filter(stmt, min_lng, min_lat, max_lng, max_lat)

        # Apply filters
        if category:
            stmt = stmt.where(Location.category == category)
        stmt = stmt.where(Location.status == status)

        # Limit results
        stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        locations = list(result.scalars().all())

        logger.info(f"Viewport search: {len(locations)} locations found")

        return locations

    # =========================================================================
    # BE-3.6: Simple Radius Search (convenience method)
    # =========================================================================
    async def search_radius(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        category: LocationCategory | None = None,
        status: LocationStatus = LocationStatus.approved,
        limit: int = 50,
    ) -> list[Location]:
        """
        Simple radius search without pagination.

        Convenience method for quick nearby searches.

        Args:
            db: Database session
            latitude: Center latitude
            longitude: Center longitude
            radius_meters: Search radius in meters
            category: Optional category filter
            status: Status filter (default: approved)
            limit: Maximum results

        Returns:
            List of locations sorted by distance
        """
        params = LocationSearchParams(
            latitude=latitude,
            longitude=longitude,
            radius=radius_meters,
            category=category,
            status=status,
            limit=limit,
        )
        locations, _ = await self.search(db, params)
        return locations


# Singleton instance
search_service = SearchService()
