import { Component, lazy, Suspense } from "solid-js";
import { A } from "@solidjs/router";
import Header from "../components/Layout/Header";
import SearchBar from "../components/Search/SearchBar";
import CategoryFilter from "../components/Search/CategoryFilter";
import RadiusButton from "../components/Search/RadiusButton";
import LocationDetail from "../components/Location/LocationDetail";
import { locationStore } from "../stores/locationStore";

// Lazy load the heavy MapContainer component
const MapContainer = lazy(() => import("../components/Map/MapContainer"));

const Home: Component = () => {
  return (
    <div class="relative w-full h-screen overflow-hidden">
      <Header />
      <main
        class="w-full h-full relative"
        style={locationStore.isPickingLocation ? { cursor: "crosshair" } : {}}
      >
        <Suspense
          fallback={
            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p class="mt-4 text-gray-600">Loading map...</p>
              </div>
            </div>
          }
        >
          <MapContainer />
        </Suspense>

        <div
          class={`absolute top-6 left-4 right-4 z-10 flex flex-col md:flex-row justify-center items-start gap-3 pointer-events-none transition-opacity duration-300 ${locationStore.isDetailOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div class="pointer-events-auto flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full max-w-6xl relative">
            {/* Desktop: Gradient fade overlays */}
            <div class="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-900/80 dark:to-transparent pointer-events-none z-10 rounded-l-2xl"></div>
            <div class="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50/80 to-transparent dark:from-gray-900/80 dark:to-transparent pointer-events-none z-10 rounded-r-2xl"></div>

            {/* Main container - responsive layout */}
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-1 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl md:rounded-full shadow-xl border border-white/30 dark:border-gray-700/30 p-2 overflow-visible">
              {/* Logo - hidden on mobile */}
              <A
                href="/"
                class="hidden md:flex flex-row items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
              >
                <img
                  src="/logo.svg"
                  alt="logo"
                  class="w-9 h-9 object-contain"
                />
                <div class="hidden lg:flex flex-col justify-center">
                  <span class="font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                    Sát Vách
                  </span>
                  <span class="text-[0.6rem] text-gray-500 uppercase tracking-wider font-semibold">
                    Local Map
                  </span>
                </div>
              </A>

              {/* Divider - desktop only */}
              <div class="hidden md:block h-8 w-px bg-gray-300/50 dark:bg-gray-600/50 flex-shrink-0"></div>

              {/* Search Group - full width on mobile */}
              <div class="flex flex-row items-center gap-2 w-full md:w-auto">
                <div class="flex-1 md:flex-initial">
                  <SearchBar />
                </div>
                <RadiusButton />
              </div>

              {/* Divider - desktop only */}
              <div class="hidden md:block h-8 w-px bg-gray-300/50 dark:bg-gray-600/50 flex-shrink-0"></div>

              {/* Category Filter - full width on mobile */}
              <div class="w-full md:ml-8 md:flex-1 md:min-w-0">
                <CategoryFilter />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <LocationDetail />
      </main>
    </div>
  );
};

export default Home;
