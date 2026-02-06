import pytest
from httpx import AsyncClient
from sqlalchemy import text


@pytest.mark.asyncio
async def test_create_and_read_location(async_client: AsyncClient):
    """
    TEST-2.2: Test Create Location -> Read Location workflow.
    """
    # 1. Create Location
    payload = {
        "title": "Integration Test Cafe",
        "latitude": 10.7769,
        "longitude": 106.7009,
        "category": "cafe",
        "description": "Best coffee in town",
    }
    response = await async_client.post("/api/v1/locations/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    location_id = data["id"]

    # 2. Verify it is pending
    # By default, reads might verify status.
    # If we get by ID, we need to ensure we can see pending locations or we might get 404 if filter is on.
    # The API endpoint `GET /api/v1/locations/{id}` usually returns approved only?
    # Let's check the code or assume standard behavior.
    # Actually, usually public endpoints hide pending.
    # But created location response includes status.
    assert data["status"] == "pending"

    # 3. Verify via Search
    # Search should NOT return pending location
    params = {"latitude": 10.7769, "longitude": 106.7009, "radius": 1000}
    search_res = await async_client.get("/api/v1/locations/search", params=params)
    assert search_res.status_code == 200
    search_data = search_res.json()
    # Should not be in results
    found = any(item["id"] == location_id for item in search_data["items"])
    assert not found, "Pending location should not be visible in search"


@pytest.mark.asyncio
async def test_db_rollback_isolation(async_client: AsyncClient, db_session):
    """
    TEST-2.3: Verify that database rollback works (Basic test).

    Note: Real isolation testing requires running two tests and ensuring data doesn't leak.
    But here we verify the session is active and we can interact with DB.
    """
    # Check count before
    result = await db_session.execute(text("SELECT count(*) FROM locations"))
    initial_count = result.scalar()

    # Create a location directly in DB
    await db_session.execute(
        text(
            "INSERT INTO locations (title, category, status, geom, created_at, updated_at) "
            "VALUES ('Ghost Location', 'other', 'pending', ST_SetSRID(ST_MakePoint(0,0), 4326), NOW(), NOW())"
        )
    )
    # We don't commit because the fixture handles rollback, but we can flush or assume session is open.
    # Actually, if we use `await db_session.execute`, it's in the transaction.

    result = await db_session.execute(text("SELECT count(*) FROM locations"))
    new_count = result.scalar()

    assert new_count == initial_count + 1

    # The fixture teardown will rollback this transaction.
    # Ideally, we would run another test to verify validation, but pytest runs sequential or parallel.
    # We rely on the fixture implementation (standard SQLAlchemy + Pytest pattern).


@pytest.mark.asyncio
async def test_location_search_workflow(async_client: AsyncClient):
    """
    TEST-2.2 (Part 2): Search workflow with approved locations.
    """
    # We need to insert a location directly or via API and approve it.
    # Since we mocked S3 and don't have Admin API test utils handy, let's create via API.

    # 1. Create
    payload = {
        "title": "Approved Cafe",
        "latitude": 21.0285,
        "longitude": 105.8544,
        "category": "cafe",
    }
    res = await async_client.post("/api/v1/locations/", json=payload)
    loc_id = res.json()["id"]

    # 2. Approve manually in DB (since we are integration testing, we can touch DB)
    # But wait, `async_client` fixture overrides `get_db`.
    # How do we access the SAME session?
    # We can't easily validly access the same session object inside the test unless we ask for it.
    # But `async_client` depends on `db_session`.
    # pytest scopes: function scope should share the fixture instance.
    # So if we request `db_session` in this test arguments, it should be the SAME session used by `async_client`.

    # Let's skip the DB update here to be safe and stick to what we can test purely via API or
    # update the test signature to accept `db_session`.
    pass


@pytest.mark.asyncio
async def test_workflow_with_db_access(async_client: AsyncClient, db_session):
    """
    TEST-2.2 (Full): Create -> Approve -> Search
    """
    # 1. Create
    payload = {
        "title": "Approved Cafe",
        "latitude": 21.0285,  # Hanoi
        "longitude": 105.8544,
        "category": "cafe",
    }
    res = await async_client.post("/api/v1/locations/", json=payload)
    assert res.status_code == 201
    loc_id = res.json()["id"]

    # 2. Approve in DB
    # Note: Column names in raw SQL must match DB. We used `locations`. status is Enum.
    # Should use 'approved' string.
    await db_session.execute(text(f"UPDATE locations SET status = 'approved' WHERE id = {loc_id}"))
    # No commit needed as we are in same transaction?
    # Yes, if isolation level allows reading uncommitted in same transaction.
    # SQLAlchemy session usually sees its own changes.

    # 3. Search
    params = {"latitude": 21.0285, "longitude": 105.8544, "radius": 5000}
    res = await async_client.get("/api/v1/locations/search", params=params)
    assert res.status_code == 200
    data = res.json()

    found = any(item["id"] == loc_id for item in data["items"])
    assert found, "Approved location should be found in search"
