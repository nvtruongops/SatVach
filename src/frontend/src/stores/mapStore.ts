import { createStore } from "solid-js/store";

interface Viewport {
  center: [number, number];
  zoom: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

interface MapState {
  viewport: Viewport;
  isLoaded: boolean;
}

export const [mapStore, setMapStore] = createStore<MapState>({
  viewport: {
    center: [106.7008, 10.7756], // District 1, Ho Chi Minh City (Ben Thanh Market area)
    zoom: 12.5, // ~5km view height
  },
  isLoaded: false,
});

export const updateViewport = (
  center: [number, number],
  zoom: number,
  bbox?: [number, number, number, number],
) => {
  setMapStore("viewport", { center, zoom, bbox });
};

export const setMapLoaded = (loaded: boolean) => {
  setMapStore("isLoaded", loaded);
};
