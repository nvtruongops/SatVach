import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";

const Privacy: Component = () => {
  const navigate = useNavigate();
  return (
    <div class="min-h-screen w-full bg-brand-cream dark:bg-gray-900 relative flex flex-col">
      {/* Background Ambience */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-10 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div class="flex-1 flex justify-center p-4 py-12">
        <div class="w-full max-w-4xl">
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden relative">
            <div class="p-8 md:p-12 custom-scrollbar">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4 sticky top-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md z-10">
                Privacy Policy
              </h1>

              <div class="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
                <section>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    1. Information We Collect
                  </h2>
                  <p>
                    We collect information you provide directly to us, such as
                    when you create an account, submit a location, or contact
                    us. This includes your name, email address, and any content
                    you submit.
                  </p>
                </section>

                <section>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    2. How We Use Your Information
                  </h2>
                  <p>
                    We use the information we collect to provide, maintain, and
                    improve our services, as well as to communicate with you
                    about your account and updates to our services.
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
                    We take reasonable measures to help protect information
                    about you from loss, theft, misuse, and unauthorized access,
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
                    onClick={() => navigate("/signup")}
                    class="text-primary-600 hover:text-primary-500 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer group"
                  >
                    <svg
                      class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
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
                    Back to Signup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
