import { test, expect } from "@playwright/test";
import fs from "fs";

test("measure page load performance", async ({ page }) => {
  // 1. Navigate to the app
  await page.goto("/", { waitUntil: "networkidle" });

  // 2. Extract Performance Metrics
  const metrics = await page.evaluate(async () => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");
    const fcp = paint.find((p) => p.name === "first-contentful-paint");

    // LCP requires a PerformanceObserver
    let lcp = 0;
    try {
      const lcpEntries = await new Promise<PerformanceEntryList>((resolve) => {
        new PerformanceObserver((entryList) => {
          resolve(entryList.getEntries());
        }).observe({ type: "largest-contentful-paint", buffered: true });
        // Fallback timeout if no LCP event fires quickly (e.g. blank page)
        setTimeout(() => resolve([]), 2000);
      });
      if (lcpEntries.length > 0) {
        lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }
    } catch (e) {
      console.warn("LCP observation failed", e);
    }

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      requestTime: navigation.responseStart - navigation.requestStart,
      responseTime: navigation.responseEnd - navigation.responseStart,
      domInteractive: navigation.domInteractive - navigation.startTime,
      domComplete: navigation.domComplete - navigation.startTime,
      fcp: fcp ? fcp.startTime : 0,
      lcp: lcp,
    };
  });

  console.log("--- Performance Metrics (ms) ---");
  console.log(JSON.stringify(metrics, null, 2));

  // Write to file for agent to read
  fs.writeFileSync("performance.json", JSON.stringify(metrics, null, 2));

  console.log("--------------------------------");

  // 3. Assertions for MVP Targets
  expect(metrics.fcp).toBeLessThan(1500); // Target < 1.5s
  expect(metrics.lcp).toBeLessThan(2500); // Target < 2.5s
  expect(metrics.domInteractive).toBeLessThan(1000); // Target < 1.0s
});
