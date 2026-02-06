import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Header from "../components/Layout/Header";

const Privacy: Component = () => {
  const navigate = useNavigate();
  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 pt-6 pb-28 relative">
      <Header />

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
          <div class="p-8 md:p-12">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              Privacy Policy
            </h1>

            <div class="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, submit a location, or contact us.
                  This includes your name, email address, and any content you
                  submit.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. How We Use Your Information
                </h2>
                <p>
                  We use the information we collect to provide, maintain, and
                  improve our services, as well as to communicate with you about
                  your account and updates to our services.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Location Data
                </h2>
                <p>
                  As a location-based service, we collect and process location
                  data to show you relevant content nearby. You can control
                  location access through your device settings.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  4. Data Security
                </h2>
                <p>
                  We take reasonable measures to help protect information about
                  you from loss, theft, misuse, and unauthorized access,
                  disclosure, alteration, and destruction.
                </p>
              </section>

              <section>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  5. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at privacy@satvach.com.
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

export default Privacy;
