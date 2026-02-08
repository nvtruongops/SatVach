import { Component, createResource, Show, For } from "solid-js";
import { FiTrendingUp, FiMapPin, FiUsers, FiClock } from "solid-icons/fi";
import { adminApi } from "../../api/admin";

const Dashboard: Component = () => {
  const [dashboardData] = createResource(adminApi.getDashboardStats);

  const StatCard = (props: {
    title: string;
    value: string | number;
    trend?: string;
    icon: Component<{ class?: string }>;
    color: string;
    textColor: string;
    loading?: boolean;
  }) => (
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-default">
      <div class="flex items-start justify-between">
        <div class="w-full">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {props.title}
          </p>
          <Show
            when={!props.loading}
            fallback={
              <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
            }
          >
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {props.value}
            </h3>
          </Show>
        </div>
        <div
          class={`p-3 rounded-lg ${props.color} bg-opacity-10 text-opacity-100 group-hover:bg-opacity-20 transition-all`}
        >
          <props.icon class={`w-6 h-6 ${props.textColor}`} />
        </div>
      </div>
      <Show when={props.trend}>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-brand-teal flex items-center font-medium">
            <FiTrendingUp class="w-4 h-4 mr-1" />
            {props.trend}
          </span>
          <span class="text-gray-400 ml-2">vs last month</span>
        </div>
      </Show>
    </div>
  );

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-brand-blue dark:text-brand-teal tracking-tight">
          Dashboard Overview
        </h1>
        <div class="flex gap-2">
          <select
            aria-label="Select Date Range"
            title="Date Range"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Locations"
          value={dashboardData()?.stats.total_locations || 0}
          icon={FiMapPin}
          color="bg-brand-blue"
          textColor="text-brand-blue"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Active Users"
          value={dashboardData()?.stats.total_users || 0}
          icon={FiUsers}
          color="bg-brand-teal"
          textColor="text-brand-teal"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Pending Reviews"
          value={dashboardData()?.stats.pending_locations || 0}
          icon={FiClock}
          color="bg-brand-yellow"
          textColor="text-brand-yellow"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Rejected Locations"
          value={dashboardData()?.stats.rejected_locations || 0}
          icon={FiTrendingUp}
          color="bg-brand-red"
          textColor="text-brand-red"
          loading={dashboardData.loading}
        />
      </div>

      {/* Recent Activity */}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent System Activity
        </h2>
        <div class="space-y-4">
          <Show when={dashboardData.loading}>
            <For each={[1, 2, 3]}>
              {() => (
                <div class="flex items-center text-sm animate-pulse">
                  <div class="w-2 h-2 rounded-full bg-gray-200 mr-3"></div>
                  <div class="h-4 w-32 bg-gray-200 rounded"></div>
                  <div class="ml-auto h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              )}
            </For>
          </Show>
          <Show when={!dashboardData.loading}>
            <For each={dashboardData()?.recent_activity}>
              {(loc) => (
                <div class="flex items-center text-sm">
                  <div
                    class={`w-2 h-2 rounded-full mr-3 ${
                      loc.status === "approved"
                        ? "bg-green-500"
                        : loc.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span class="text-gray-900 dark:text-white font-medium">
                    New Location: {loc.title}
                  </span>
                  <span class="text-gray-500 mx-2">-</span>
                  <span class="text-gray-500">{loc.status}</span>
                  <span class="ml-auto text-gray-400">
                    {new Date(loc.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </For>
            <Show when={dashboardData()?.recent_activity.length === 0}>
              <p class="text-gray-500 text-sm italic">No recent activity.</p>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
