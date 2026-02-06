import { test, expect } from "@playwright/test";

test.describe("Search Flow", () => {
  test("should search locations by text", async ({ page }) => {
    // 1. Mock Search API
    // Verify query param is sent
    let searchCalled = false;
    await page.route("**/api/v1/locations/search*", async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q");
      if (query === "pho") {
        searchCalled = true;
      }
      await route.fulfill({
        json: {
          items: [
            {
              id: 1,
              title: "Pho Bo",
              category: "food",
              geom: { type: "Point", coordinates: [106, 10] },
              latitude: 10,
              longitude: 106,
              status: "approved",
            },
          ],
          total: 1,
          skip: 0,
          limit: 20,
        },
      });
    });

    // Mock Viewport to avoid errors
    await page.route("**/api/v1/locations/viewport*", async (route) => {
      await route.fulfill({ json: [] });
    });

    // 2. Open App
    await page.goto("/");

    // Wait for app stability
    await page.waitForTimeout(2000);

    // 3. Type in Search Bar
    const searchInput = page.getByPlaceholder(
      "Search locations, food, services...",
    );
    await searchInput.fill("pho");

    // 4. Submit (Click Search button or Enter? Code says click button or debounce)
    // Code has debounce (500ms) on Input, and Click button.
    // Let's click button to be immediate.
    const searchBtn = page.getByRole("button", { name: "Search" });
    await searchBtn.click();

    // 5. Verify API called
    // Wait for the route handler to flag it
    // Or assert on waitForResponse
    await expect(async () => {
      expect(searchCalled).toBeTruthy();
    }).toPass({ timeout: 10000 });

    // 6. Verify result (Optional, if UI shows list)
    // Map updates markers. Hard to check canvas.
    // But we know API was called correctly.
  });
});
