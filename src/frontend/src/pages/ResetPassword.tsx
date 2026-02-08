import { Component, createSignal, Show, onMount } from "solid-js";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { authApi } from "../api/auth";
import toast from "solid-toast";

const ResetPassword: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = createSignal("");
  const [code, setCode] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal(false);

  onMount(() => {
    if (searchParams.email) {
      setEmail(searchParams.email);
    }
    if (searchParams.code) {
      setCode(searchParams.code);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!email().trim() || !code().trim() || !newPassword()) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword().length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        email: email(),
        code: code(),
        new_password: newPassword(),
      });
      toast.success("Password reset successfully! You can now login.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      const message =
        err.data?.detail ||
        err.message ||
        "Failed to reset password. Please check your code and try again.";
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="h-screen w-full bg-brand-cream dark:bg-gray-900 overflow-hidden relative flex flex-col">
      <div class="flex-1 flex items-center justify-center p-4 min-h-0 overflow-y-auto no-scrollbar">
        <div class="w-full max-w-md my-auto">
          {/* Glass Card */}
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 transform transition-all hover:scale-[1.01] relative">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Reset Password
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enter your code and new password
              </p>
            </div>

            <Show when={success()}>
              <div class="text-center mb-4">
                <div class="bg-green-100 text-green-700 p-3 rounded-lg">
                  Password reset successfully! Redirecting to login...
                </div>
              </div>
            </Show>

            <Show when={!success()}>
              <form onSubmit={handleSubmit} class="space-y-6" novalidate>
                <Show when={error()}>
                  <div
                    class="bg-danger/10 dark:bg-danger/20 text-danger dark:text-danger border border-danger/30 p-3 rounded-xl text-sm flex items-start gap-2"
                    role="alert"
                  >
                    <span>{error()}</span>
                  </div>
                </Show>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    value={email()}
                    onInput={(e) =>
                      setEmail((e.target as HTMLInputElement).value)
                    }
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter 6-digit code"
                    value={code()}
                    onInput={(e) =>
                      setCode((e.target as HTMLInputElement).value)
                    }
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minlength="8"
                    class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Min 8 characters"
                    value={newPassword()}
                    onInput={(e) =>
                      setNewPassword((e.target as HTMLInputElement).value)
                    }
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading()}
                    class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading() ? "Resetting..." : "Set New Password"}
                  </button>
                </div>

                <div class="text-center mt-4">
                  <A
                    href="/login"
                    class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    Back to log in
                  </A>
                </div>
              </form>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
