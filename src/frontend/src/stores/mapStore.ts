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
    center: [105.8544, 21.0285], // Hanoi default
    zoom: 12,
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
