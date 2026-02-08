import { createSignal, onCleanup, For, Show } from "solid-js";
import {
  searchStore,
  setQuery,
  setSelectedLocation,
  setSearchResults,
  setCenter,
} from "../../stores/searchStore";
import { geocoding } from "@maptiler/client";
import { locationStore, setUserLocation } from "../../stores/locationStore";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function SearchBar() {
  const [localValue, setLocalValue] = createSignal(searchStore.query);
  const [suggestions, setSuggestions] = createSignal<any[]>([]);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [isSearching, setIsSearchingLocal] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);

  let debounceTimer: number | undefined;
  let inputRef: HTMLInputElement | undefined;

  // Helper to calculate BBox for strict radius search
  const getBBoxFromCenterAndRadius = (
    center: { lat: number; lng: number },
    radiusMeters: number,
  ): [number, number, number, number] => {
    const latDelta = radiusMeters / 111111;
    const lngDelta =
      radiusMeters / (111111 * Math.cos((center.lat * Math.PI) / 180));

    return [
      center.lng - lngDelta,
      center.lat - latDelta,
      center.lng + lngDelta,
      center.lat + latDelta,
    ];
  };

  // Helper to calculate distance in meters (Haversine formula)
  const getDistanceMeters = (
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number },
  ) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const dPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(dLambda / 2) *
        Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    console.log("Fetching suggestions for:", query);
    setIsSearchingLocal(true);
    setShowDropdown(true);

    if (!MAPTILER_KEY) {
      console.error("VITE_MAPTILER_KEY is missing in SearchBar!");
    }

    try {
      const result = await geocoding.forward(query, {
        apiKey: MAPTILER_KEY,
        country: ["vn"],
        limit: 8,
        types: ["region", "subregion", "locality", "poi", "address"],
        proximity: locationStore.userLocation
          ? [locationStore.userLocation.lng, locationStore.userLocation.lat]
          : undefined,
      });

      console.log("Geocoding result:", result);

      if (result.features) {
        setSuggestions(result.features);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setIsSearchingLocal(false);
    }
  };

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setLocalValue(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelect = (suggestion: any) => {
    const [lng, lat] = suggestion.geometry.coordinates;
    const name = suggestion.place_name || suggestion.text;

    setLocalValue(name);
    setQuery(name);
    setSelectedLocation({ lat, lng, name });
    setShowDropdown(false);
    setSuggestions([]);
  };

  // Main search logic extracted for reuse
  const performSearch = async (query: string) => {
    setShowDropdown(false);
    setQuery(query);

    // Perform global search to show all markers around the area
    if (query.trim().length >= 2) {
      console.log(
        "Global search for markers:",
        query,
        "radius:",
        searchStore.radius,
      );
      try {
        // Calculate BBox to enforce hard radius limit
        const bbox = searchStore.center
          ? getBBoxFromCenterAndRadius(searchStore.center, searchStore.radius)
          : undefined;

        console.log("Calculated BBox for search:", bbox);

        const result = await geocoding.forward(query, {
          apiKey: MAPTILER_KEY,
          proximity: searchStore.center
            ? [searchStore.center.lng, searchStore.center.lat]
            : undefined,
          bbox: bbox,
          country: ["vn"],
          limit: 10,
          types: ["poi", "address"],
        });
        if (result.features) {
          // Strict radius filtering (circle instead of square bbox)
          const filteredResults = searchStore.center
            ? result.features.filter((f: any) => {
                const dist = getDistanceMeters(searchStore.center!, {
                  lat: f.geometry.coordinates[1],
                  lng: f.geometry.coordinates[0],
                });
                return dist <= searchStore.radius * 1.1; // 10% tolerance for better UX
              })
            : result.features;

          setSearchResults(filteredResults);
          console.log(
            "Global search markers found (filtered):",
            filteredResults.length,
            "original:",
            result.features.length,
          );
        }
      } catch (err) {
        console.error("Global search error:", err);
      }
    }
  };

  // Wrapper to check location before searching
  const handleSearchWithLocationCheck = () => {
    const query = localValue();
    if (!query.trim()) return;

    // Check if user location is known
    if (!locationStore.userLocation) {
      // Create Toast Notification
      const toastContainer = document.createElement("div");
      toastContainer.className =
        "fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center animate-fade-in-toast"; // Using fade-in-toast for consistency

      const toastContent = document.createElement("div");
      toastContent.className =
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-[90vw] md:w-auto flex flex-col gap-3";

      toastContent.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-lg">Location needed</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              To find results nearby within your radius coverage, we need your location.
            </p>
          </div>
        </div>
        <div class="flex flex-row gap-2 mt-1 justify-end">
          <button id="btn-search-anyway" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Search Here Anyway
          </button>
          <button id="btn-locate-me" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Locate Me
          </button>
        </div>
      `;

      toastContainer.appendChild(toastContent);
      document.body.appendChild(toastContainer);

      // Handle "Locate Me"
      const btnLocate = toastContent.querySelector("#btn-locate-me");
      btnLocate?.addEventListener("click", () => {
        btnLocate.textContent = "Locating...";
        (btnLocate as HTMLButtonElement).disabled = true;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              setCenter({ lat: latitude, lng: longitude });

              // Remove toast and search
              toastContainer.remove();
              performSearch(query);
            },
            (err) => {
              console.error("Locate failed", err);
              // Show error in same toast or replace
              toastContent.innerHTML = `
                 <div class="text-red-500 font-medium p-2 text-center">
                   Could not get location. Permission denied or error.
                 </div>
              `;
              setTimeout(() => {
                toastContainer.remove();
                performSearch(query); // Fallback to search anyway
              }, 2000);
            },
            { enableHighAccuracy: true, timeout: 10000 },
          );
        } else {
          alert("Geolocation is not supported by this browser.");
          toastContainer.remove();
          performSearch(query);
        }
      });

      // Handle "Search Anyway"
      const btnSearchAnyway = toastContent.querySelector("#btn-search-anyway");
      btnSearchAnyway?.addEventListener("click", () => {
        toastContainer.remove();
        performSearch(query);
      });

      // Auto-dismiss logic (optional, maybe not for this prompt since it's a decision)
      // keeping it persistent until choice is made or user clicks away?
      // Click outside to dismiss?
      const clickOutside = (e: MouseEvent) => {
        if (!toastContent.contains(e.target as Node)) {
          toastContainer.remove();
          document.removeEventListener("click", clickOutside);
        }
      };
      // Delay adding click listener to avoid immediate trigger
      setTimeout(() => document.addEventListener("click", clickOutside), 100);
    } else {
      // User location exists, just search
      performSearch(query);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown()) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions().length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (activeIndex() >= 0) {
        e.preventDefault();
        handleSelect(suggestions()[activeIndex()]);
      } else {
        setShowDropdown(false);
        // Use the location check wrapper
        handleSearchWithLocationCheck();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Close dropdown on click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef && !inputRef.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  return (
    <div class="w-full md:w-80 lg:w-96 flex-shrink-0 relative transition-all duration-300 z-[100]">
      <label
        for="default-search"
        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div class="relative" ref={inputRef}>
        <div class="absolute inset-y-0 start-0 flex items-center ps-2 md:ps-3 pointer-events-none">
          <svg
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          class="block w-full py-3 md:py-4 ps-8 md:ps-10 pe-20 md:pe-24 text-xs md:text-sm text-gray-900 border border-white/20 rounded-full bg-white/90 backdrop-blur-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800/90 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 shadow-xl transition-all hover:bg-white"
          placeholder="Search locations, food, services..."
          value={localValue()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions().length > 0 && setShowDropdown(true)}
          autocomplete="off"
          name="search"
        />
        <button
          type="button"
          class="absolute end-1.5 md:end-2.5 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-full text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 text-white shadow-md transition-colors"
          onClick={() => handleSearchWithLocationCheck()}
        >
          Search
        </button>

        {/* Dropdown Suggestions */}
        <Show
          when={
            showDropdown() &&
            (suggestions().length > 0 ||
              isSearching() ||
              localValue().length >= 2)
          }
        >
          <div class="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[9999] overflow-hidden animate-fade-in max-h-96 overflow-y-auto ring-1 ring-black/5">
            <Show
              when={!isSearching()}
              fallback={
                <div class="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              }
            >
              <Show
                when={suggestions().length > 0}
                fallback={
                  <div class="p-4 text-center text-sm text-gray-500 italic">
                    No matching locations found for "{localValue()}"
                  </div>
                }
              >
                <ul class="py-2">
                  <For each={suggestions()}>
                    {(suggestion, index) => (
                      <li>
                        <button
                          type="button"
                          class="w-full text-left px-4 py-3 text-sm transition-colors flex items-start gap-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 group"
                          classList={{
                            "bg-primary-50 dark:bg-primary-900/30":
                              activeIndex() === index(),
                          }}
                          onClick={() => handleSelect(suggestion)}
                        >
                          <svg
                            class="w-5 h-5 mt-0.5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <div class="min-w-0 flex-1">
                            <div class="font-medium text-gray-900 dark:text-white truncate">
                              {suggestion.text}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {suggestion.place_name}
                            </div>
                          </div>
                        </button>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
