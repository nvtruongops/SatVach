import { Component, For } from "solid-js";
import { searchStore, setCategory } from "../../stores/searchStore";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "food", label: "Food" },
  { id: "cafe", label: "Cafe" },
  { id: "shop", label: "Shop" },
  { id: "travel", label: "Travel" },
  { id: "other", label: "Other" },
];

const CategoryFilter: Component = () => {
  return (
    <div class="flex overflow-x-auto space-x-1.5 md:space-x-2 py-1 md:py-2 no-scrollbar flex-1 min-w-0 w-full mask-linear-fade">
      <For each={CATEGORIES}>
        {(cat) => (
          <button
            class={`flex items-center flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors border ${
              searchStore.category === cat.id
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        )}
      </For>
    </div>
  );
};

export default CategoryFilter;
