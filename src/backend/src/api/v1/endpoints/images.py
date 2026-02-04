"""
Images API Endpoints
"""

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from src.core.rate_limit import limiter
from src.services.storage_service import FileTooLargeError, InvalidFileTypeError, storage_service

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Upload an image for a location.

    Validates file type (JPEG/PNG/WebP) and size (max 5MB).
    Optimizes the image and stores it in MinIO.
    """
    try:
        content = await file.read()

        result = await storage_service.upload_image(
            content=content,
            original_filename=file.filename or "image",
            content_type=file.content_type,
            optimize=True,
        )

        return result

    except InvalidFileTypeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except FileTooLargeError as e:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload failed"
        )
