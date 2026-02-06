import { createSignal } from "solid-js";
import { A } from "@solidjs/router";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  return (
    <nav
      class={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
        ${
          isMenuOpen()
            ? "w-[90vw] max-w-sm rounded-[2rem] bg-white/90 dark:bg-gray-900/90"
            : "w-auto min-w-max rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white/90 dark:hover:bg-gray-900/90"
        } 
        backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden`}
    >
      <div class="px-2 py-2">
        <div class="flex items-center justify-between gap-1 sm:gap-2">
          {/* Nav Links (Desktop style but used on Mobile too for this specific requested layout) */}
          <div class="flex items-center gap-1">
            <A
              href="/"
              class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              title="Home"
              activeClass="text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </A>

            <A
              href="/explore"
              class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              title="Explore"
              activeClass="text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </A>

            {/* Primary Action Button (Add) */}
            <A
              href="/contribute"
              class="mx-2 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all"
              title="Contribute"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </A>

            <A
              href="/about"
              class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              title="About"
              activeClass="text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </A>

            <A
              href="/login"
              class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              title="Profile/Login"
              activeClass="text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </A>
          </div>
        </div>
      </div>
    </nav>
  );
}
