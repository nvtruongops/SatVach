import { Component, createSignal, For, Show } from "solid-js";
import { locationStore, closeDetail } from "../../stores/locationStore";

const LocationDetail: Component = () => {
  const [activeImage, setActiveImage] = createSignal(0);

  return (
    <Show when={locationStore.isDetailOpen && locationStore.currentLocation}>
      {/* Backdrop (Mobile only) */}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={closeDetail}
      />

      <div
        class="
          fixed z-50 bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300
          
          /* Mobile: Bottom Sheet */
          inset-x-0 bottom-0 top-auto rounded-t-2xl h-[70vh] w-full overflow-hidden flex flex-col
          
          /* Desktop: Sidebar */
          md:inset-y-0 md:left-0 md:top-[60px] md:bottom-0 md:w-[400px] md:h-auto md:rounded-none md:border-r md:border-gray-200 dark:md:border-gray-700
        "
      >
        <div class="h-full overflow-y-auto flex flex-col">
          {/* Image Gallery */}
          <div class="relative h-64 shrink-0 bg-gray-200">
            <Show
              when={
                (locationStore.currentLocation?.image_urls?.length ?? 0) > 0
              }
              fallback={
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                  No Images
                </div>
              }
            >
              <img
                src={locationStore.currentLocation!.image_urls![activeImage()]}
                class="w-full h-full object-cover"
              />
              {/* Navigation Arrows */}
              <Show
                when={
                  (locationStore.currentLocation?.image_urls?.length ?? 0) > 1
                }
              >
                <button
                  class="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) =>
                      prev === 0
                        ? locationStore.currentLocation!.image_urls!.length - 1
                        : prev - 1,
                    );
                  }}
                >
                  ‹
                </button>
                <button
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) =>
                      prev ===
                      locationStore.currentLocation!.image_urls!.length - 1
                        ? 0
                        : prev + 1,
                    );
                  }}
                >
                  ›
                </button>
              </Show>
              {/* Indicators */}
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                <For each={locationStore.currentLocation!.image_urls}>
                  {(_, idx) => (
                    <div
                      class={`w-2 h-2 rounded-full cursor-pointer ${activeImage() === idx() ? "bg-white" : "bg-white/50"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage(idx());
                      }}
                    />
                  )}
                </For>
              </div>
            </Show>
            <button
              class="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
              onClick={closeDetail}
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div class="p-6 md:p-8">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 leading-tight">
                  {locationStore.currentLocation!.title}
                </h2>
                <Show when={locationStore.currentLocation!.address}>
                  <p class="text-base text-gray-500 flex items-center gap-2">
                    <span class="text-primary-500">📍</span>{" "}
                    {locationStore.currentLocation!.address}
                  </p>
                </Show>
              </div>
              <span class="px-3 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ml-4 shadow-sm">
                {locationStore.currentLocation!.category}
              </span>
            </div>

            <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg font-light">
              {locationStore.currentLocation!.description ||
                "No description provided."}
            </p>

            <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
              <span>
                Added on:{" "}
                {new Date(
                  locationStore.currentLocation!.created_at,
                ).toLocaleDateString()}
              </span>

              <Show
                when={locationStore.currentLocation!.distance !== undefined}
              >
                <span>
                  {locationStore.currentLocation!.distance! < 1000
                    ? `${Math.round(locationStore.currentLocation!.distance!)}m`
                    : `${(locationStore.currentLocation!.distance! / 1000).toFixed(1)}km`}{" "}
                  away
                </span>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default LocationDetail;
