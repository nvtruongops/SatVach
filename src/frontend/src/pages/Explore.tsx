import { Component, createSignal, For } from "solid-js";
import Header from "../components/Layout/Header";
// @ts-ignore
import heroImage from "../assets/explore-hero.jpg";

const Explore: Component = () => {
  const [posts] = createSignal([]);

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <Header />

      {/* Prominent Hero Header with Scroll Interaction */}
      <div class="h-screen w-full relative overflow-hidden group">
        <div
          class="absolute inset-0 transition-transform duration-[20s] ease-linear transform scale-110 group-hover:scale-125"
          style={{
            "background-image": `url(${heroImage})`,
            "background-size": "cover",
            "background-position": "center 65%",
          }}
        ></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-brand-cream dark:to-gray-900"></div>

        {/* Hero Content Overlay - Top Right */}
        <div class="absolute inset-0 flex items-start justify-end p-6 md:p-12 lg:p-20 z-20 pointer-events-none">
          <div class="max-w-4xl text-right pointer-events-auto transform translate-y-4 md:translate-y-8">
            <h1
              class="text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-none text-brand-yellow whitespace-nowrap"
              style={{
                "-webkit-text-stroke": "2px #FE6D73",
                "text-shadow": "0 10px 20px rgba(0,0,0,0.3)",
              }}
            >
              Explore Sài Gòn
            </h1>
            <p
              class="text-xl md:text-2xl font-bold text-brand-yellow drop-shadow-lg"
              style={{ "-webkit-text-stroke": "1px #FE6D73" }}
            >
              Connect with your community and discover local favorites.
            </p>
          </div>
        </div>

        {/* Scroll Indicator - Bottom Center */}
        <div class="absolute bottom-10 inset-x-0 flex justify-center text-white z-20">
          <div
            class="animate-bounce cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            <svg
              class="w-10 h-10 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          {/* Compose Post */}
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700">
            <div class="flex gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex-shrink-0"></div>
              <input
                type="text"
                placeholder="Share your discovery..."
                class="w-full bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-2xl px-6 focus:ring-4 focus:ring-brand-blue/20 transition-all font-medium text-lg"
              />
            </div>
            <div class="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="flex gap-4">
                <ActionButton label="Photo" />
                <ActionButton label="Location" />
              </div>
              <button class="bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand-blue/30 active:scale-95">
                Post
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          <div class="space-y-6">
            <For each={posts()}>
              {(post: any) => (
                <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/10 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  {/* Post Header */}
                  <div class="flex justify-between items-start mb-6">
                    <div class="flex gap-4">
                      <img
                        src={post.user.avatar}
                        class="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-blue/10"
                        alt={post.user.name}
                      />
                      <div>
                        <h4 class="font-bold text-gray-900 dark:text-white text-lg hover:text-brand-blue transition-colors cursor-pointer">
                          {post.user.name}
                        </h4>
                        <div class="flex items-center text-sm text-gray-500 font-medium">
                          <span>{post.time}</span>
                          {post.location && (
                            <>
                              <span class="mx-2 opacity-50">•</span>
                              <span class="text-brand-blue">
                                {post.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p class="text-gray-800 dark:text-gray-200 mb-6 text-lg leading-relaxed font-medium">
                    {post.content}
                  </p>

                  {post.image && (
                    <div class="rounded-2xl overflow-hidden mb-6 shadow-inner ring-1 ring-black/5">
                      <img
                        src={post.image}
                        class="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                        alt="Post media"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div class="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700">
                    <PostAction
                      label={post.likes}
                      activeColor="text-brand-red"
                    />
                    <PostAction label={post.comments} />
                    <PostAction label="Share" />
                  </div>
                </div>
              )}
            </For>
          </div>

          <div class="flex justify-center py-12">
            <div class="flex space-x-2">
              <div class="w-3 h-3 bg-brand-blue rounded-full animate-bounce"></div>
              <div class="w-3 h-3 bg-brand-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-3 h-3 bg-brand-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const ActionButton = (props: { label: string }) => (
  <button class="px-5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-brand-blue font-bold tracking-tight transition-all active:scale-95">
    {props.label}
  </button>
);

const PostAction = (props: {
  label: string | number;
  activeColor?: string;
}) => (
  <button
    class={`flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-95`}
  >
    <span
      class={`text-base font-bold text-gray-600 dark:text-gray-400 ${props.activeColor ? `hover:${props.activeColor}` : ""}`}
    >
      {props.label}
    </span>
  </button>
);

export default Explore;
