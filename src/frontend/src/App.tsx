import type { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import Header from "./components/Layout/Header";
import SearchBar from "./components/Search/SearchBar";
import CategoryFilter from "./components/Search/CategoryFilter";
import RadiusSlider from "./components/Search/RadiusSlider";
import LocationForm from "./components/Location/LocationForm";
import LocationDetail from "./components/Location/LocationDetail";
import { openForm, locationStore } from "./stores/locationStore";

// Lazy load the heavy MapContainer component
const MapContainer = lazy(() => import("./components/Map/MapContainer"));

const Home: Component = () => {
  return (
    <div class="flex flex-col h-screen relative">
      <Header />
      <main class="flex-grow relative">
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

        {/* Search Overlay - Hide when detail is open on desktop to prevent overlap if Sidebar covers it, 
            but actually Sidebar is left, Search is left. If Sidebar is open, we can hide search or let sidebar be on top.
            Better to hide for clarity or move search inside sidebar eventually.
            For now, hiding when detail is open is simplest MVP.
        */}
        <div
          class={`absolute top-4 left-4 right-4 z-10 flex flex-col gap-3 pointer-events-none text-left transition-opacity duration-300 ${locationStore.isDetailOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div class="pointer-events-auto flex flex-col gap-2 max-w-md">
            <SearchBar />
            <CategoryFilter />
            <div class="hidden sm:block">
              {" "}
              {/* Hide radius on very small screens initially or keep visible */}
              <RadiusSlider />
            </div>
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <div class="absolute bottom-6 right-6 z-10">
          <button
            onClick={openForm}
            class="flex items-center justify-center w-14 h-14 bg-secondary text-white rounded-full shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-transform transform hover:scale-110"
            title="Add New Location"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>
        </div>

        {/* Modals */}
        <LocationForm />
        <LocationDetail />
      </main>
    </div>
  );
};

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  );
};

export default App;
