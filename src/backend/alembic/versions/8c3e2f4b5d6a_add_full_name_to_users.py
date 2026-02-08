"""add full_name to users table

Revision ID: 8c3e2f4b5d6a
Revises: 7b2d1f3a4c5e
Create Date: 2026-02-08 14:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "8c3e2f4b5d6a"
down_revision = "7b2d1f3a4c5e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "full_name")
