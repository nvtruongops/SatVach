import { onMount, onCleanup, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css"; // Moved to index.html (CDN)
import { mapStore, updateViewport, setMapLoaded } from "../../stores/mapStore";
import { setBbox, setCenter } from "../../stores/searchStore";
import {
  locationStore,
  locations, // The resource
  confirmPickedLocation,
  openDetail,
  setUserLocation,
} from "../../stores/locationStore";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function MapContainer() {
  const navigate = useNavigate();
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

    map.addControl(new maplibregl.NavigationControl(), "bottom-left");

    // Add scale control to show map zoom level and distance
    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric", // Use kilometers
      }),
      "bottom-right",
    );

    // Setup geolocation control with more lenient settings
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: false, // Start with low accuracy for faster response
        timeout: 30000, // 30 seconds timeout (increased to reduce timeout errors)
        maximumAge: 600000, // Accept cached position up to 10 minutes old
      },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
    });

    map.addControl(geolocate, "bottom-left");

    // After initial position, try to get high accuracy in background
    let hasInitialPosition = false;

    // Helper function for IP-based geolocation fallback
    const getIPBasedLocation = () => {
      const ipGeoProviders = [
        {
          url: "https://freeipapi.com/api/json",
          parse: (data: any) =>
            data.latitude && data.longitude
              ? {
                  lat: data.latitude,
                  lng: data.longitude,
                  city: data.cityName,
                  country: data.countryName,
                }
              : null,
        },
        {
          url: "https://ipwho.is/",
          parse: (data: any) =>
            data.success
              ? {
                  lat: data.latitude,
                  lng: data.longitude,
                  city: data.city,
                  country: data.country,
                }
              : null,
        },
        {
          url: "https://get.geojs.io/v1/ip/geo.json",
          parse: (data: any) =>
            data.latitude && data.longitude
              ? {
                  lat: parseFloat(data.latitude),
                  lng: parseFloat(data.longitude),
                  city: data.city,
                  country: data.country,
                }
              : null,
        },
      ];

      const tryNextProvider = (index: number) => {
        if (index >= ipGeoProviders.length) {
          // All providers failed - show error toast
          const errorToast = document.createElement("div");
          errorToast.className =
            "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md text-center animate-fade-in";
          errorToast.textContent =
            "Unable to get your location. Please enable location services in your device settings.";
          document.body.appendChild(errorToast);
          setTimeout(() => {
            errorToast.classList.add("animate-fade-out");
            setTimeout(() => errorToast.remove(), 300);
          }, 5000);
          return;
        }

        const provider = ipGeoProviders[index];

        fetch(provider.url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => {
            const location = provider.parse(data);
            if (location) {
              setUserLocation({ lat: location.lat, lng: location.lng });
              // Don't automatically fly to IP location - keep default view
              // map?.flyTo({ center: [location.lng, location.lat], zoom: 12 });
            } else {
              throw new Error("Invalid response");
            }
          })
          .catch(() => {
            // Try next provider silently
            tryNextProvider(index + 1);
          });
      };

      tryNextProvider(0);
    };

    // Handle missing sprite images
    map.on("styleimagemissing", (e) => {
      const id = e.id;
      // Create a blank 1x1 pixel image for missing sprites
      if (!map?.hasImage(id)) {
        map?.addImage(id, {
          width: 1,
          height: 1,
          data: new Uint8Array(4),
        });
      }
    });

    // Sync user location to store
    geolocate.on("geolocate", (e: any) => {
      // e.coords is the GeolocationCoordinates object
      if (e.coords) {
        setUserLocation({ lat: e.coords.latitude, lng: e.coords.longitude });

        // After getting initial position, try high accuracy in background
        if (!hasInitialPosition) {
          hasInitialPosition = true;
          // Try to get a more accurate position in the background
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
              },
              () => {
                // Silently ignore - we already have a position
              },
              {
                enableHighAccuracy: true,
                timeout: 60000, // Give it more time for high accuracy
                maximumAge: 0,
              },
            );
          }
        }
      }
    });

    // Track when user clicks the geolocate button
    geolocate.on("trackuserlocationstart", () => {
      // User started location tracking
    });

    geolocate.on("trackuserlocationend", () => {
      // User stopped location tracking
    });

    // Handle geolocation errors with user-friendly messages
    geolocate.on("error", (e: any) => {
      // Show user-friendly error message based on error code
      let message = "Unable to access your location.";
      let showTip = false;

      if (e.code === 1) {
        // Permission denied
        message = "Location access denied.";
        showTip = true;
      } else if (e.code === 2) {
        // Position unavailable
        message =
          "Unable to determine your location. Please check your device's location settings.";
      } else if (e.code === 3) {
        // Timeout - try IP fallback
        message = "Location request timed out. Using approximate location...";

        // Try browser geolocation with very lenient settings first, then IP fallback
        setTimeout(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                map?.flyTo({ center: [longitude, latitude], zoom: 15 });
              },
              () => {
                // Browser geolocation failed, use IP-based fallback (but don't auto-fly)
                getIPBasedLocation();
              },
              {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: Infinity, // Accept any cached position
              },
            );
          } else {
            // No browser geolocation, use IP-based fallback (but don't auto-fly)
            getIPBasedLocation();
          }
        }, 500);
      }

      // Create toast notification container
      const toastContainer = document.createElement("div");
      toastContainer.className =
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center animate-fade-in";

      // Main error toast
      const toast = document.createElement("div");
      toast.className =
        "bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center";
      toast.textContent = message;
      toastContainer.appendChild(toast);

      // Add helpful tip for permission denied
      if (showTip) {
        const tipToast = document.createElement("div");
        tipToast.className =
          "bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-md text-center mt-2";
        tipToast.innerHTML = `
          <p class="font-medium mb-1">💡 How to enable location:</p>
          <p>1. Click the lock/info icon in your browser's address bar</p>
          <p>2. Find "Location" and set to "Allow"</p>
          <p>3. Reload the page</p>
        `;
        toastContainer.appendChild(tipToast);
      }

      document.body.appendChild(toastContainer);

      setTimeout(
        () => {
          toastContainer.classList.add("animate-fade-out");
          setTimeout(() => toastContainer.remove(), 300);
        },
        showTip ? 8000 : 5000,
      ); // Show longer if there's a tip
    });

    map.on("load", () => {
      setMapLoaded(true);

      // Proactively try IP geolocation after a short delay if GPS is slow
      // This runs in parallel with the GPS request
      setTimeout(() => {
        // Check if we already have user location (from GPS)
        if (locationStore.userLocation) {
          return;
        }

        // GPS is slow, try IP-based location (but don't auto-fly to it)
        getIPBasedLocation();
      }, 5000);

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
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Unclustered points (Simple circle markers)
      map?.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "locations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#227C9D",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
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
          navigate("/contribute");
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

  // Update cursor when picking location
  createEffect(() => {
    if (!map) return;
    const canvas = map.getCanvas();
    if (locationStore.isPickingLocation) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "";
    }
  });

  onCleanup(() => {
    map?.remove();
    setMapLoaded(false);
  });

  return (
    <div class="relative w-full h-full z-0">
      <div
        ref={mapContainer}
        class="w-full h-full"
        id="map"
        style={locationStore.isPickingLocation ? { cursor: "crosshair" } : {}}
      />
    </div>
  );
}
