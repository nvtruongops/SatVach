import { Component, createSignal, createResource, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Header from "../components/Layout/Header";
import { useAuth } from "../context/AuthContext";
import { postsApi, type Post } from "../api/posts";
import toast from "solid-toast";
// @ts-ignore
import heroImage from "../assets/explore-hero.jpg";

const Explore: Component = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch posts
  const [postsData, { refetch }] = createResource(() => postsApi.list(0, 50));
  const posts = () => postsData()?.items || [];

  // Comment state per post
  const [openComments, setOpenComments] = createSignal<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = createSignal<
    Record<number, string>
  >({});
  const [submittingComment, setSubmittingComment] = createSignal<number | null>(
    null,
  );

  const toggleComments = (postId: number) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleLike = async (postId: number) => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      return;
    }
    try {
      await postsApi.toggleLike(postId);
      refetch();
    } catch {
      toast.error("Không thể thả tim");
    }
  };

  const handleComment = async (postId: number) => {
    const content = commentInputs()[postId]?.trim();
    if (!content) return;
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    setSubmittingComment(postId);
    try {
      await postsApi.addComment(postId, content);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      refetch();
    } catch {
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await postsApi.deleteComment(postId, commentId);
      refetch();
    } catch {
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/explore#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.title, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết!");
    }
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 font-sans text-gray-900 dark:text-white pb-20">
      <Header />

      {/* Prominent Hero Header */}
      <div class="h-screen w-full relative overflow-hidden group">
        <div
          class="absolute inset-0 transition-transform duration-[20s] ease-linear scale-125 group-hover:scale-110 origin-top"
          style={{
            "background-image": `url(${heroImage})`,
            "background-size": "cover",
            "background-position": "center top",
          }}
        ></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-brand-cream dark:to-gray-900"></div>

        {/* Hero Content Overlay */}
        <div class="absolute inset-0 flex items-center justify-center p-6 z-20 pointer-events-none">
          <div class="text-center pointer-events-auto max-w-4xl">
            <h1
              class="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-white drop-shadow-2xl"
              style={{
                "text-shadow": "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              Explore Sài Gòn
            </h1>
            <p class="text-xl md:text-2xl font-medium text-white/90 drop-shadow-lg max-w-2xl mx-auto">
              Connect with your community and discover the hidden gems of the
              city.
            </p>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          {/* Guest CTA */}
          <Show when={!isAuthenticated()}>
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700 text-center">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Join the Conversation
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Sign in to share your discoveries and connect with other
                explorers.
              </p>
              <div class="flex gap-4 justify-center">
                <A
                  href="/login"
                  class="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  Log In
                </A>
                <A
                  href="/signup"
                  class="px-6 py-3 rounded-xl bg-white text-brand-blue border-2 border-brand-blue font-bold hover:bg-gray-50 transition-all"
                >
                  Sign Up
                </A>
              </div>
            </div>
          </Show>

          {/* Posts Stream */}
          <div class="space-y-6 min-h-[300px]">
            <Show
              when={!postsData.loading}
              fallback={
                <div class="flex flex-col items-center py-16">
                  <div class="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
                  <p class="mt-4 text-gray-500">Đang tải bài viết...</p>
                </div>
              }
            >
              <Show
                when={posts().length > 0}
                fallback={
                  <div class="flex flex-col items-center justify-center py-16 text-center opacity-80">
                    <div class="w-48 h-48 mb-6 flex items-center justify-center">
                      <svg
                        class="w-full h-full text-gray-300 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1"
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Chưa có bài viết nào
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      Hãy là người đầu tiên chia sẻ câu chuyện!
                    </p>
                    <Show when={isAuthenticated()}>
                      <button
                        onClick={() => navigate("/new-post")}
                        class="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-teal text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Viết bài đầu tiên
                      </button>
                    </Show>
                  </div>
                }
              >
                <For each={posts()}>
                  {(post) => (
                    <article
                      id={`post-${post.id}`}
                      class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg border border-white/10 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Cover Image */}
                      <Show when={post.cover_image_url}>
                        <div class="w-full h-64 overflow-hidden">
                          <img
                            src={post.cover_image_url!}
                            alt={post.title}
                            class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                          />
                        </div>
                      </Show>

                      <div class="p-6">
                        {/* Author */}
                        <div class="flex items-center gap-3 mb-4">
                          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex-shrink-0 overflow-hidden ring-2 ring-brand-blue/10">
                            <Show
                              when={post.author.avatar_url}
                              fallback={
                                <div class="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                  {(
                                    post.author.full_name ||
                                    post.author.username
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              }
                            >
                              <img
                                src={post.author.avatar_url!}
                                alt={post.author.username}
                                class="w-full h-full object-cover"
                              />
                            </Show>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {post.author.full_name || post.author.username}
                            </h4>
                            <div class="flex items-center text-xs text-gray-400 gap-1">
                              <Show when={post.author.full_name}>
                                <span>@{post.author.username}</span>
                                <span class="opacity-50">·</span>
                              </Show>
                              <span>{timeAgo(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                          {post.title}
                        </h2>

                        {/* Content (HTML) */}
                        <div
                          class="prose prose-sm dark:prose-invert max-w-none mb-4 line-clamp-6 overflow-hidden"
                          innerHTML={post.content}
                        />

                        {/* Inline Images */}
                        <Show when={post.images.length > 0}>
                          <div
                            class={`grid gap-2 mb-4 ${post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}
                          >
                            <For each={post.images.slice(0, 4)}>
                              {(img) => (
                                <div class="rounded-xl overflow-hidden ring-1 ring-black/5">
                                  <img
                                    src={img.image_url}
                                    alt={img.caption || ""}
                                    class="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                            </For>
                          </div>
                        </Show>

                        {/* Actions */}
                        <div class="flex items-center gap-1 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                          <button
                            onClick={() => handleLike(post.id)}
                            class={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${post.is_liked ? "text-brand-red bg-brand-red/5" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-red"}`}
                          >
                            <svg
                              class="w-5 h-5"
                              fill={post.is_liked ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>{post.likes_count || ""}</span>
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            class={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${openComments().has(post.id) ? "text-brand-blue bg-brand-blue/5" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-blue"}`}
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
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{post.comments_count || ""}</span>
                          </button>
                          <button
                            onClick={() => handleShare(post)}
                            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-teal transition-all active:scale-95"
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
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                            <span class="hidden sm:inline">Chia sẻ</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        <Show when={openComments().has(post.id)}>
                          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                            <For each={post.comments}>
                              {(comment) => (
                                <div class="flex gap-3 group">
                                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue/80 to-brand-teal/80 flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                                    <Show
                                      when={comment.user.avatar_url}
                                      fallback={(
                                        comment.user.full_name ||
                                        comment.user.username
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    >
                                      <img
                                        src={comment.user.avatar_url!}
                                        class="w-full h-full object-cover"
                                      />
                                    </Show>
                                  </div>
                                  <div class="flex-1 min-w-0">
                                    <div class="bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-2.5">
                                      <span class="font-semibold text-sm text-gray-900 dark:text-white">
                                        {comment.user.full_name ||
                                          comment.user.username}
                                      </span>
                                      <p class="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <div class="flex items-center gap-3 mt-1 px-2">
                                      <span class="text-xs text-gray-400">
                                        {timeAgo(comment.created_at)}
                                      </span>
                                      <Show
                                        when={
                                          comment.user.id ===
                                            Number(user()?.id) ||
                                          user()?.role === "admin"
                                        }
                                      >
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(
                                              post.id,
                                              comment.id,
                                            )
                                          }
                                          class="text-xs text-gray-400 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          Xóa
                                        </button>
                                      </Show>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </For>

                            {/* Comment input */}
                            <Show
                              when={isAuthenticated()}
                              fallback={
                                <p class="text-sm text-gray-400 text-center py-2">
                                  <A
                                    href="/login"
                                    class="text-brand-blue hover:underline"
                                  >
                                    Đăng nhập
                                  </A>{" "}
                                  để bình luận
                                </p>
                              }
                            >
                              <div class="flex gap-3 items-end">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                                  <Show
                                    when={user()?.avatar_url}
                                    fallback={
                                      (user()?.full_name || user()?.username)
                                        ?.charAt(0)
                                        .toUpperCase() || "U"
                                    }
                                  >
                                    <img
                                      src={user()?.avatar_url}
                                      class="w-full h-full object-cover"
                                    />
                                  </Show>
                                </div>
                                <div class="flex-1 flex items-end gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-2">
                                  <textarea
                                    value={commentInputs()[post.id] || ""}
                                    onInput={(e) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [post.id]: e.currentTarget.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleComment(post.id);
                                      }
                                    }}
                                    placeholder="Viết bình luận..."
                                    rows="1"
                                    class="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 min-h-[24px] max-h-[100px]"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={
                                      !commentInputs()[post.id]?.trim() ||
                                      submittingComment() === post.id
                                    }
                                    class="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                                  >
                                    <svg
                                      class="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </Show>
                          </div>
                        </Show>
                      </div>
                    </article>
                  )}
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
