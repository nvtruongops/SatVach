import { createStore } from "solid-js/store";

interface SearchState {
  query: string;
  category: string;
  radius: number; // meters
  center: { lat: number; lng: number } | null;
  bbox: [number, number, number, number] | null; // [minLng, minLat, maxLng, maxLat]
  isSearching: boolean;
  selectedLocation: { lat: number; lng: number; name?: string } | null;
  searchResults: any[];
}

export const [searchStore, setSearchStore] = createStore<SearchState>({
  query: "",
  category: "all",
  radius: 5000,
  center: { lat: 21.0285, lng: 105.8544 }, // Match mapStore default
  bbox: null,
  isSearching: false,
  selectedLocation: null,
  searchResults: [],
});

export const setQuery = (query: string) => {
  setSearchStore("query", query);
};

export const setCategory = (category: string) => {
  setSearchStore("category", category);
};

export const setRadius = (radius: number) => {
  setSearchStore("radius", radius);
};

export const setCenter = (center: { lat: number; lng: number } | null) => {
  setSearchStore("center", center);
};

export const setBbox = (bbox: [number, number, number, number] | null) => {
  setSearchStore("bbox", bbox);
};

export const setIsSearching = (isSearching: boolean) => {
  setSearchStore("isSearching", isSearching);
};

export const setSelectedLocation = (
  location: { lat: number; lng: number; name?: string } | null,
) => {
  setSearchStore("selectedLocation", location);
};

export const setSearchResults = (results: any[]) => {
  setSearchStore("searchResults", results);
};
