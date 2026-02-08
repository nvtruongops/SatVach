"""add_user_to_location_fixed

Revision ID: 5a7ac5db3520
Revises: 62c033cade7b
Create Date: 2026-02-08 15:40:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5a7ac5db3520"
down_revision: str | Sequence[str] | None = "62c033cade7b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add user_id column to locations table."""
    # Add user_id column (nullable first to allow existing data)
    op.add_column("locations", sa.Column("user_id", sa.Integer(), nullable=True))

    # Create index
    op.create_index(op.f("ix_locations_user_id"), "locations", ["user_id"], unique=False)

    # Create foreign key
    op.create_foreign_key("fk_locations_user_id", "locations", "users", ["user_id"], ["id"])

    # Set default user_id to 1 (admin) for existing locations
    op.execute("UPDATE locations SET user_id = 1 WHERE user_id IS NULL")

    # Make user_id NOT NULL after setting defaults
    op.alter_column("locations", "user_id", nullable=False)


def downgrade() -> None:
    """Remove user_id column from locations table."""
    op.drop_constraint("fk_locations_user_id", "locations", type_="foreignkey")
    op.drop_index(op.f("ix_locations_user_id"), table_name="locations")
    op.drop_column("locations", "user_id")
