"""add verification fields

Revision ID: 3f1c0443ebf9
Revises: 2e0c0443ebf8
Create Date: 2026-02-08 12:45:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3f1c0443ebf9"
down_revision: str | None = "2e0c0443ebf8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("verification_code", sa.String(length=6), nullable=True))
    op.add_column(
        "users",
        sa.Column("verification_code_expires_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "verification_code_expires_at")
    op.drop_column("users", "verification_code")
