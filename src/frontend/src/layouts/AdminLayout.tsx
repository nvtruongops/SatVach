import { Component, JSX, Show, createSignal } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiMapPin,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiMail,
} from "solid-icons/fi";

interface AdminLayoutProps {
  children: JSX.Element;
}

const AdminLayout: Component<AdminLayoutProps> = (props) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = (props: {
    path: string;
    icon: Component<{ class?: string }>;
    label: string;
  }) => (
    <A
      href={props.path}
      class={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-r-4 ${
        isActive(props.path)
          ? "text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 border-brand-blue"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent"
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <props.icon
        class={`w-5 h-5 mr-3 transition-colors ${
          isActive(props.path)
            ? "text-brand-blue"
            : "text-gray-400 group-hover:text-gray-500"
        }`}
      />
      {props.label}
    </A>
  );

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      <Show when={sidebarOpen()}>
        <div
          class="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      </Show>

      {/* Sidebar */}
      <aside
        class={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:transform-none ${
          sidebarOpen() ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <span class="text-xl font-bold text-brand-blue dark:text-brand-teal tracking-tight">
            Sát Vách Admin
          </span>
          <button
            class="ml-auto lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <FiX class="w-6 h-6" />
          </button>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-3 px-3 py-3 mb-6 bg-brand-cream dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
            <div class="w-10 h-10 rounded-full bg-brand-blue dark:bg-brand-blue text-white flex items-center justify-center font-bold shadow-sm">
              {user()?.username.charAt(0).toUpperCase()}
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user()?.username}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user()?.email}
              </p>
            </div>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto space-y-1">
          <div class="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Overview
          </div>
          <NavItem path="/admin" icon={FiHome} label="Dashboard" />

          <div class="px-6 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Management
          </div>
          <NavItem path="/admin/locations" icon={FiMapPin} label="Locations" />
          <NavItem path="/admin/users" icon={FiUsers} label="Users" />
          <NavItem path="/admin/messages" icon={FiMail} label="Messages" />

          <div class="px-6 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            System
          </div>
          <NavItem path="/admin/settings" icon={FiSettings} label="Settings" />
        </nav>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            class="flex items-center w-full px-4 py-2.5 text-sm font-medium text-brand-red hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group"
          >
            <FiLogOut class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div class="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header class="lg:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Open Sidebar"
          >
            <FiMenu class="w-6 h-6" />
          </button>
          <span class="font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </span>
          <div class="w-6" /> {/* Spacer */}
        </header>

        <main class="flex-1 p-4 lg:p-8 overflow-y-auto">{props.children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
