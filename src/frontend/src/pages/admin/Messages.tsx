import { Component, createResource, createSignal, For, Show } from "solid-js";
import {
  FiMail,
  FiCheck,
  FiArchive,
  FiChevronDown,
  FiChevronUp,
  FiInbox,
} from "solid-icons/fi";
import { apiClient } from "../../lib/apiClient";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  user_id: number | null;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactListResponse {
  items: ContactMessage[];
  total: number;
  skip: number;
  limit: number;
}

const LIMIT = 20;

const subjectLabels: Record<string, { label: string; color: string }> = {
  support: {
    label: "Hỗ trợ",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  feedback: {
    label: "Góp ý",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  bug: {
    label: "Báo lỗi",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const Messages: Component = () => {
  const [page, setPage] = createSignal(0);
  const [filter, setFilter] = createSignal<"all" | "unread" | "archived">(
    "all",
  );
  const [expandedId, setExpandedId] = createSignal<number | null>(null);

  const fetchMessages = async () => {
    const params: Record<string, string | number> = {
      skip: page() * LIMIT,
      limit: LIMIT,
    };
    if (filter() === "unread") params.is_read = "false";
    if (filter() === "archived") params.is_archived = "true";

    return apiClient.get<ContactListResponse>("/admin/contact-messages", {
      params,
    });
  };

  const [messages, { refetch }] = createResource(
    () => ({ page: page(), filter: filter() }),
    fetchMessages,
  );

  const markAsRead = async (id: number) => {
    await apiClient.patch(`/admin/contact-messages/${id}`, { is_read: true });
    refetch();
  };

  const archiveMessage = async (id: number) => {
    await apiClient.patch(`/admin/contact-messages/${id}`, {
      is_archived: true,
    });
    refetch();
  };

  const toggleExpand = (id: number) => {
    if (expandedId() === id) setExpandedId(null);
    else {
      setExpandedId(id);
      // auto-mark as read
      const msg = messages()?.items.find((m) => m.id === id);
      if (msg && !msg.is_read) markAsRead(id);
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h1 class="text-2xl font-bold text-brand-blue dark:text-brand-teal tracking-tight flex items-center gap-2">
          <FiMail class="w-6 h-6" />
          Contact Messages
        </h1>

        {/* Filter tabs */}
        <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["all", "unread", "archived"] as const).map((f) => (
            <button
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              class={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter() === f
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              {f === "all"
                ? "Tất cả"
                : f === "unread"
                  ? "Chưa đọc"
                  : "Đã lưu trữ"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Show
          when={!messages.loading}
          fallback={
            <div class="p-8 space-y-4">
              <For each={[1, 2, 3, 4]}>
                {() => (
                  <div class="animate-pulse flex items-center gap-4">
                    <div class="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div class="flex-1 space-y-2">
                      <div class="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div class="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <Show
            when={(messages()?.items?.length ?? 0) > 0}
            fallback={
              <div class="p-12 text-center">
                <FiInbox class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p class="text-gray-500 dark:text-gray-400 font-medium">
                  Không có tin nhắn nào.
                </p>
              </div>
            }
          >
            <For each={messages()?.items}>
              {(msg) => {
                const sub = subjectLabels[msg.subject] || subjectLabels.support;
                const isExpanded = () => expandedId() === msg.id;

                return (
                  <div
                    class={`border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                      !msg.is_read
                        ? "bg-brand-blue/[0.02] dark:bg-brand-blue/[0.05]"
                        : ""
                    }`}
                  >
                    {/* Row header */}
                    <button
                      onClick={() => toggleExpand(msg.id)}
                      class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {/* Unread dot */}
                      <div
                        class={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          msg.is_read ? "bg-transparent" : "bg-brand-blue"
                        }`}
                      />

                      {/* Info */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <span
                            class={`font-semibold text-sm truncate ${
                              msg.is_read
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {msg.name}
                          </span>
                          <span
                            class={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sub.color}`}
                          >
                            {sub.label}
                          </span>
                          {msg.user_id && (
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/10 text-brand-teal">
                              User #{msg.user_id}
                            </span>
                          )}
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {msg.email} — {msg.message.slice(0, 80)}
                          {msg.message.length > 80 ? "..." : ""}
                        </p>
                      </div>

                      {/* Date & expand */}
                      <span class="text-xs text-gray-400 shrink-0">
                        {new Date(msg.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      {isExpanded() ? (
                        <FiChevronUp class="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <FiChevronDown class="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {/* Expanded content */}
                    <Show when={isExpanded()}>
                      <div class="px-5 pb-5 pl-10 space-y-3 animate-fade-in">
                        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                          <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                        <div class="flex items-center gap-2">
                          <Show when={!msg.is_read}>
                            <button
                              onClick={() => markAsRead(msg.id)}
                              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors"
                            >
                              <FiCheck class="w-3.5 h-3.5" /> Đánh dấu đã đọc
                            </button>
                          </Show>
                          <Show when={!msg.is_archived}>
                            <button
                              onClick={() => archiveMessage(msg.id)}
                              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FiArchive class="w-3.5 h-3.5" /> Lưu trữ
                            </button>
                          </Show>
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: [SatVach] ${sub.label}`)}`}
                            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-teal bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-colors"
                          >
                            <FiMail class="w-3.5 h-3.5" /> Trả lời
                          </a>
                        </div>
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </Show>
        </Show>

        {/* Pagination */}
        <Show when={(messages()?.total ?? 0) > LIMIT}>
          <div class="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page() === 0}
              class="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span class="text-sm text-gray-500">
              Trang {page() + 1} / {Math.ceil((messages()?.total ?? 0) / LIMIT)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(messages()?.items?.length ?? 0) < LIMIT}
              class="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Messages;
