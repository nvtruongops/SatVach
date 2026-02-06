import { onMount, onCleanup, createEffect } from "solid-js";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css"; // Moved to index.html (CDN)
import { mapStore, updateViewport, setMapLoaded } from "../../stores/mapStore";
import { setBbox, setCenter } from "../../stores/searchStore";
import {
  locationStore,
  locations, // The resource
  confirmPickedLocation,
  openDetail,
} from "../../stores/locationStore";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function MapContainer() {
  let mapContainer: HTMLDivElement | undefined;
  let map: MapLibreMap | undefined;

  onMount(() => {
    if (!mapContainer) return;
    if (!MAPTILER_KEY) {
      console.error("VITE_MAPTILER_KEY is missing!");
      return;
    }

    map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: mapStore.viewport.center,
      zoom: mapStore.viewport.zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right",
    );

    map.on("load", async () => {
      console.log("Map loaded");
      setMapLoaded(true);

      // Load custom marker image properly
      const image = await map?.loadImage(
        "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiBmaWxsPSIjMjI3QzlEIj48cGF0aCBkPSJNMTIgMEM3LjU4IDAgNCAzLjU4IDQgOGMwIDUuMjUgOCAxMyA4IDEzczgtNy43NSA4LTEzYzAtNC40Mi0zLjU4LTgtOC04em0wIDEyYTIuNSAyLjUgMCAxIDAgMC01IDIuNSAyLjUgMCAwIDAgMCA1eiIvPjwvc3ZnPg==",
      );
      if (image && !map?.hasImage("custom-marker")) {
        map?.addImage("custom-marker", image.data);
      }

      // Initialize sources
      map?.addSource("locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Clusters layer
      map?.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Cluster count
      map?.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      // Unclustered points (Custom Markers)
      map?.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "locations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "custom-marker",
          "icon-size": 1,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      // Handle events
      setupMapEvents();
    });

    const setupMapEvents = () => {
      // Pick location
      map?.on("click", (e) => {
        if (locationStore.isPickingLocation) {
          confirmPickedLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        }
      });

      // Expand cluster
      map?.on("click", "clusters", async (e) => {
        if (locationStore.isPickingLocation) return;
        const features = map?.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features?.[0].properties?.cluster_id;
        const source = map?.getSource("locations") as maplibregl.GeoJSONSource;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map?.easeTo({
            center: (features?.[0].geometry as any).coordinates,
            zoom: zoom ?? 14,
          });
        } catch (err) {
          console.error(err);
        }
      });

      // Click location
      map?.on("click", "unclustered-point", (e) => {
        if (locationStore.isPickingLocation) return;

        // We stored the Location object ID in properties or we can just find it in locations()
        const props = e.features?.[0].properties;
        const id = props?.id;

        // Find the full location object from the resource
        const location = locations()?.find((l: any) => l.id == id); // id might be string or number

        if (location) {
          openDetail(location);
        } else {
          // Fallback if not found in current resource (shouldn't happen if sync is correct)
          // or fetching details
          console.warn("Location not found in store", id);
        }
      });

      map?.on(
        "mouseenter",
        "clusters",
        () => (map!.getCanvas().style.cursor = "pointer"),
      );
      map?.on(
        "mouseleave",
        "clusters",
        () => (map!.getCanvas().style.cursor = ""),
      );

      map?.on(
        "mouseenter",
        "unclustered-point",
        () => (map!.getCanvas().style.cursor = "pointer"),
      );
      map?.on(
        "mouseleave",
        "unclustered-point",
        () => (map!.getCanvas().style.cursor = ""),
      );

      // Viewport tracking logic
      map?.on("moveend", () => {
        const center = map!.getCenter();
        const zoom = map!.getZoom();
        const bounds = map!.getBounds();

        updateViewport([center.lng, center.lat], zoom, [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ]);

        // Update searchStore bbox to trigger lazy loading
        setBbox([
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ]);
        setCenter({ lat: center.lat, lng: center.lng });
      });

      // Initial sync to populate stores
      map?.fire("moveend");
    };
  });

  // Reactively update map source when locations resource changes
  createEffect(() => {
    if (!map || !map.getLayer("unclustered-point")) return;

    const data = locations();
    if (data) {
      const source = map.getSource("locations") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: data.map((loc: any) => ({
            type: "Feature",
            geometry: loc.geom,
            properties: {
              id: loc.id,
              title: loc.title,
              category: loc.category,
            },
          })),
        });
      }
    }
  });

  onCleanup(() => {
    map?.remove();
    setMapLoaded(false);
  });

  return (
    <div class="relative w-full h-[calc(100vh-60px)] z-0">
      <div ref={mapContainer} class="w-full h-full" id="map" />
    </div>
  );
}
