from locust import HttpUser, task, between
import random

class VisitorUser(HttpUser):
    wait_time = between(1, 5)
    weight = 4

    @task(3)
    def search_locations(self):
        # Hanoi coordinates
        lat = 21.0285
        lng = 105.8542
        self.client.get(f"/api/v1/locations/search?latitude={lat}&longitude={lng}&radius=5000")

    @task(1)
    def view_location(self):
        # View a random location ID from search results
        lat = 21.0285
        lng = 105.8542
        with self.client.get(f"/api/v1/locations/search?latitude={lat}&longitude={lng}&limit=5", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("items"):
                        item = random.choice(data["items"])
                        self.client.get(f"/api/v1/locations/{item['id']}")
                except Exception:
                    pass

class ContributorUser(HttpUser):
    wait_time = between(5, 15)
    weight = 1

    @task
    def create_location(self):
        payload = {
            "title": f"Load Test Loc {random.randint(1, 10000)}",
            "description": "Created by Locust Load Test",
            "category": "cafe",
            "address": "123 Load Test St",
            "latitude": 21.0 + random.random() * 0.1,
            "longitude": 105.8 + random.random() * 0.1,
            "image_ids": []
        }
        # Post to create location
        self.client.post("/api/v1/locations/", json=payload)
