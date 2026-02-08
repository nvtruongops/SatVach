import { Component } from "solid-js";
import { searchStore, setRadius } from "../../stores/searchStore";

const RadiusSlider: Component = () => {
  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  return (
    <div class="w-full max-w-md bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center mb-2">
        <label
          for="radius-range"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Radius
        </label>
        <span class="text-sm text-primary-600 font-bold dark:text-primary-400">
          {formatDistance(searchStore.radius)}
        </span>
      </div>
      <input
        id="radius-range"
        type="range"
        min="500"
        max="50000"
        step="500"
        value={searchStore.radius}
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
        onInput={(e) =>
          setRadius(parseInt((e.target as HTMLInputElement).value))
        }
        name="radius-slider"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>500m</span>
        <span>50km</span>
      </div>
    </div>
  );
};

export default RadiusSlider;
