import { Component, For, createResource, createSignal, Show } from "solid-js";
import { adminApi } from "../../api/admin";

const Users: Component = () => {
  const [page, setPage] = createSignal(0);
  const LIMIT = 10;

  const [users, { refetch }] = createResource(page, (p) =>
    adminApi.getUsers(p * LIMIT, LIMIT),
  );

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`,
      )
    )
      return;
    try {
      await adminApi.updateUserStatus(id, !currentStatus);
      refetch();
    } catch (e) {
      alert("Failed to update user status");
      console.error(e);
    }
  };

  return (
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-brand-blue dark:text-brand-teal tracking-tight">
            User Management
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage system users and verify permissions
          </p>
        </div>
        <button class="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center">
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Add User
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <Show when={users.loading}>
                <For each={[1, 2, 3, 4, 5]}>
                  {() => (
                    <tr>
                      <td class="px-6 py-4">
                        <div class="h-10 bg-gray-200 rounded animate-pulse w-48"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="h-8 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div>
                      </td>
                    </tr>
                  )}
                </For>
              </Show>
              <For each={users()?.items}>
                {(user) => (
                  <tr class="group hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 transition-colors duration-200">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                            {user.username}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.is_superuser
                            ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                            : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {user.is_superuser ? "Admin" : "User"}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.is_active
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                            : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          toggleUserStatus(user.id, user.is_active)
                        }
                        class={`${user.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"} font-medium transition-colors`}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page() === 0}
            class="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="text-sm text-gray-500">Page {page() + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(users()?.items?.length ?? 0) < LIMIT}
            class="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
