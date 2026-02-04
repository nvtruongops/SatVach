import os

import requests

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"


def log(msg, status="INFO"):
    print(f"[{status}] {msg}")


def test_api_docs():
    log("Verifying /docs existence...")
    try:
        r = requests.get(f"{BASE_URL}/docs")
        if r.status_code == 200:
            log("/docs is accessible", "PASS")
        else:
            log(f"/docs returned {r.status_code}", "FAIL")
    except Exception as e:
        log(f"Connection failed: {e}", "FAIL")


def test_health():
    log("Verifying /health...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            log("/health is accessible", "PASS")
        else:
            log(f"/health returned {r.status_code}", "FAIL")
    except Exception as e:
        log(f"Connection failed: {e}", "FAIL")


def test_create_location_and_search():
    log("Verifying Create Location and Search...")
    loc_data = {
        "title": "Test Location",
        "description": "A test location for verification",
        "category": "cafe",
        "latitude": 10.7769,
        "longitude": 106.7009,
        "address": "123 Test St",
    }

    loc_id = None
    try:
        # Create
        r = requests.post(f"{API_URL}/locations", json=loc_data)
        if r.status_code in [200, 201]:
            data = r.json()
            loc_id = data.get("id")
            log(f"Location created with ID: {loc_id}", "PASS")
        else:
            log(f"Create Location failed: {r.status_code} {r.text}", "FAIL")
            return loc_id

        # Search
        # Wait a bit? Maybe index is immediate?
        search_params = {"latitude": 10.7769, "longitude": 106.7009, "radius": 1000}
        r_search = requests.get(f"{API_URL}/locations/search", params=search_params)
        if r_search.status_code == 200:
            results = r_search.json()
            if isinstance(results, list) and len(results) > 0:
                log(f"Spatial search returned {len(results)} results", "PASS")
            else:
                log(f"Spatial search returned empty: {results}", "WARN")
        else:
            log(f"Search failed: {r_search.status_code}", "FAIL")

    except Exception as e:
        log(f"Create/Search failed: {e}", "FAIL")
    return loc_id


def test_image_upload(loc_id):
    if not loc_id:
        log("Skipping Image Upload (no location ID)", "WARN")
        return

    log("Verifying Image Upload...")
    # Create dummy image
    dummy_image_path = "test_image.jpg"
    with open(dummy_image_path, "wb") as f:
        f.write(os.urandom(1024))  # 1KB random data

    try:
        files = {"file": ("test_image.jpg", open(dummy_image_path, "rb"), "image/jpeg")}
        # Adjust endpoint if needed. Maybe it needs location_id as query or path?
        # Task: BE-4.5 POST /api/v1/images/upload
        # Usually requires location_id

        # Checking if location_id is needed in params or body
        # I'll try params
        r = requests.post(
            f"{API_URL}/images/upload", files=files, params={"location_id": loc_id}
        )

        if r.status_code in [200, 201]:
            log("Image upload successful", "PASS")
        else:
            log(f"Image upload failed: {r.status_code} {r.text}", "FAIL")
    except Exception as e:
        log(f"Image upload exec failed: {e}", "FAIL")
    finally:
        if os.path.exists(dummy_image_path):
            os.remove(dummy_image_path)


def test_rate_limiting():
    log("Verifying Rate Limiting (100 req/min)...")
    count = 0
    # Use a cheap endpoint
    for i in range(120):
        try:
            r = requests.get(
                f"{API_URL}/locations/viewport?north=11&south=10&east=107&west=106"
            )
            if r.status_code == 429:
                log(f"Rate limiting active after {i + 1} requests", "PASS")
                return
            count += 1
        except:
            break
    log(f"Rate limiting NOT active after {count} requests", "FAIL")


def test_cors():
    log("Verifying CORS...")
    headers = {"Origin": "http://evil.com", "Access-Control-Request-Method": "GET"}
    try:
        r = requests.options(f"{API_URL}/locations/search", headers=headers)
        allow_origin = r.headers.get("Access-Control-Allow-Origin")
        if allow_origin is None or (
            allow_origin != "http://evil.com" and allow_origin != "*"
        ):
            log(f"CORS blocked correctly (Origin: {allow_origin})", "PASS")
        else:
            log(f"CORS allowed origin: {allow_origin}", "WARN")
    except Exception as e:
        log(f"CORS check failed: {e}", "FAIL")


if __name__ == "__main__":
    test_health()
    test_api_docs()
    loc_id = test_create_location_and_search()
    test_image_upload(loc_id)
    test_cors()
    test_rate_limiting()
