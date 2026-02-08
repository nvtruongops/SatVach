import { Component, createSignal, createResource, Show, For } from "solid-js";
import { adminApi } from "../../api/admin";
import { Location } from "../../api/locations";

const LocationManager: Component = () => {
  const [statusFilter, setStatusFilter] = createSignal<
    "pending" | "approved" | "rejected"
  >("pending");

  const [locations, { refetch }] = createResource<
    Location[],
    "pending" | "approved" | "rejected"
  >(statusFilter, (status) =>
    adminApi.getLocations(status).then((res) => res.items),
  );

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this location?")) return;
    try {
      await adminApi.updateLocationStatus(id, "approved");
      refetch();
    } catch (e) {
      alert("Failed to approve location");
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return; // Cancelled

    try {
      await adminApi.updateLocationStatus(id, "rejected", reason);
      refetch();
    } catch (e) {
      alert("Failed to reject location");
      console.error(e);
    }
  };

  return (
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Location Management
        </h1>
        <div class="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setStatusFilter("pending")}
            class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter() === "pending"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter() === "approved"
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter() === "rejected"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <Show when={locations.loading}>
                <For each={[1, 2, 3, 4, 5]}>
                  {() => (
                    <tr>
                      <td class="px-6 py-4">
                        <div class="flex items-center animate-pulse">
                          <div class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                          <div class="ml-4 space-y-2">
                            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  )}
                </For>
              </Show>
              <Show when={!locations.loading && locations()?.length === 0}>
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center justify-center text-gray-500">
                      <svg
                        class="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p class="text-base font-medium text-gray-900 dark:text-gray-100">
                        No locations found
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        There are no locations with status "{statusFilter()}".
                      </p>
                    </div>
                  </td>
                </tr>
              </Show>
              <For each={locations()}>
                {(loc) => (
                  <tr class="group hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 transition-colors duration-200">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                            {loc.title}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {loc.address || "No address"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {loc.category}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          loc.status === "approved"
                            ? "bg-brand-teal/10 text-brand-teal border-brand-teal/20"
                            : loc.status === "rejected"
                              ? "bg-brand-red/10 text-brand-red border-brand-red/20"
                              : "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20"
                        }`}
                      >
                        {loc.status.charAt(0).toUpperCase() +
                          loc.status.slice(1)}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(loc.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                      <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Show when={loc.status === "pending"}>
                          <button
                            onClick={() => handleApprove(loc.id)}
                            class="text-brand-teal hover:text-white border border-brand-teal hover:bg-brand-teal font-medium px-3 py-1 rounded-md transition-all duration-200 text-xs uppercase tracking-wide"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(loc.id)}
                            class="text-brand-red hover:text-white border border-brand-red hover:bg-brand-red font-medium px-3 py-1 rounded-md transition-all duration-200 text-xs uppercase tracking-wide"
                          >
                            Reject
                          </button>
                        </Show>
                        <Show when={loc.status !== "pending"}>
                          <span class="text-gray-400 italic text-xs">
                            {loc.status === "approved"
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        </Show>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationManager;
