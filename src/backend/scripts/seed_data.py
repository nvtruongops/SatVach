import asyncio
import os
import random
import sys

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.core.config import settings
from src.models.location import Location, LocationCategory, LocationStatus


async def seed_locations(count=1000):
    print(f"Seeding {count} locations...")

    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        locations = []
        for i in range(count):
            # Hanoi generic coords (approx)
            # Lat: 20.9 - 21.1
            # Lng: 105.7 - 105.9
            lat = 20.95 + random.random() * 0.15
            lng = 105.75 + random.random() * 0.15

            loc = Location(
                title=f"Seed Location {i}",
                description=f"Auto-generated for testing index performance #{i}",
                category=random.choice(list(LocationCategory)),
                status=LocationStatus.approved,  # Pre-approve for search tests
                address=f"{random.randint(1, 999)} Seed Street, Hanoi",
                geom=f"POINT({lng} {lat})",
            )
            locations.append(loc)

            if len(locations) >= 100:
                session.add_all(locations)
                await session.commit()
                locations = []
                print(f"Committed batch... ({i + 1}/{count})")

        if locations:
            session.add_all(locations)
            await session.commit()

    print("Seeding completed!")
    await engine.dispose()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_locations())
