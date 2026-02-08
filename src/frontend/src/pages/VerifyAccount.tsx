import { Component, createSignal, Show, onMount } from "solid-js";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { authApi } from "../api/auth";
import toast from "solid-toast";

const VerifyAccount: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = createSignal("");
  const [code, setCode] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  onMount(() => {
    const emailParam = searchParams.email;
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!code() || code().length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.verifyEmail({
        email: email(),
        code: code(),
      });
      toast.success("Email verified successfully! You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const message =
        err.data?.detail ||
        err.message ||
        "Verification failed. Please check your code.";
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
                Verify Your Account
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to <strong>{email()}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} class="space-y-6">
              <Show when={error()}>
                <div class="bg-danger/10 dark:bg-danger/20 text-danger dark:text-danger border border-danger/30 p-3 rounded-xl text-sm flex items-start gap-2">
                  <span>{error()}</span>
                </div>
              </Show>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-center tracking-widest text-lg"
                  placeholder="XXXXXX"
                  value={code()}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value
                      .toUpperCase()
                      .slice(0, 6);
                    setCode(val);
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading()}
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70"
              >
                {isLoading() ? "Verifying..." : "Verify Account"}
              </button>

              <div class="text-center mt-4">
                <A
                  href="/login"
                  class="text-sm text-primary-600 hover:underline"
                >
                  Back to Login
                </A>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
