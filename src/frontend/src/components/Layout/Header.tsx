import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { A, useNavigate, useLocation } from "@solidjs/router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = createSignal(false);
  const [plusMenuOpen, setPlusMenuOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;
  let plusMenuRef: HTMLDivElement | undefined;

  // Close menu on click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      setMenuOpen(false);
    }
    if (plusMenuRef && !plusMenuRef.contains(e.target as Node)) {
      setPlusMenuOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });
  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen());
    setPlusMenuOpen(false);
  };

  const togglePlusMenu = () => {
    setPlusMenuOpen(!plusMenuOpen());
    setMenuOpen(false);
  };

  const isPlusActive = () =>
    ["/contribute", "/new-post"].includes(location.pathname);

  const isMoreActive = () => ["/about", "/contact"].includes(location.pathname);

  // Theme cycling: light → dark → system
  const cycleTheme = () => {
    const current = theme();
    if (current === "light") setTheme("dark");
    else if (current === "dark") setTheme("system");
    else setTheme("light");
    // Keep menu open so user can see the change
  };

  const themeLabel = () => {
    const t = theme();
    if (t === "light") return "Sáng";
    if (t === "dark") return "Tối";
    return "Hệ thống";
  };

  const ThemeIcon = () => {
    const t = theme();
    if (t === "light") {
      return (
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
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }
    if (t === "dark") {
      return (
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
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
    // system
    return (
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
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  return (
    <>
      {/* Overlay to close menu when tapping outside */}
      <Show when={menuOpen() || plusMenuOpen()}>
        <div
          class="fixed inset-0 z-[99]"
          onClick={() => {
            setMenuOpen(false);
            setPlusMenuOpen(false);
          }}
        />
      </Show>

      <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-auto min-w-max rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white/90 dark:hover:bg-gray-900/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-visible">
        <div class="px-2 py-2">
          <div class="flex items-center justify-between gap-1 sm:gap-2">
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
                  />
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
                  />
                </svg>
              </A>

              {/* Primary Action Button (+) — Radial menu with 2 options */}
              <div class="relative" ref={plusMenuRef}>
                <button
                  onClick={togglePlusMenu}
                  class={`mx-2 p-3 rounded-full shadow-lg transition-all duration-300 ${
                    plusMenuOpen() || isPlusActive()
                      ? "bg-primary-700 text-white scale-105"
                      : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105"
                  }`}
                  title="Tạo mới"
                >
                  <svg
                    class={`w-6 h-6 transition-transform duration-300 ${plusMenuOpen() ? "rotate-45" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                {/* Radial: Contribute (left) */}
                <button
                  onClick={() => {
                    setPlusMenuOpen(false);
                    navigate("/contribute");
                  }}
                  class={`radial-item absolute bottom-full left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    plusMenuOpen()
                      ? "opacity-100 pointer-events-auto -translate-x-[calc(50%+36px)] -translate-y-3 scale-100"
                      : "opacity-0 pointer-events-none -translate-x-1/2 translate-y-0 scale-50"
                  }`}
                  title="Đóng góp địa điểm"
                >
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap mb-0.5">
                    Địa điểm
                  </span>
                  <div class="w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-white/40 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 transition-all">
                    <svg
                      class="w-5 h-5 text-brand-blue dark:text-brand-teal"
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
                </button>

                {/* Radial: New Post (right) */}
                <button
                  onClick={() => {
                    setPlusMenuOpen(false);
                    navigate("/new-post");
                  }}
                  class={`radial-item absolute bottom-full left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-[50ms] ${
                    plusMenuOpen()
                      ? "opacity-100 pointer-events-auto -translate-x-[calc(50%-36px)] -translate-y-3 scale-100"
                      : "opacity-0 pointer-events-none -translate-x-1/2 translate-y-0 scale-50"
                  }`}
                  title="Viết bài"
                >
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap mb-0.5">
                    Bài viết
                  </span>
                  <div class="w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-white/40 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 transition-all">
                    <svg
                      class="w-5 h-5 text-brand-yellow dark:text-brand-yellow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* More Menu — Radial arc (3 dots fan out) */}
              <div class="relative" ref={menuRef}>
                <button
                  onClick={toggleMenu}
                  class={`p-3 transition-all duration-300 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${
                    isMoreActive() || menuOpen()
                      ? "text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  }`}
                  title="More"
                >
                  {/* Animated dots icon: 3 dots morph into X when open */}
                  <svg
                    class={`w-6 h-6 transition-transform duration-300 ${menuOpen() ? "rotate-45" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <Show
                      when={menuOpen()}
                      fallback={
                        <>
                          <circle
                            cx="12"
                            cy="5"
                            r="1.5"
                            fill="currentColor"
                            stroke="none"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="1.5"
                            fill="currentColor"
                            stroke="none"
                          />
                          <circle
                            cx="12"
                            cy="19"
                            r="1.5"
                            fill="currentColor"
                            stroke="none"
                          />
                        </>
                      }
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </Show>
                  </svg>
                </button>

                {/* Radial Bubble Items — fan out in arc */}
                {/* About (left arc) */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/about");
                  }}
                  class={`radial-item absolute bottom-full left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    menuOpen()
                      ? "opacity-100 pointer-events-auto -translate-x-[calc(50%+52px)] -translate-y-3 scale-100"
                      : "opacity-0 pointer-events-none -translate-x-1/2 translate-y-0 scale-50"
                  }`}
                  title="About Us"
                >
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap mb-0.5">
                    About
                  </span>
                  <div class="w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-white/40 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 transition-all">
                    <svg
                      class="w-5 h-5 text-brand-blue dark:text-brand-teal"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </button>

                {/* Theme (center arc — straight up) */}
                <button
                  onClick={cycleTheme}
                  class={`radial-item absolute bottom-full left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-[50ms] ${
                    menuOpen()
                      ? "opacity-100 pointer-events-auto -translate-x-1/2 -translate-y-6 scale-100"
                      : "opacity-0 pointer-events-none -translate-x-1/2 translate-y-0 scale-50"
                  }`}
                  title={`Theme: ${themeLabel()}`}
                >
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap mb-0.5">
                    {themeLabel()}
                  </span>
                  <div class="relative w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-white/40 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 transition-all">
                    <span class="text-brand-yellow">
                      <ThemeIcon />
                    </span>
                    {/* Tiny indicator */}
                    <div
                      class={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        resolvedTheme() === "dark"
                          ? "bg-indigo-400"
                          : "bg-amber-400"
                      }`}
                    />
                  </div>
                </button>

                {/* Contact (right arc) */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/contact");
                  }}
                  class={`radial-item absolute bottom-full left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-100 ${
                    menuOpen()
                      ? "opacity-100 pointer-events-auto -translate-x-[calc(50%-52px)] -translate-y-3 scale-100"
                      : "opacity-0 pointer-events-none -translate-x-1/2 translate-y-0 scale-50"
                  }`}
                  title="Contact"
                >
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap mb-0.5">
                    Contact
                  </span>
                  <div class="w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-white/40 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 transition-all">
                    <svg
                      class="w-5 h-5 text-brand-teal"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Auth-aware: Login when not authed, Profile when authed */}
              <Show
                when={isAuthenticated()}
                fallback={
                  <A
                    href="/login"
                    class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    title="Login"
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
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </A>
                }
              >
                <A
                  href="/profile"
                  class="p-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  title="Profile"
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
                    />
                  </svg>
                </A>
              </Show>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
