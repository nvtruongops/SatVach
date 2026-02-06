import { Component, createSignal, onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Header from "../components/Layout/Header";

const About: Component = () => {
  const navigate = useNavigate();
  const [historyCount, setHistoryCount] = createSignal(0);

  onMount(() => {
    setHistoryCount(window.history.length);
  });

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 font-sans selection:bg-brand-teal/30 selection:text-brand-blue relative overflow-hidden">
      <Header />

      {/* Hero Section */}
      <div class="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Ambient Background */}
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-[120px]"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 border border-brand-teal/20 backdrop-blur-sm mb-8 animate-fade-in">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
            </span>
            <span class="text-sm font-medium text-brand-blue dark:text-brand-teal">
              Now available for Sài Gòn
            </span>
          </div>

          <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in delay-100">
            <span class="block text-gray-900 dark:text-white mb-2">
              Discover the gems
            </span>
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-teal to-brand-blue bg-[length:200%_auto] animate-gradient pb-2">
              right next door.
            </span>
          </h1>

          <p class="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200">
            Sát Vách is the open-source, privacy-first community map designed to
            connect you with the best local spots, services, and neighbors.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in delay-300">
            <A
              href="/"
              class="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-brand-blue rounded-full hover:bg-brand-blue/90 hover:shadow-lg hover:shadow-brand-blue/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              Start Exploring
              <svg
                class="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </A>
            <a
              href="https://github.com/nvtruongops/SatVach"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-900 dark:text-white transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              View Source
            </a>
          </div>
        </div>
      </div>

      {/* Features Grid (Bento Style) */}
      <div class="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative border-t border-b border-white/20 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Sát Vách?
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for the community, by the community. We're changing how you
              discover your neighborhood.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Community */}
            <div class="md:col-span-2 group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-teal/20 transition-colors duration-500"></div>
              <div class="relative z-10">
                <div class="h-14 w-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-6 text-brand-teal">
                  <svg
                    class="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Community Powered
                </h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Every location is added and verified by locals. Whether it's a
                  hidden café in an alley or the best street food vendor, our
                  map reflects the true spirit of the neighborhood.
                </p>
              </div>
            </div>

            {/* Card 2: Privacy */}
            <div class="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="absolute bottom-0 left-0 w-40 h-40 bg-brand-blue/10 rounded-full -ml-10 -mb-10 blur-2xl group-hover:bg-brand-blue/20 transition-colors duration-500"></div>
              <div class="relative z-10">
                <div class="h-14 w-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 text-brand-blue">
                  <svg
                    class="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Privacy First
                </h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We don't track your movements. Your location data stays on
                  your device until you choose to share it.
                </p>
              </div>
            </div>

            {/* Card 3: Open Source */}
            <div class="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-0 right-0 w-40 h-40 bg-brand-yellow/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-brand-yellow/20 transition-colors duration-500"></div>
              <div class="relative z-10">
                <div class="h-14 w-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 text-brand-yellow">
                  <svg
                    class="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Open Source
                </h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                  The code is open for everyone to inspect, contribute to, and
                  learn from. Built with modern tech.
                </p>
              </div>
            </div>

            {/* Card 4: Tech Stack */}
            <div class="md:col-span-2 group relative bg-gradient-to-br from-brand-blue to-brand-teal rounded-3xl p-8 shadow-xl shadow-brand-teal/20 border border-transparent overflow-hidden hover:shadow-2xl transition-all duration-300 text-white">
              <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
                <div class="text-left w-full sm:w-1/2">
                  <h3 class="text-2xl font-bold mb-4">
                    Built with Modern Tech
                  </h3>
                  <p class="text-white/90 leading-relaxed mb-6">
                    Leveraging the power of SolidJS for reactivity, TailwindCSS
                    for styling, and PostGIS for powerful geospatial queries.
                  </p>
                  <a
                    href="https://github.com/nvtruongops/SatVach"
                    class="inline-flex items-center text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors border border-white/20"
                  >
                    Check the Repo
                    <svg
                      class="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
                {/* Tech Badges */}
                <div class="flex flex-wrap gap-3 justify-center sm:justify-end w-full sm:w-1/2 opacity-90">
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    SolidJS
                  </span>
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    TypeScript
                  </span>
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    Tailwind
                  </span>
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    Vite
                  </span>
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    MapLibre
                  </span>
                  <span class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 font-mono text-sm shadow-sm">
                    PostGIS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div class="col-span-1 md:col-span-1">
              <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-teal">
                Sát Vách
              </span>
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Discover the world right next door. A privacy-first, open-source
                project for Sài Gòn.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
                Product
              </h4>
              <ul class="space-y-3">
                <li>
                  <A
                    href="/"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    Map
                  </A>
                </li>
                <li>
                  <A
                    href="/about"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    About
                  </A>
                </li>
                <li>
                  <span class="text-sm text-gray-400 cursor-not-allowed">
                    Contributors
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
                Legal
              </h4>
              <ul class="space-y-3">
                <li>
                  <A
                    href="/terms"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    Terms of Service
                  </A>
                </li>
                <li>
                  <A
                    href="/privacy"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    Privacy Policy
                  </A>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
                Social
              </h4>
              <ul class="space-y-3">
                <li>
                  <a
                    href="https://github.com/nvtruongops/SatVach"
                    target="_blank"
                    rel="noreferrer"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors flex items-center"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Sát Vách. Licensed under MIT.
            </p>

            {/* Conditional Back Button (Only shows if history exists) */}
            <div class="flex items-center">
              {historyCount() > 1 && (
                <button
                  onClick={() => navigate(-1)}
                  class="text-sm text-gray-500 hover:text-brand-blue transition-colors flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
