import pytest
from pydantic import ValidationError

from src.schemas.location import LocationCategory, LocationCreate, LocationSearchParams


class TestLocationSchemas:
    def test_location_create_valid(self):
        """Test creating a location with valid data."""
        data = {
            "title": "Test Location",
            "latitude": 10.762622,
            "longitude": 106.660172,
            "category": LocationCategory.cafe,
        }
        loc = LocationCreate(**data)
        assert loc.title == "Test Location"
        assert loc.latitude == 10.762622
        assert loc.category == LocationCategory.cafe

    def test_location_create_invalid_latitude(self):
        """Test validation error for latitude out of range."""
        data = {
            "title": "Invalid Lat",
            "latitude": 91.0,  # Invalid
            "longitude": 106.660172,
        }
        with pytest.raises(ValidationError) as excinfo:
            LocationCreate(**data)
        error_msg = str(excinfo.value)
        # Check for either Pydantic default or custom validator message
        assert "less than or equal to 90" in error_msg or "Latitude must be between" in error_msg

    def test_location_create_invalid_longitude(self):
        """Test validation error for longitude out of range."""
        data = {
            "title": "Invalid Lng",
            "latitude": 10.762622,
            "longitude": -181.0,  # Invalid
        }
        with pytest.raises(ValidationError) as excinfo:
            LocationCreate(**data)
        error_msg = str(excinfo.value)
        assert (
            "greater than or equal to -180" in error_msg or "Longitude must be between" in error_msg
        )

    def test_location_search_params_defaults(self):
        """Test default values for search params."""
        data = {"latitude": 10.0, "longitude": 106.0}
        params = LocationSearchParams(**data)
        assert params.radius == 5000  # Default 5km
        assert params.skip == 0
        assert params.limit == 20

    def test_location_search_params_radius_bounds(self):
        """Test radius limits."""
        # Too small
        with pytest.raises(ValidationError):
            LocationSearchParams(latitude=10, longitude=10, radius=100)

        # Too large
        with pytest.raises(ValidationError):
            LocationSearchParams(latitude=10, longitude=10, radius=60000)

        # Valid
        params = LocationSearchParams(latitude=10, longitude=10, radius=1000)
        assert params.radius == 1000
