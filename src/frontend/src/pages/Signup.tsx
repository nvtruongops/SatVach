import { Component, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import Header from "../components/Layout/Header";

const Signup: Component = () => {
  const [formData, setFormData] = createSignal({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock signup delay
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Signup logic to be implemented. (Auth Service integration required)",
      );
    }, 1500);
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData(), [target.name]: target.value });
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 overflow-hidden relative pt-6 pb-28">
      <Header />

      {/* Background Ambience */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-10 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div class="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-12">
        <div class="w-full max-w-md">
          {/* Glass Card */}
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 transform transition-all hover:scale-[1.01] relative">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Join Sát Vách
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Create an account to start sharing your favorite spots
              </p>
            </div>

            <form onSubmit={handleSubmit} class="space-y-5">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={formData().name}
                  onInput={handleInput}
                />
              </div>

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
                  value={formData().email}
                  onInput={handleInput}
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
                  autocomplete="new-password"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={formData().password}
                  onInput={handleInput}
                />
              </div>

              <div>
                <label
                  for="confirmPassword"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={formData().confirmPassword}
                  onInput={handleInput}
                />
              </div>

              <div class="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  for="terms"
                  class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <A
                    href="/terms"
                    class="text-primary-600 hover:text-primary-500 font-medium"
                    target="_blank"
                  >
                    Terms
                  </A>{" "}
                  and{" "}
                  <A
                    href="/privacy"
                    class="text-primary-600 hover:text-primary-500 font-medium"
                    target="_blank"
                  >
                    Privacy Policy
                  </A>
                </label>
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
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Already have an account?{" "}
                <A
                  href="/login"
                  class="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
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

export default Signup;
