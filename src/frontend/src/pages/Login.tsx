import { Component, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import Header from "../components/Layout/Header";

const Login: Component = () => {
  // Load saved email if "Remember me" was checked
  const savedEmail = localStorage.getItem("rememberedEmail") || "";
  const wasRemembered = localStorage.getItem("rememberMe") === "true";

  const [email, setEmail] = createSignal(savedEmail);
  const [password, setPassword] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(wasRemembered);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Handle "Remember me" functionality
    if (rememberMe()) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("rememberedEmail", email());
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }

    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      // Mock error for UI review purposes
      setError("Invalid email or password. Please try again.");
    }, 1500);
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 overflow-hidden relative pt-6 pb-28">
      <Header />

      {/* Background Ambience */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div class="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md">
          {/* Glass Card */}
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 transform transition-all hover:scale-[1.005] duration-300 relative">
            {/* Error Message */}
            <Show when={error()}>
              <div class="mb-6 p-4 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-center animate-fade-in">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error()}
              </div>
            </Show>
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Sign in to continue your journey with Sát Vách
              </p>
            </div>

            {/* Social Login (Coming Soon) */}
            <div class="grid grid-cols-2 gap-3 mb-6">
              <button
                disabled
                class="relative flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  class="h-5 w-5 mr-2"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Google
                </span>
                <span class="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-brand-yellow text-gray-900 rounded-full shadow-sm">
                  Soon
                </span>
              </button>
              <button
                disabled
                class="relative flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60"
              >
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  alt="GitHub"
                  class="h-5 w-5 mr-2 dark:invert"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  GitHub
                </span>
                <span class="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-brand-yellow text-gray-900 rounded-full shadow-sm">
                  Soon
                </span>
              </button>
            </div>

            <div class="relative mb-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-transparent text-gray-500 backdrop-blur-sm">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} class="space-y-6">
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  value={email()}
                  onInput={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                />
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password()}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                />
              </div>

              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe()}
                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    for="remember-me"
                    class="ml-2 block text-gray-900 dark:text-gray-300 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <div class="text-sm">
                  <A
                    href="/forgot-password"
                    class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Forgot password?
                  </A>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading()}
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading() ? (
                    <svg
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Don't have an account?{" "}
                <A
                  href="/signup"
                  class="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </A>
              </p>

              <A
                href="/"
                class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Back to Home
              </A>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
