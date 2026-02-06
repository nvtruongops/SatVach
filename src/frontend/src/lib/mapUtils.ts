import type { FeatureCollection } from "geojson";

export function toGeoJSON(items: any[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.location.lng, item.location.lat],
      },
      properties: {
        id: item.id,
        title: item.title,
        price: item.price,
        // Add other properties as needed
      },
    })),
  };
}
