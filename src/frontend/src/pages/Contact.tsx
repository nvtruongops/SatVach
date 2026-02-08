import { Component, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import Header from "../components/Layout/Header";
import { useAuth } from "../context/AuthContext";
import { contactApi } from "../api/contact";

const Contact: Component = () => {
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [subject, setSubject] = createSignal("support");
  const [message, setMessage] = createSignal("");
  const [isSending, setIsSending] = createSignal(false);
  const [sent, setSent] = createSignal(false);
  const [error, setError] = createSignal("");

  // Get the email to use — user's email if logged in, or manual input
  const getEmail = () => (isAuthenticated() ? user()?.email || "" : email());
  const getName = () =>
    isAuthenticated()
      ? user()?.full_name || user()?.username || name()
      : name();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const emailVal = getEmail();
    const nameVal = getName();

    if (!nameVal.trim() || !emailVal.trim() || !message().trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        name: nameVal,
        email: emailVal,
        subject: subject(),
        message: message(),
      };

      if (isAuthenticated()) {
        await contactApi.sendAuthed(payload);
      } else {
        await contactApi.send(payload);
      }
      setSent(true);
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("support");
    setMessage("");
    setSent(false);
    setError("");
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 font-sans selection:bg-brand-teal/30 selection:text-brand-blue">
      <Header />

      {/* Hero Section */}
      <section class="relative pt-20 pb-8 sm:pt-28 sm:pb-12">
        {/* Ambient Background */}
        <div class="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div class="absolute top-1/3 left-1/4 w-[25vw] h-[25vw] min-w-[180px] bg-brand-teal/10 rounded-full blur-[100px] animate-pulse" />
          <div class="absolute bottom-1/3 right-1/4 w-[25vw] h-[25vw] min-w-[180px] bg-brand-yellow/10 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div class="w-full px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          {/* Back Link */}
          <A
            href="/about"
            class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-teal transition-colors mb-8"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </A>

          {/* Header */}
          <div class="text-center mb-10 animate-fade-in">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal mb-6 shadow-lg">
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
              Liên hệ với chúng tôi
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto">
              Gửi yêu cầu hỗ trợ, góp ý hoặc phản hồi — chúng tôi luôn lắng nghe
              bạn.
            </p>
          </div>

          {/* Form Card */}
          {sent() ? (
            <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/50 shadow-xl p-8 sm:p-10 text-center animate-fade-in">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-teal/10 mb-6">
                <svg
                  class="w-10 h-10 text-brand-teal"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Đã gửi thành công!
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm
                nhất.
              </p>
              <button
                onClick={resetForm}
                class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-full font-semibold hover:bg-brand-blue/90 transition-colors shadow-lg"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/50 shadow-xl p-6 sm:p-10 space-y-6 animate-fade-in"
            >
              {/* Error Message */}
              {error() && (
                <div class="flex items-center gap-3 px-4 py-3 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-sm font-medium">
                  <svg
                    class="w-5 h-5 shrink-0"
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
              )}

              {/* Subject Type — 3 options only (no Hợp tác) */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loại yêu cầu
                </label>
                <div class="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "support",
                      label: "Hỗ trợ",
                      icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                    },
                    {
                      value: "feedback",
                      label: "Góp ý",
                      icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
                    },
                    {
                      value: "bug",
                      label: "Báo lỗi",
                      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
                    },
                  ].map((item) => (
                    <button
                      type="button"
                      onClick={() => setSubject(item.value)}
                      class={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${
                        subject() === item.value
                          ? "border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 text-brand-blue dark:text-brand-teal"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d={item.icon}
                        />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email — auto-fill if logged in */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Họ tên
                  </label>
                  <Show
                    when={!isAuthenticated()}
                    fallback={
                      <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm">
                        {user()?.full_name || user()?.username}
                      </div>
                    }
                  >
                    <input
                      type="text"
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
                      placeholder="Nhập họ tên"
                      class="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                    />
                  </Show>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <Show
                    when={!isAuthenticated()}
                    fallback={
                      <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <svg
                          class="w-4 h-4 text-brand-teal shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {user()?.email}
                      </div>
                    }
                  >
                    <input
                      type="email"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      placeholder="Nhập email"
                      class="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                    />
                  </Show>
                </div>
              </div>

              {/* Logged-in badge */}
              <Show when={isAuthenticated()}>
                <div class="flex items-center gap-2 px-3 py-2 bg-brand-teal/5 dark:bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
                  <svg
                    class="w-4 h-4 text-brand-teal shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span class="text-xs text-brand-teal font-medium">
                    Đang đăng nhập — tin nhắn sẽ được gửi từ tài khoản của bạn
                  </span>
                </div>
              </Show>

              {/* Message */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung
                </label>
                <textarea
                  value={message()}
                  onInput={(e) => setMessage(e.currentTarget.value)}
                  placeholder="Mô tả chi tiết yêu cầu của bạn..."
                  rows={5}
                  class="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSending()}
                class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-brand-blue to-brand-teal text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending() ? (
                  <>
                    <svg
                      class="animate-spin w-5 h-5"
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
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Gửi tin nhắn
                  </>
                )}
              </button>

              {/* Info Note */}
              <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
                Tin nhắn sẽ được gửi trực tiếp đến đội ngũ hỗ trợ SatVach.
                <br />
                Hoặc email:{" "}
                <a
                  href="mailto:support@satvach.com"
                  class="text-brand-blue hover:underline"
                >
                  support@satvach.com
                </a>
              </p>
            </form>
          )}

          {/* Quick Contact Cards — 2 cards only (no GitHub) */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-32">
            <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-5 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/10 mb-3">
                <svg
                  class="w-6 h-6 text-brand-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1">
                Email
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                support@satvach.com
              </p>
            </div>

            <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-5 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-yellow/10 mb-3">
                <svg
                  class="w-6 h-6 text-brand-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1">
                Địa chỉ
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Sài Gòn, Việt Nam
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
