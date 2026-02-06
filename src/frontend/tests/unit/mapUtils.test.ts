import { describe, it, expect } from "vitest";
import { toGeoJSON } from "../../src/lib/mapUtils";

describe("mapUtils", () => {
  describe("toGeoJSON", () => {
    it("should convert items to FeatureCollection", () => {
      const items = [
        {
          id: 1,
          title: "Test Place",
          price: 100,
          location: { lat: 10.5, lng: 106.5 },
        },
      ];

      const geojson = toGeoJSON(items);

      expect(geojson.type).toBe("FeatureCollection");
      expect(geojson.features).toHaveLength(1);

      const feature = geojson.features[0];
      expect(feature.type).toBe("Feature");
      expect(feature.geometry.type).toBe("Point");
      expect(feature.geometry.coordinates).toEqual([106.5, 10.5]); // Lng, Lat
      expect(feature.properties).toEqual({
        id: 1,
        title: "Test Place",
        price: 100,
      });
    });

    it("should handle empty list", () => {
      const geojson = toGeoJSON([]);
      expect(geojson.type).toBe("FeatureCollection");
      expect(geojson.features).toHaveLength(0);
    });
  });
});
