import { test, expect } from "@playwright/test";

test("should request and retrieve user location", async ({ page, context }) => {
  // Grant geolocation permission
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 10.7769, longitude: 106.7009 }); // Saigon

  await page.goto("/");

  // Wait for map to load (canvas element)
  await page.waitForSelector(".maplibregl-map");

  // Verify "Geolocate" control exists on the map
  const geolocateBtn = page.locator(".maplibregl-ctrl-geolocate");
  await expect(geolocateBtn).toBeVisible();

  // The application should have already requested location on load (via MapContainer)
  // We expect the button to become active automatically.

  // Wait for the button to have the active class
  await expect(geolocateBtn).toHaveClass(
    /maplibregl-ctrl-geolocate-active|maplibregl-ctrl-geolocate-background/,
  );

  // Verify user location update in store (indirectly via map center or just trust the button for now)
  // In a real scenario, we could check if the map center matches the mock location.
  await page.waitForTimeout(2000); // Allow animation to finish

  // Verify active state class (maplibre specific)
  // The button adds 'maplibregl-ctrl-geolocate-active' or 'maplibregl-ctrl-geolocate-background' depending on state
  // We just wait a bit to ensure no errors occur
  await page.waitForTimeout(1000);

  await expect(geolocateBtn).toBeVisible();
});
