import {
  Component,
  createSignal,
  Show,
  createEffect,
  onCleanup,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import toast from "solid-toast";
import Header from "../components/Layout/Header";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

type Tab = "overview" | "edit" | "password";

const Profile: Component = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal<Tab>("overview");
  const [showLightbox, setShowLightbox] = createSignal(false);
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null);
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);

  // Cropper state
  const [showCropper, setShowCropper] = createSignal(false);
  const [tempImage, setTempImage] = createSignal<string | null>(null);
  let cropperRef: HTMLImageElement | undefined;
  let cropperInstance: Cropper | null = null;

  // Edit profile signals
  const [editFullName, setEditFullName] = createSignal("");
  const [editUsername, setEditUsername] = createSignal("");
  const [editEmail, setEditEmail] = createSignal("");
  const [editError, setEditError] = createSignal("");
  const [isUpdating, setIsUpdating] = createSignal(false);

  // Password change signals
  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmNewPassword, setConfirmNewPassword] = createSignal("");
  const [showCurrentPassword, setShowCurrentPassword] = createSignal(false);
  const [showNewPassword, setShowNewPassword] = createSignal(false);
  const [passwordError, setPasswordError] = createSignal("");
  const [isChangingPassword, setIsChangingPassword] = createSignal(false);

  // Initialize edit form with user data
  createEffect(() => {
    const u = user();
    if (u) {
      setEditFullName(u.full_name || "");
      setEditUsername(u.username);
      setEditEmail(u.email);
    }
  });

  // Redirect if not authenticated
  createEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  });

  // Initialize Cropper when modal opens
  createEffect(() => {
    if (showCropper() && tempImage() && cropperRef) {
      if (cropperInstance) {
        cropperInstance.destroy();
      }
      cropperInstance = new Cropper(cropperRef, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 1,
        restore: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: false, // Fixed crop box
        cropBoxResizable: false, // Fixed crop box size
        toggleDragModeOnDblclick: false,
        minCropBoxWidth: 200,
        minCropBoxHeight: 200,
      });
    } else {
      if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
      }
    }
  });

  onCleanup(() => {
    if (cropperInstance) {
      cropperInstance.destroy();
    }
  });

  const handleAvatarSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Read file for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target?.result as string);
        setShowCropper(true);
        // Reset input value so same file can be selected again
        target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = () => {
    if (cropperInstance) {
      cropperInstance
        .getCroppedCanvas({
          width: 400,
          height: 400,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        })
        .toBlob((blob: Blob | null) => {
          if (blob) {
            const file = new File([blob], "avatar.png", { type: "image/png" });
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(blob));
            setShowCropper(false);
            setTempImage(null);
          }
        }, "image/png");
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
  };

  const handleUpdateProfile = async (e: Event) => {
    e.preventDefault();
    setEditError("");
    setIsUpdating(true);

    try {
      // 1. Upload Avatar if selected
      if (avatarFile()) {
        await authApi.uploadAvatar(avatarFile()!);
      }

      // 2. Update Profile Data
      const u = user();
      if (u) {
        const updates: Record<string, string> = {};
        if (editFullName() !== (u.full_name || ""))
          updates.full_name = editFullName();
        if (editUsername() !== u.username) updates.username = editUsername();
        if (editEmail() !== u.email) updates.email = editEmail();

        if (Object.keys(updates).length > 0) {
          // ... (existing validation)
          if (
            updates.username &&
            (updates.username.length < 3 ||
              !/^[a-zA-Z0-9_-]+$/.test(updates.username))
          ) {
            throw new Error(
              "Username must be at least 3 characters and alphanumeric.",
            );
          }
          await authApi.updateProfile(updates);
        }
      }

      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (err: any) {
      const message =
        err.data?.detail || err.message || "Failed to update profile.";
      setEditError(message);
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword().length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword() !== confirmNewPassword()) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authApi.changePassword({
        current_password: currentPassword(),
        new_password: newPassword(),
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const message =
        err.data?.detail || err.message || "Failed to change password.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      id: "edit",
      label: "Edit Profile",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
    {
      id: "password",
      label: "Change Password",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
  ];

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-gray-900">
      <Header />

      {/* Cropper Modal */}
      <Show when={showCropper() && tempImage()}>
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
          <div class="bg-[#202124] text-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col h-[600px] overflow-hidden">
            {/* Header */}
            <div class="p-4 flex justify-between items-center border-b border-white/10">
              <h3 class="text-lg font-medium">Crop & Rotate</h3>
              <button
                onClick={handleCropCancel}
                class="text-gray-400 hover:text-white transition-colors"
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

            {/* Cropper Container */}
            <div class="flex-1 bg-[#171717] relative flex items-center justify-center overflow-hidden">
              <img
                ref={cropperRef!}
                src={tempImage()!}
                class="max-w-full max-h-full block opacity-0"
                alt="Crop target"
              />
            </div>

            {/* Controls */}
            <div class="p-4 border-t border-white/10 bg-[#202124]">
              <div class="flex justify-center gap-6 mb-6">
                <button
                  onClick={() => cropperInstance?.rotate(-90)}
                  class="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors group"
                  title="Rotate Left"
                >
                  <div class="p-2 rounded-full border border-gray-600 group-hover:bg-white/10 transition-colors">
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
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                  </div>
                  Rotate Left
                </button>
                <button
                  onClick={() => cropperInstance?.rotate(90)}
                  class="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors group"
                  title="Rotate Right"
                >
                  <div class="p-2 rounded-full border border-gray-600 group-hover:bg-white/10 transition-colors">
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
                        d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                      />
                    </svg>
                  </div>
                  Rotate Right
                </button>
                <button
                  onClick={() => cropperInstance?.reset()}
                  class="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors group"
                  title="Reset"
                >
                  <div class="p-2 rounded-full border border-gray-600 group-hover:bg-white/10 transition-colors">
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  Reset
                </button>
              </div>

              <div class="flex justify-end gap-3">
                <button
                  onClick={handleCropCancel}
                  class="px-5 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-lg hover:shadow-primary-600/20 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Lightbox Modal */}
      <Show when={showLightbox()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => setShowLightbox(false)}
        >
          <div class="relative max-w-4xl max-h-[90vh]">
            <Show
              when={user()?.avatar_url}
              fallback={
                <div class="w-64 h-64 rounded-full bg-primary-500 flex items-center justify-center text-white text-6xl font-bold">
                  {user()?.username?.charAt(0).toUpperCase()}
                </div>
              }
            >
              <img
                src={user()?.avatar_url!}
                alt={user()?.username}
                class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </Show>
            <button
              class="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setShowLightbox(false)}
            >
              <svg
                class="w-8 h-8"
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
        </div>
      </Show>

      {/* Background Ambience */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div class="absolute bottom-40 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div class="max-w-4xl mx-auto px-4 py-8 pb-28">
        {/* Profile Header */}
        <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-6 mb-6">
          <div class="flex items-center gap-4">
            {/* Avatar - Click to View */}
            <div
              class="relative group cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              <div class="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden border-2 border-white dark:border-gray-800 group-hover:border-primary-400 transition-colors">
                <Show
                  when={user()?.avatar_url}
                  fallback={user()?.username?.charAt(0).toUpperCase() || "U"}
                >
                  <img
                    src={user()?.avatar_url!}
                    alt={user()?.username}
                    class="w-full h-full object-cover"
                  />
                </Show>
              </div>
              <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {user()?.full_name || user()?.username || "User"}
              </h1>
              <Show when={user()?.full_name}>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  @{user()?.username}
                </p>
              </Show>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {user()?.email}
              </p>
              <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                {user()?.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              class="px-4 py-2 text-sm font-medium text-brand-red hover:bg-brand-red/10 rounded-lg border border-brand-red/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation ... (keep existing) */}
        <div class="flex gap-1 mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-1 border border-white/20 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              class={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab() === tab.id
                  ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
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
                  d={tab.icon}
                />
              </svg>
              <span class="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-6">
          {/* Overview Tab ... (keep existing) */}
          <Show when={activeTab() === "overview"}>
            {/* ... (keep overview content) ... */}
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Họ tên
                  </p>
                  <p class="text-base text-gray-900 dark:text-white">
                    {user()?.full_name || (
                      <span class="text-gray-400 italic">Chưa cập nhật</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("edit")}
                  class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Edit
                </button>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Username
                  </p>
                  <p class="text-base text-gray-900 dark:text-white">
                    {user()?.username}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("edit")}
                  class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Edit
                </button>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p class="text-base text-gray-900 dark:text-white">
                    {user()?.email}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("edit")}
                  class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Edit
                </button>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </p>
                  <p class="text-base text-gray-900 dark:text-white capitalize">
                    {user()?.role || "user"}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between py-3">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Password
                  </p>
                  <p class="text-base text-gray-900 dark:text-white">
                    ••••••••
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("password")}
                  class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          </Show>

          {/* Edit Profile Tab */}
          <Show when={activeTab() === "edit"}>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Edit Profile
            </h2>
            <Show when={editError()}>
              <div class="mb-4 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">
                {editError()}
              </div>
            </Show>
            <form onSubmit={handleUpdateProfile} class="space-y-6">
              {/* Full Name */}
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={editFullName()}
                  onInput={(e) => {
                    setEditFullName(e.currentTarget.value);
                    setEditError("");
                  }}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              {/* Avatar Upload Section */}
              <div class="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div class="w-20 h-20 rounded-full bg-primary-500 flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden border-2 border-white dark:border-gray-600">
                  <Show
                    when={avatarPreview()}
                    fallback={
                      <Show
                        when={user()?.avatar_url}
                        fallback={
                          user()?.username?.charAt(0).toUpperCase() || "U"
                        }
                      >
                        <img
                          src={user()?.avatar_url!}
                          alt={user()?.username}
                          class="w-full h-full object-cover"
                        />
                      </Show>
                    }
                  >
                    <img
                      src={avatarPreview()!}
                      alt="Preview"
                      class="w-full h-full object-cover"
                    />
                  </Show>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  <div class="flex items-center gap-3">
                    <label class="cursor-pointer px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                      Change Photo
                      <input
                        type="file"
                        class="hidden"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                      />
                    </label>
                    <Show when={avatarPreview()}>
                      <button
                        type="button"
                        class="text-sm text-brand-red hover:text-red-600"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                      >
                        Remove
                      </button>
                    </Show>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    JPG, GIF or PNG. 5MB max.
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername()}
                  onInput={(e) => {
                    setEditUsername(e.currentTarget.value);
                    setEditError("");
                  }}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Username"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail()}
                  onInput={(e) => {
                    setEditEmail(e.currentTarget.value);
                    setEditError("");
                  }}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Email"
                />
              </div>
              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating()}
                  class="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg transition-all"
                >
                  {isUpdating() ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = user();
                    if (u) {
                      setEditFullName(u.full_name || "");
                      setEditUsername(u.username);
                      setEditEmail(u.email);
                    }
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    setEditError("");
                  }}
                  class="py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-xl border border-gray-200 dark:border-gray-600 transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </Show>

          {/* Change Password Tab */}
          <Show when={activeTab() === "password"}>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Change Password
            </h2>
            <Show when={passwordError()}>
              <div class="mb-4 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">
                {passwordError()}
              </div>
            </Show>
            <form onSubmit={handleChangePassword} class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <div class="relative">
                  <input
                    type={showCurrentPassword() ? "text" : "password"}
                    value={currentPassword()}
                    onInput={(e) => {
                      setCurrentPassword(e.currentTarget.value);
                      setPasswordError("");
                    }}
                    class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword())
                    }
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <Show
                        when={showCurrentPassword()}
                        fallback={
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        }
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </Show>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div class="relative">
                  <input
                    type={showNewPassword() ? "text" : "password"}
                    value={newPassword()}
                    onInput={(e) => {
                      setNewPassword(e.currentTarget.value);
                      setPasswordError("");
                    }}
                    class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter new password (min 8 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword())}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <Show
                        when={showNewPassword()}
                        fallback={
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        }
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </Show>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword()}
                  onInput={(e) => {
                    setConfirmNewPassword(e.currentTarget.value);
                    setPasswordError("");
                  }}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Password strength indicator */}
              <Show when={newPassword().length > 0}>
                <div class="space-y-1">
                  <div class="flex gap-1">
                    <div
                      class={`h-1 flex-1 rounded-full transition-colors ${newPassword().length >= 8 ? "bg-brand-teal" : "bg-gray-200 dark:bg-gray-600"}`}
                    />
                    <div
                      class={`h-1 flex-1 rounded-full transition-colors ${newPassword().length >= 10 && /[A-Z]/.test(newPassword()) ? "bg-brand-teal" : "bg-gray-200 dark:bg-gray-600"}`}
                    />
                    <div
                      class={`h-1 flex-1 rounded-full transition-colors ${newPassword().length >= 12 && /[!@#$%^&*]/.test(newPassword()) ? "bg-brand-teal" : "bg-gray-200 dark:bg-gray-600"}`}
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {newPassword().length < 8
                      ? "Too short — minimum 8 characters"
                      : newPassword().length < 10
                        ? "Fair — add uppercase & symbols for better security"
                        : "Strong password"}
                  </p>
                </div>
              </Show>

              <button
                type="submit"
                disabled={isChangingPassword()}
                class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg transition-all"
              >
                {isChangingPassword() ? "Changing..." : "Change Password"}
              </button>
            </form>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Profile;
