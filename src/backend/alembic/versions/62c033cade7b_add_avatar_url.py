"""add_avatar_url

Revision ID: 62c033cade7b
Revises: 3f1c0443ebf9
Create Date: 2026-02-08 14:05:25.267540

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "62c033cade7b"
down_revision: str | Sequence[str] | None = "3f1c0443ebf9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "avatar_url")
