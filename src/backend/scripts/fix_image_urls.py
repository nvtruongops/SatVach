"""
Fix image URLs in database - replace minio:9000 with localhost:9000
Run this script after updating S3_PUBLIC_ENDPOINT configuration
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text

from src.db.session import async_session_maker


async def fix_image_urls():
    """Update all image URLs from minio:9000 to localhost:9000"""
    async with async_session_maker() as session:
        # Fix Image table URLs
        result = await session.execute(
            text(
                "UPDATE images SET url = REPLACE(url, 'minio:9000', 'localhost:9000') WHERE url LIKE '%minio:9000%'"
            )
        )
        images_updated = result.rowcount

        # Fix User avatar URLs
        result = await session.execute(
            text(
                "UPDATE users SET avatar_url = REPLACE(avatar_url, 'minio:9000', 'localhost:9000') WHERE avatar_url LIKE '%minio:9000%'"
            )
        )
        avatars_updated = result.rowcount

        await session.commit()

        print(f"✅ Updated {images_updated} image URLs")
        print(f"✅ Updated {avatars_updated} avatar URLs")
        print("✅ All URLs now use localhost:9000")


if __name__ == "__main__":
    asyncio.run(fix_image_urls())
