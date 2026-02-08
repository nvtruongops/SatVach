"""
User Service
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.schemas.user import UserUpdate


class UserService:
    async def get(self, db: AsyncSession, id: int) -> User | None:
        return await db.get(User, id)

    async def list_all(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> tuple[list[User], int]:
        query = select(User).offset(skip).limit(limit)
        result = await db.execute(query)
        items = result.scalars().all()

        total_query = select(func.count()).select_from(User)
        total_result = await db.execute(total_query)
        total = total_result.scalar_one()

        return list(items), total

    async def update(self, db: AsyncSession, *, db_obj: User, obj_in: UserUpdate | dict) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_status(self, db: AsyncSession, id: int, is_active: bool) -> User | None:
        user = await self.get(db, id)
        if not user:
            return None

        user.is_active = is_active
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


user_service = UserService()
