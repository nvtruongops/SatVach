import { Component, For } from "solid-js";
import { searchStore, setCategory } from "../../stores/searchStore";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🔍" },
  { id: "food", label: "Food", icon: "🍜" },
  { id: "cafe", label: "Cafe", icon: "☕" },
  { id: "service", label: "Service", icon: "🛠️" },
  { id: "entertainment", label: "Fun", icon: "🎮" },
  { id: "shopping", label: "Shop", icon: "🛍️" },
  { id: "parking", label: "Parking", icon: "🅿️" },
];

const CategoryFilter: Component = () => {
  return (
    <div class="flex overflow-x-auto space-x-2 py-2 no-scrollbar w-full max-w-md">
      <For each={CATEGORIES}>
        {(cat) => (
          <button
            class={`flex items-center flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              searchStore.category === cat.id
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
            onClick={() => setCategory(cat.id)}
          >
            <span class="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        )}
      </For>
    </div>
  );
};

export default CategoryFilter;
