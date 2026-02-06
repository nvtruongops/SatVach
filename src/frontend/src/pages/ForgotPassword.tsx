import { Component, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import Header from "../components/Layout/Header";

const ForgotPassword: Component = () => {
  const [email, setEmail] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSent, setIsSent] = createSignal(false);
  const [error, setError] = createSignal("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email().trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // await apiClient.post('/api/v1/auth/forgot-password', { email: email() });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsSent(false);
    setError("");
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 overflow-hidden relative pt-6 pb-28">
      <Header />

      <div class="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md">
          {/* Glass Card */}
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 transform transition-all hover:scale-[1.01] relative">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
                <svg
                  class="w-8 h-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot password?
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            {isSent() ? (
              <div class="text-center" role="status" aria-live="polite">
                <div class="bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary border border-secondary/30 p-4 rounded-xl mb-6 text-sm">
                  <div class="flex items-center justify-center mb-2">
                    <svg
                      class="w-6 h-6 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <p class="font-medium mb-1">Check your email!</p>
                  <p class="text-xs opacity-90">
                    We have sent a password reset link to{" "}
                    <strong>{email()}</strong>
                  </p>
                </div>

                <div class="space-y-3">
                  <A
                    href="/login"
                    class="inline-flex items-center justify-center w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
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
                    Back to log in
                  </A>

                  <button
                    type="button"
                    onClick={handleResend}
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Didn't receive the email? Click to try again
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} class="space-y-6" novalidate>
                <Show when={error()}>
                  <div
                    class="bg-danger/10 dark:bg-danger/20 text-danger dark:text-danger border border-danger/30 p-3 rounded-xl text-sm flex items-start gap-2"
                    role="alert"
                    aria-live="assertive"
                  >
                    <svg
                      class="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>{error()}</span>
                  </div>
                </Show>

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
                    aria-required="true"
                    aria-invalid={error() ? "true" : "false"}
                    aria-describedby={error() ? "email-error" : undefined}
                    class={`block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      error()
                        ? "border-danger focus:ring-danger"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your email"
                    value={email()}
                    onInput={(e) => {
                      setEmail((e.target as HTMLInputElement).value);
                      if (error()) setError("");
                    }}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading()}
                    aria-busy={isLoading() ? "true" : "false"}
                    class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Show when={isLoading()}>
                      <svg
                        class="animate-spin h-4 w-4"
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
                    </Show>
                    {isLoading() ? "Sending..." : "Reset password"}
                  </button>
                </div>

                <div class="text-center mt-4">
                  <A
                    href="/login"
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
                    Back to log in
                  </A>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
