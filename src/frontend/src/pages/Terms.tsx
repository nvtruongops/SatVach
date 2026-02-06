import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Header from "../components/Layout/Header";

const Terms: Component = () => {
  const navigate = useNavigate();
  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 pt-6 pb-28 relative">
      <Header />

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
          <div class="p-8 md:p-12">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              Terms of Service
            </h1>

            <div class="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Sát Vách ("the Service"), you agree to
                  be bound by these Terms of Service. If you do not agree to
                  these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. User Conduct
                </h2>
                <p>
                  You agree to use the Service only for lawful purposes. You are
                  prohibited from posting content that is offensive, harmful, or
                  violates the rights of others. We reserve the right to remove
                  any content that violates these terms.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Content Ownership
                </h2>
                <p>
                  Users retain ownership of the content they submit to the
                  Service. However, by submitting content, you grant Sát Vách a
                  non-exclusive, worldwide, royalty-free license to use,
                  display, and distribute your content in connection with the
                  Service.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  4. Disclaimer of Warranties
                </h2>
                <p>
                  The Service is provided "as is" without any warranties of any
                  kind. We do not guarantee that the Service will be
                  uninterrupted, error-free, or secure.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  5. Changes to Terms
                </h2>
                <p>
                  We may modify these Terms at any time. We will provide notice
                  of significant changes. Your continued use of the Service
                  after changes are made constitutes your acceptance of the new
                  Terms.
                </p>
              </section>

              <div class="pt-8 text-sm text-gray-500 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 mt-8">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate("/");
                    }
                  }}
                  class="text-primary-600 hover:text-primary-500 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
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
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
