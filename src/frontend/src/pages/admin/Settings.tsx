import { Component } from "solid-js";

const Settings: Component = () => {
  return (
    <div class="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-brand-blue dark:text-brand-teal tracking-tight">
          System Settings
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure application preferences and system defaults
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-8 space-y-8">
        {/* General Settings */}
        <section>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-brand-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            General Configuration
          </h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label
                for="site-name"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Site Name
              </label>
              <input
                id="site-name"
                name="site-name"
                type="text"
                value="Sát Vách"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white dark:bg-gray-700 transition-all text-sm"
              />
            </div>
            <div class="space-y-2">
              <label
                for="support-email"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Support Email
              </label>
              <input
                id="support-email"
                name="support-email"
                type="email"
                value="support@satvach.com"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white dark:bg-gray-700 transition-all text-sm"
              />
            </div>
          </div>
        </section>

        <div class="border-t border-gray-100 dark:border-gray-700"></div>

        {/* Location Settings */}
        <section>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-brand-teal"
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
            Location Defaults
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  Auto-approve Trusted Users
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically approve locations submitted by verified users
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="auto-approve"
                  name="auto-approve"
                  value=""
                  class="sr-only peer"
                  checked
                  aria-label="Auto-approve Trusted Users"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-teal/30 dark:peer-focus:ring-brand-teal/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-teal"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  Default Search Radius
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Initial search radius for location queries (km)
                </p>
              </div>
              <input
                type="number"
                id="default-radius"
                name="default-radius"
                value="5"
                class="w-20 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal bg-white dark:bg-gray-700 text-sm"
                aria-label="Default Search Radius"
              />
            </div>
          </div>
        </section>

        <div class="flex justify-end pt-6">
          <button class="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
