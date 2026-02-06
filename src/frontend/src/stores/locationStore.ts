import { createStore } from "solid-js/store";
import { createResource, createRoot } from "solid-js";
import { locationsApi, Location, SearchParams } from "../api/locations";
import { searchStore } from "./searchStore";

interface LocationState {
  isFormOpen: boolean;
  isDetailOpen: boolean;
  isPickingLocation: boolean;
  selectedLocation: { lat: number; lng: number } | null; // For Form
  currentLocation: Location | null; // For Detail
  userLocation: { lat: number; lng: number } | null;
}

export const [locationStore, setLocationStore] = createStore<LocationState>({
  isFormOpen: false,
  isDetailOpen: false,
  isPickingLocation: false,
  selectedLocation: null,
  currentLocation: null,
  userLocation: null,
});

// Resource for fetching locations based on searchStore state
const fetchLocations = async (source: any) => {
  const { query, category, radius, center, bbox } = source;

  // 1. Text or Category Search (requires center for radius)
  if ((query || category !== "all") && center) {
    const params: SearchParams = {
      latitude: center.lat,
      longitude: center.lng,
      radius: radius,
      query: query || undefined,
      category: category !== "all" ? category : undefined,
    };
    return locationsApi.search(params);
  }

  // 2. Viewport Browse (if no specific search query)
  if (bbox && !query) {
    return locationsApi.getByViewport(bbox);
  }

  return [];
};

// Create a derived signal for the resource source to trigger updates
const searchSource = () => ({
  query: searchStore.query,
  category: searchStore.category,
  radius: searchStore.radius,
  center: searchStore.center,
  bbox: searchStore.bbox,
});

export const [locations] = createRoot(() =>
  createResource(searchSource, fetchLocations),
);

export const openForm = () => setLocationStore("isFormOpen", true);
export const closeForm = () => {
  setLocationStore("isFormOpen", false);
  setLocationStore("isPickingLocation", false);
  setLocationStore("selectedLocation", null);
};

export const openDetail = (location: Location) => {
  setLocationStore("currentLocation", location);
  setLocationStore("isDetailOpen", true);
};
export const closeDetail = () => {
  setLocationStore("isDetailOpen", false);
  setLocationStore("currentLocation", null);
};

export const startPickingLocation = () => {
  setLocationStore("isPickingLocation", true);
  setLocationStore("isFormOpen", false); // Temporarily hide form to pick
};

export const confirmPickedLocation = (coords: { lat: number; lng: number }) => {
  setLocationStore("selectedLocation", coords);
  setLocationStore("isPickingLocation", false);
};

export const cancelPickingLocation = () => {
  setLocationStore("isPickingLocation", false);
  setLocationStore("isFormOpen", true);
};

export const setUserLocation = (coords: { lat: number; lng: number }) => {
  setLocationStore("userLocation", coords);
};
