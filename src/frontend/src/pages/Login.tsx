import { Component, createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";

const Login: Component = () => {
  // Load saved email if "Remember me" was checked
  const savedEmail = localStorage.getItem("rememberedEmail") || "";
  const wasRemembered = localStorage.getItem("rememberMe") === "true";

  const [usernameOrEmail, setUsernameOrEmail] = createSignal(savedEmail);
  const [password, setPassword] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(wasRemembered);
  const [showPassword, setShowPassword] = createSignal(false);
  const [error, setError] = createSignal("");

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!usernameOrEmail()) {
      setError("Please enter your email or username.");
      return;
    }

    if (password().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Handle "Remember me" functionality
    if (rememberMe()) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("rememberedEmail", usernameOrEmail());
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }

    try {
      await login(usernameOrEmail(), password());
      navigate("/");
    } catch (err: any) {
      const message =
        err.data?.detail ||
        err.message ||
        "Invalid email or password. Please try again.";
      setError(message);
    }
  };

  return (
    <div class="h-screen w-full bg-brand-cream dark:bg-gray-900 overflow-hidden relative flex flex-col">
      {/* Background Ambience */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div class="flex-1 flex items-center justify-center p-4 min-h-0 overflow-y-auto no-scrollbar">
        <div class="w-full max-w-md my-auto">
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
                  for="usernameOrEmail"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email or Username
                </label>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  autocomplete="username"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com or username"
                  value={usernameOrEmail()}
                  onInput={(e) => {
                    setUsernameOrEmail((e.target as HTMLInputElement).value);
                    if (error()) setError("");
                  }}
                />
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword() ? "text" : "password"}
                    autocomplete="current-password"
                    required
                    class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-10"
                    placeholder="••••••••"
                    value={password()}
                    onInput={(e) => {
                      setPassword((e.target as HTMLInputElement).value);
                      if (error()) setError("");
                    }}
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword())}
                  >
                    {showPassword() ? (
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
