"""
SatVach Storage Service
Handles image upload, validation, optimization, and S3/MinIO operations.
"""

import io
import logging
from uuid import uuid4

import aioboto3
from botocore.exceptions import ClientError
from PIL import Image

from src.core.config import settings

logger = logging.getLogger(__name__)

# Constants
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_DIMENSION = 1920  # Max width/height after optimization
JPEG_QUALITY = 85
PRESIGNED_URL_EXPIRY = 3600  # 1 hour

# Magic bytes for file type validation
MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",  # WebP starts with RIFF
}


class StorageServiceError(Exception):
    """Base exception for storage service errors."""

    pass


class InvalidFileTypeError(StorageServiceError):
    """Raised when file type is not allowed."""

    pass


class FileTooLargeError(StorageServiceError):
    """Raised when file exceeds size limit."""

    pass


class StorageService:
    """Service for handling image storage with MinIO/S3."""

    def __init__(self):
        self.bucket = settings.S3_BUCKET
        self.endpoint = settings.S3_ENDPOINT
        self.access_key = settings.S3_ACCESS_KEY
        self.secret_key = settings.S3_SECRET_KEY

    def _get_session(self) -> aioboto3.Session:
        """Get aioboto3 session."""
        return aioboto3.Session()

    async def _get_client(self):
        """Get S3 client context manager."""
        session = self._get_session()
        return session.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
        )

    # =========================================================================
    # BE-3.1: File Type Validation
    # =========================================================================
    def validate_file_type(self, content: bytes, content_type: str | None = None) -> str:
        """
        Validate file type using magic bytes (more secure than content-type header).

        Args:
            content: File content as bytes
            content_type: Optional content-type from header (used as fallback)

        Returns:
            Detected content type

        Raises:
            InvalidFileTypeError: If file type is not allowed
        """
        # Check magic bytes
        for magic, mime_type in MAGIC_BYTES.items():
            if content.startswith(magic):
                if mime_type in ALLOWED_CONTENT_TYPES:
                    return mime_type

        # Special handling for WebP (RIFF....WEBP)
        if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
            return "image/webp"

        # Fallback to content-type header if magic bytes don't match
        if content_type and content_type in ALLOWED_CONTENT_TYPES:
            logger.warning(f"Magic bytes not detected, using content-type: {content_type}")
            return content_type

        raise InvalidFileTypeError(
            f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    # =========================================================================
    # BE-3.2: File Size Validation
    # =========================================================================
    def validate_file_size(self, content: bytes) -> int:
        """
        Validate file size.

        Args:
            content: File content as bytes

        Returns:
            File size in bytes

        Raises:
            FileTooLargeError: If file exceeds MAX_FILE_SIZE
        """
        size = len(content)
        if size > MAX_FILE_SIZE:
            raise FileTooLargeError(
                f"File too large: {size / 1024 / 1024:.2f}MB. Max: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        return size

    # =========================================================================
    # BE-3.3: Image Optimization with Pillow
    # =========================================================================
    def optimize_image(
        self,
        content: bytes,
        max_dimension: int = MAX_IMAGE_DIMENSION,
        quality: int = JPEG_QUALITY,
    ) -> tuple[bytes, str]:
        """
        Optimize image by resizing and compressing.

        Args:
            content: Original image bytes
            max_dimension: Maximum width/height (preserves aspect ratio)
            quality: JPEG/WebP quality (1-100)

        Returns:
            Tuple of (optimized bytes, content_type)
        """
        image = Image.open(io.BytesIO(content))

        # Convert RGBA to RGB for JPEG output
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        # Resize if needed (preserve aspect ratio)
        width, height = image.size
        if width > max_dimension or height > max_dimension:
            if width > height:
                new_width = max_dimension
                new_height = int(height * (max_dimension / width))
            else:
                new_height = max_dimension
                new_width = int(width * (max_dimension / height))
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")

        # Save as WebP for best compression
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=quality, optimize=True)
        output.seek(0)

        return output.read(), "image/webp"

    # =========================================================================
    # BE-3.1 + BE-3.2 + BE-3.3 Combined: Upload Image
    # =========================================================================
    async def upload_image(
        self,
        content: bytes,
        original_filename: str,
        content_type: str | None = None,
        optimize: bool = True,
    ) -> dict:
        """
        Upload image to S3/MinIO with validation and optional optimization.

        Args:
            content: File content as bytes
            original_filename: Original filename from upload
            content_type: Content-type header (optional)
            optimize: Whether to optimize the image (default True)

        Returns:
            Dict with s3_key, url, content_type, size_bytes

        Raises:
            InvalidFileTypeError: If file type not allowed
            FileTooLargeError: If file too large
            StorageServiceError: If upload fails
        """
        # Validate file type (BE-3.1)
        detected_type = self.validate_file_type(content, content_type)

        # Validate file size (BE-3.2)
        self.validate_file_size(content)

        # Optimize image (BE-3.3)
        if optimize:
            content, detected_type = self.optimize_image(content)

        # Generate unique S3 key
        ext = "webp" if optimize else original_filename.split(".")[-1].lower()
        s3_key = f"images/{uuid4()}.{ext}"

        # Upload to S3
        try:
            async with await self._get_client() as s3:
                await s3.put_object(
                    Bucket=self.bucket,
                    Key=s3_key,
                    Body=content,
                    ContentType=detected_type,
                )
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise StorageServiceError(f"Upload failed: {e}")

        # Build public URL
        url = f"{self.endpoint}/{self.bucket}/{s3_key}"

        return {
            "s3_key": s3_key,
            "url": url,
            "content_type": detected_type,
            "size_bytes": len(content),
            "filename": f"{uuid4()}.{ext}",
        }

    # =========================================================================
    # BE-3.4: Delete Image
    # =========================================================================
    async def delete_image(self, s3_key: str) -> bool:
        """
        Delete image from S3/MinIO.

        Args:
            s3_key: S3 object key to delete

        Returns:
            True if deleted successfully

        Raises:
            StorageServiceError: If delete fails
        """
        try:
            async with await self._get_client() as s3:
                await s3.delete_object(Bucket=self.bucket, Key=s3_key)
                logger.info(f"Deleted image: {s3_key}")
                return True
        except ClientError as e:
            logger.error(f"S3 delete failed: {e}")
            raise StorageServiceError(f"Delete failed: {e}")

    # =========================================================================
    # BE-3.5: Get Presigned URL
    # =========================================================================
    async def get_presigned_url(self, s3_key: str, expiry: int = PRESIGNED_URL_EXPIRY) -> str:
        """
        Generate a presigned URL for temporary access.

        Args:
            s3_key: S3 object key
            expiry: URL expiry time in seconds (default 1 hour)

        Returns:
            Presigned URL string

        Raises:
            StorageServiceError: If URL generation fails
        """
        try:
            async with await self._get_client() as s3:
                url = await s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket, "Key": s3_key},
                    ExpiresIn=expiry,
                )
                return url
        except ClientError as e:
            logger.error(f"Presigned URL generation failed: {e}")
            raise StorageServiceError(f"Failed to generate URL: {e}")

    # =========================================================================
    # Utility: Ensure Bucket Exists
    # =========================================================================
    async def ensure_bucket_exists(self) -> None:
        """Create bucket if it doesn't exist."""
        try:
            async with await self._get_client() as s3:
                try:
                    await s3.head_bucket(Bucket=self.bucket)
                except ClientError:
                    await s3.create_bucket(Bucket=self.bucket)
                    logger.info(f"Created bucket: {self.bucket}")
        except ClientError as e:
            logger.error(f"Bucket check failed: {e}")
            raise StorageServiceError(f"Bucket operation failed: {e}")


# Singleton instance
storage_service = StorageService()
