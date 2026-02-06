from unittest.mock import ANY, AsyncMock, MagicMock, patch

import pytest

from src.schemas.location import LocationCategory, LocationCreate
from src.services.location_service import LocationService
from src.services.storage_service import StorageService


class TestLocationService:
    @pytest.mark.asyncio
    async def test_create_location(self, mock_db_session):
        """Test creating a location calls DB add and commit."""
        # Setup
        # LocationService is a singleton but we can instantiate a new one for testing
        # or use the import. Since it has no state, new instance is fine.
        service = LocationService()

        location_in = LocationCreate(
            title="New Café", latitude=10.0, longitude=106.0, category=LocationCategory.cafe
        )

        # Execute
        result = await service.create(mock_db_session, location_in)

        # Verify
        assert result.title == "New Café"
        # Check that we added the location and the log
        assert mock_db_session.add.call_count == 2
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()


class TestStorageService:
    @pytest.mark.asyncio
    async def test_upload_image(self, mock_s3_client):
        """Test upload image calls S3 client."""

        # We need to patch _get_client to return our mock
        # method _get_client is async and returns an async context manager

        # Create a mock async context manager for the client
        mock_client_ctx = AsyncMock()
        mock_client_ctx.__aenter__.return_value = mock_s3_client
        mock_client_ctx.__aexit__.return_value = None

        with patch.object(StorageService, "_get_client", return_value=mock_client_ctx):
            # We need to mock settings too if we instantiate StorageService,
            # OR we can assume env vars are present or handled by pydantic defaults/mocked conftest.
            # But StorageService.__init__ reads settings.
            # Let's patch settings where it is used in StorageService.
            with patch("src.services.storage_service.settings") as mock_settings:
                mock_settings.S3_BUCKET = "test-bucket"
                mock_settings.S3_ENDPOINT = "http://test-minio"
                mock_settings.S3_ACCESS_KEY = "key"
                mock_settings.S3_SECRET_KEY = "secret"

                service = StorageService()

                # Prepare input
                file_obj = MagicMock()
                file_obj.read.return_value = b"fake-image-content"

                # We need to pass valid magic bytes or mock validate_file_type
                # Let's mock validate_file_type and optimize_image to simplify testing just the upload logic

                with patch.object(service, "validate_file_type", return_value="image/jpeg"):
                    with patch.object(service, "validate_file_size"):
                        with patch.object(
                            service, "optimize_image", return_value=(b"optimized", "image/webp")
                        ):
                            # Execute
                            result = await service.upload_image(
                                content=b"fake-content",
                                original_filename="test.jpg",
                                content_type="image/jpeg",
                            )

                            # Verify
                            assert result["s3_key"].startswith("images/")
                            assert result["content_type"] == "image/webp"

                            # Check S3 put_object called
                            mock_s3_client.put_object.assert_called_once_with(
                                Bucket="test-bucket",
                                Key=ANY,
                                Body=b"optimized",
                                ContentType="image/webp",
                            )
