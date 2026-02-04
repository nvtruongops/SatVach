"""Initial migration for locations, images, moderation_logs

Revision ID: 001_initial
Revises:
Create Date: 2026-02-04

"""

from collections.abc import Sequence

import geoalchemy2
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create locations, images, and moderation_logs tables with indexes."""

    # Ensure PostGIS and pg_trgm extensions are available
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Create ENUM types using raw SQL with IF NOT EXISTS pattern
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_category') THEN
                CREATE TYPE location_category AS ENUM (
                    'food', 'cafe', 'shop', 'service',
                    'entertainment', 'health', 'education', 'other'
                );
            END IF;
        END$$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_status') THEN
                CREATE TYPE location_status AS ENUM ('pending', 'approved', 'rejected');
            END IF;
        END$$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_action') THEN
                CREATE TYPE moderation_action AS ENUM (
                    'submitted', 'approved', 'rejected', 'edited', 'deleted'
                );
            END IF;
        END$$;
    """)

    # =====================
    # Create locations table
    # =====================
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column(
            "category",
            postgresql.ENUM(
                "food",
                "cafe",
                "shop",
                "service",
                "entertainment",
                "health",
                "education",
                "other",
                name="location_category",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending",
                "approved",
                "rejected",
                name="location_status",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "geom",
            geoalchemy2.types.Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
        ),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("website", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # B-Tree indexes (DB-2.4)
    op.create_index("ix_locations_title", "locations", ["title"], unique=False)
    op.create_index("ix_locations_category", "locations", ["category"], unique=False)
    op.create_index("ix_locations_status", "locations", ["status"], unique=False)
    op.create_index("ix_locations_created_at", "locations", ["created_at"], unique=False)

    # GIST spatial index (DB-2.2) - CRITICAL for spatial queries
    op.create_index(
        "idx_locations_geom", "locations", ["geom"], unique=False, postgresql_using="gist"
    )

    # GIN index for Full-Text Search (DB-2.3)
    # Using pg_trgm for fuzzy text search on title and description
    op.execute("""
        CREATE INDEX ix_locations_fts
        ON locations
        USING gin (title gin_trgm_ops)
    """)
    op.execute("""
        CREATE INDEX ix_locations_description_fts
        ON locations
        USING gin (description gin_trgm_ops)
        WHERE description IS NOT NULL
    """)

    # ==================
    # Create images table
    # ==================
    op.create_table(
        "images",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("s3_key", sa.String(length=500), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("content_type", sa.String(length=50), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("s3_key"),
    )

    op.create_index("ix_images_location_id", "images", ["location_id"], unique=False)

    # ===========================
    # Create moderation_logs table
    # ===========================
    op.create_table(
        "moderation_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column(
            "action",
            postgresql.ENUM(
                "submitted",
                "approved",
                "rejected",
                "edited",
                "deleted",
                name="moderation_action",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("moderator_id", sa.String(length=100), nullable=True),
        sa.Column("moderator_ip", sa.String(length=45), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_moderation_logs_location_id", "moderation_logs", ["location_id"], unique=False
    )
    op.create_index("ix_moderation_logs_action", "moderation_logs", ["action"], unique=False)
    op.create_index(
        "ix_moderation_logs_created_at", "moderation_logs", ["created_at"], unique=False
    )


def downgrade() -> None:
    """Drop all tables and types."""

    # Drop tables (in reverse order due to foreign keys)
    op.drop_table("moderation_logs")
    op.drop_table("images")
    op.drop_table("locations")

    # Drop ENUM types
    op.execute("DROP TYPE IF EXISTS moderation_action")
    op.execute("DROP TYPE IF EXISTS location_status")
    op.execute("DROP TYPE IF EXISTS location_category")
