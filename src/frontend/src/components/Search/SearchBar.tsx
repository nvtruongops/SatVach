import { createSignal, onCleanup } from "solid-js";
import { searchStore, setQuery } from "../../stores/searchStore";

export default function SearchBar() {
  const [localValue, setLocalValue] = createSignal(searchStore.query);
  let debounceTimer: number | undefined;

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setLocalValue(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for 500ms debounce
    debounceTimer = setTimeout(() => {
      setQuery(value);
      console.log("Search query updated:", value);
    }, 500);
  };

  onCleanup(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  return (
    <div class="w-full max-w-md">
      <label
        for="default-search"
        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
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
          class="block w-full p-4 ps-10 text-sm text-gray-900 border border-white/20 rounded-xl bg-white/90 backdrop-blur-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800/90 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 shadow-xl transition-all hover:bg-white"
          placeholder="Search locations, food, services..."
          value={localValue()}
          onInput={handleInput}
        />
        <button
          type="submit"
          class="absolute end-2.5 bottom-2.5 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 text-white shadow-md transition-colors"
          onClick={() => setQuery(localValue())} // Immediate search on click
        >
          Search
        </button>
      </div>
    </div>
  );
}
