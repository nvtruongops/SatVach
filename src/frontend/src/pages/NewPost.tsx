import { Component, createSignal, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { postsApi } from "../api/posts";
import Header from "../components/Layout/Header";
import toast from "solid-toast";

// TipTap imports
import { createEditor, EditorContent } from "../lib/tiptap";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExt from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

const NewPost: Component = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = createSignal("");
  const [coverImage, setCoverImage] = createSignal<File | null>(null);
  const [coverPreview, setCoverPreview] = createSignal<string | null>(null);
  const [_uploadedImages, setUploadedImages] = createSignal<string[]>([]);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [wordCount, setWordCount] = createSignal(0);
  const [charCount, setCharCount] = createSignal(0);

  // Redirect if not authenticated
  createEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  });

  // TipTap Editor
  const editor = createEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Viết nội dung bài viết của bạn ở đây...",
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-brand-blue underline" },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none min-h-[400px] focus:outline-none px-6 py-4",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    },
  });

  // Cover image handling
  const handleCoverSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh bìa tối đa 10MB");
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, cover: "" }));
  };

  const removeCover = () => {
    setCoverImage(null);
    if (coverPreview()) URL.revokeObjectURL(coverPreview()!);
    setCoverPreview(null);
  };

  // Insert image into editor
  const handleInsertImage = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh tối đa 10MB");
      return;
    }

    // Convert to base64 for inline preview (will be uploaded on submit)
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const e = editor();
      if (e) {
        e.chain().focus().setImage({ src }).run();
      }
      setUploadedImages((prev) => [...prev, src]);
    };
    reader.readAsDataURL(file);
    target.value = "";
  };

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title().trim()) errs.title = "Tiêu đề không được để trống";
    else if (title().length > 200) errs.title = "Tiêu đề tối đa 200 ký tự";

    const e = editor();
    const text = e?.getText() || "";
    if (!text.trim()) errs.content = "Nội dung không được để trống";
    else if (text.length < 10) errs.content = "Nội dung ít nhất 10 ký tự";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const e = editor();
      const content = e?.getHTML() || "";

      // Create post
      const post = await postsApi.create({
        title: title().trim(),
        content,
      });

      // Upload cover image if selected
      if (coverImage()) {
        const imgRes = await postsApi.uploadImage(post.id, coverImage()!);
        // Update post with cover image URL
        await postsApi.update(post.id, { cover_image_url: imgRes.image_url });
      }

      toast.success("Bài viết đã được đăng!");
      navigate("/explore");
    } catch (err: any) {
      const msg = err.data?.detail || err.message || "Không thể đăng bài viết";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toolbar button helper
  const ToolBtn = (props: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: any;
    class?: string;
  }) => (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      class={`p-2 rounded-lg transition-all text-sm ${
        props.active
          ? "bg-brand-blue/10 text-brand-blue dark:bg-brand-teal/20 dark:text-brand-teal"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
      } ${props.class || ""}`}
    >
      {props.children}
    </button>
  );

  // Add link prompt
  const addLink = () => {
    const e = editor();
    if (!e) return;
    const url = prompt("Nhập URL:");
    if (url) {
      e.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900 font-sans text-gray-900 dark:text-white pb-24">
      <Header />

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Tạo bài viết mới
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Chia sẻ câu chuyện, góc nhìn và khám phá của bạn
            </p>
          </div>
          <button
            onClick={() => navigate("/explore")}
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Đóng"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cover Image */}
        <div class="mb-6">
          <Show
            when={coverPreview()}
            fallback={
              <label class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-brand-blue dark:hover:border-brand-teal hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                <div class="flex flex-col items-center gap-2 text-gray-400 group-hover:text-brand-blue dark:group-hover:text-brand-teal transition-colors">
                  <svg
                    class="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="text-sm font-medium">
                    Thêm ảnh bìa (không bắt buộc)
                  </span>
                </div>
                <input
                  type="file"
                  class="hidden"
                  accept="image/*"
                  onChange={handleCoverSelect}
                />
              </label>
            }
          >
            <div class="relative rounded-2xl overflow-hidden group">
              <img
                src={coverPreview()!}
                alt="Cover"
                class="w-full h-64 object-cover"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                onClick={removeCover}
                class="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </Show>
        </div>

        {/* Title Input */}
        <div class="mb-4">
          <input
            type="text"
            value={title()}
            onInput={(e) => {
              setTitle(e.currentTarget.value);
              setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="Tiêu đề bài viết"
            class={`w-full text-3xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white tracking-tight ${
              errors().title
                ? "ring-2 ring-brand-red/50 rounded-xl px-4 py-2"
                : ""
            }`}
            maxlength={200}
          />
          <div class="flex justify-between mt-1 px-1">
            <Show when={errors().title}>
              <span class="text-xs text-brand-red font-medium">
                {errors().title}
              </span>
            </Show>
            <span class="text-xs text-gray-400 ml-auto">
              {title().length}/200
            </span>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div
          class={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden mb-6 ${
            errors().content
              ? "border-brand-red/50"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          {/* Toolbar */}
          <div class="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            {/* Text Format Group */}
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleBold().run()}
              active={editor()?.isActive("bold")}
              title="Đậm (Ctrl+B)"
            >
              <span class="font-bold text-base">B</span>
            </ToolBtn>
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleItalic().run()}
              active={editor()?.isActive("italic")}
              title="Nghiêng (Ctrl+I)"
            >
              <span class="italic text-base">I</span>
            </ToolBtn>
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleUnderline().run()}
              active={editor()?.isActive("underline")}
              title="Gạch chân (Ctrl+U)"
            >
              <span class="underline text-base">U</span>
            </ToolBtn>
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleStrike().run()}
              active={editor()?.isActive("strike")}
              title="Gạch ngang"
            >
              <span class="line-through text-base">S</span>
            </ToolBtn>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Headings */}
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor()?.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <span class="font-bold text-xs">H1</span>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor()?.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <span class="font-bold text-xs">H2</span>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor()?.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <span class="font-bold text-xs">H3</span>
            </ToolBtn>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Lists */}
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleBulletList().run()}
              active={editor()?.isActive("bulletList")}
              title="Danh sách"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().toggleOrderedList().run()
              }
              active={editor()?.isActive("orderedList")}
              title="Danh sách đánh số"
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
                  d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01"
                />
              </svg>
            </ToolBtn>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Alignment */}
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().setTextAlign("left").run()
              }
              active={editor()?.isActive({ textAlign: "left" })}
              title="Căn trái"
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
                  d="M3 6h18M3 12h12M3 18h18"
                />
              </svg>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().setTextAlign("center").run()
              }
              active={editor()?.isActive({ textAlign: "center" })}
              title="Căn giữa"
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
                  d="M3 6h18M6 12h12M3 18h18"
                />
              </svg>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().setTextAlign("right").run()
              }
              active={editor()?.isActive({ textAlign: "right" })}
              title="Căn phải"
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
                  d="M3 6h18M9 12h12M3 18h18"
                />
              </svg>
            </ToolBtn>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Block elements */}
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleBlockquote().run()}
              active={editor()?.isActive("blockquote")}
              title="Trích dẫn"
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </ToolBtn>
            <ToolBtn
              onClick={() => editor()?.chain().focus().toggleCode().run()}
              active={editor()?.isActive("code")}
              title="Inline code"
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </ToolBtn>
            <ToolBtn
              onClick={() =>
                editor()?.chain().focus().setHorizontalRule().run()
              }
              title="Đường kẻ ngang"
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
                  d="M3 12h18"
                />
              </svg>
            </ToolBtn>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Link */}
            <ToolBtn
              onClick={addLink}
              active={editor()?.isActive("link")}
              title="Chèn liên kết"
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </ToolBtn>

            {/* Insert Image */}
            <label class="cursor-pointer">
              <ToolBtn onClick={() => {}} title="Chèn ảnh vào nội dung">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </ToolBtn>
              <input
                type="file"
                class="hidden"
                accept="image/*"
                onChange={handleInsertImage}
              />
            </label>

            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* Highlight */}
            <ToolBtn
              onClick={() =>
                editor()
                  ?.chain()
                  .focus()
                  .toggleHighlight({ color: "#FFCB77" })
                  .run()
              }
              active={editor()?.isActive("highlight")}
              title="Highlight"
            >
              <div class="w-4 h-4 rounded bg-brand-yellow/60 border border-brand-yellow" />
            </ToolBtn>

            {/* Undo/Redo */}
            <div class="ml-auto flex items-center gap-0.5">
              <ToolBtn
                onClick={() => editor()?.chain().focus().undo().run()}
                title="Hoàn tác (Ctrl+Z)"
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
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </ToolBtn>
              <ToolBtn
                onClick={() => editor()?.chain().focus().redo().run()}
                title="Làm lại (Ctrl+Y)"
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
                    d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                  />
                </svg>
              </ToolBtn>
            </div>
          </div>

          {/* Editor Content Area */}
          <EditorContent editor={editor() || null} class="min-h-[400px]" />

          {/* Footer Stats */}
          <div class="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-xs text-gray-400">
            <div class="flex gap-4">
              <span>{wordCount()} từ</span>
              <span>{charCount()} ký tự</span>
            </div>
            <Show when={errors().content}>
              <span class="text-brand-red font-medium">{errors().content}</span>
            </Show>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex items-center gap-4 justify-end">
          <button
            onClick={() => navigate("/explore")}
            class="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting()}
            class="px-8 py-3 bg-gradient-to-r from-brand-blue to-brand-teal text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isSubmitting() ? (
              <span class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
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
                Đang đăng...
              </span>
            ) : (
              "Đăng bài viết"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
