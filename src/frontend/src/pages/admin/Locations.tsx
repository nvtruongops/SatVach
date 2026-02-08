import { Component } from "solid-js";
import LocationManager from "../../components/Admin/LocationManager";

const Locations: Component = () => {
  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Location Management
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and manage location submissions
          </p>
        </div>
      </div>
      <LocationManager />
    </div>
  );
};

export default Locations;
