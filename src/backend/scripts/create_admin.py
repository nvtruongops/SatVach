"""
Script to create an admin user.
Run with: python scripts/create_admin.py [username] [email] [password]
"""

import asyncio
import os
import sys

sys.path.append(os.getcwd())

try:
    from sqlalchemy import select

    from src.core.security import get_password_hash
    from src.db.session import async_session_maker
    from src.models.user import User
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)


async def create_admin():
    async with async_session_maker() as session:
        # Get args or defaults
        username = sys.argv[1] if len(sys.argv) > 1 else "admin"
        email = sys.argv[2] if len(sys.argv) > 2 else "admin@satvach.com"
        password = sys.argv[3] if len(sys.argv) > 3 else "password"

        print(f"Creating/Checking admin user: {username} ({email})")

        # Check if user exists
        stmt = select(User).where(User.username == username)
        result = await session.execute(stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"User '{username}' already exists.")
            return

        hashed_password = get_password_hash(password)

        new_admin = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_superuser=True,
            is_active=True,
        )

        session.add(new_admin)
        try:
            await session.commit()
            print(f"Admin user '{username}' created successfully.")
        except Exception as e:
            print(f"Error creating admin: {e}")
            await session.rollback()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_admin())
