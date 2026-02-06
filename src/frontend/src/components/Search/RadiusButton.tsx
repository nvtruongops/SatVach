import { Component, createSignal, Show, onCleanup } from "solid-js";
import { searchStore, setRadius } from "../../stores/searchStore";

const RadiusButton: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Attach click listener for closing dropdown
  if (typeof window !== "undefined") {
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => document.removeEventListener("click", handleClickOutside));
  }

  return (
    <div class="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen())}
        class={`flex items-center gap-1.5 px-4 py-3.5 rounded-full text-sm font-medium transition-all shadow-sm border whitespace-nowrap h-full ${
          isOpen()
            ? "bg-primary-600 text-white border-primary-600"
            : "bg-white/90 backdrop-blur-md text-gray-900 border-white/20 hover:bg-white dark:bg-gray-800/90 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        }`}
      >
        <span>{formatDistance(searchStore.radius)}</span>
        <svg
          class={`w-3 h-3 transition-transform ${isOpen() ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              Radius
            </span>
            <span class="text-sm font-bold text-primary-600 dark:text-primary-400">
              {formatDistance(searchStore.radius)}
            </span>
          </div>

          <input
            id="radius-slider"
            aria-label="Adjust search radius"
            type="range"
            min="500"
            max="50000"
            step="500"
            value={searchStore.radius}
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            onInput={(e) =>
              setRadius(parseInt((e.target as HTMLInputElement).value))
            }
          />

          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>500m</span>
            <span>50km</span>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default RadiusButton;
