import { Component, createSignal, For } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { locationStore, startPickingLocation } from "../stores/locationStore";
import { imagesApi } from "../api/images";
import { locationsApi } from "../api/locations";
import Header from "../components/Layout/Header";

const CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "cafe", label: "Cafe" },
  { id: "service", label: "Service" },
  { id: "entertainment", label: "Fun" },
  { id: "shopping", label: "Shop" },
  { id: "parking", label: "Parking" },
];

const Contribute: Component = () => {
  const navigate = useNavigate();
  const [images, setImages] = createSignal<File[]>([]);
  const [previews, setPreviews] = createSignal<string[]>([]);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [formData, setFormData] = createSignal({
    title: "",
    description: "",
    category: "food",
    address: "",
  });

  const handleImageUpload = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    addFiles(files);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (files: File[]) => {
    if (files.length + images().length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    setImages([...images(), ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews(), ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images()];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews()];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!locationStore.selectedLocation) {
      alert("Please pick a location on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageIds: string[] = [];
      for (const file of images()) {
        const response = await imagesApi.upload(file);
        imageIds.push(response.id);
      }

      // Create location
      await locationsApi.create({
        title: formData().title,
        description: formData().description || undefined,
        category: formData().category,
        latitude: locationStore.selectedLocation.lat,
        longitude: locationStore.selectedLocation.lng,
        address: formData().address || undefined,
        image_ids: imageIds.length > 0 ? imageIds : undefined,
      });

      alert(
        "Location submitted successfully! It will be reviewed by moderators.",
      );
      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit location. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Header />
      <div class="absolute top-0 left-1/2 w-full -translate-x-1/2 h-96 bg-gradient-to-b from-primary-100 to-transparent dark:from-primary-900/20 -z-10 blur-3xl opacity-50"></div>

      <div class="max-w-3xl mx-auto">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-gray-700">
          {/* Header Section */}
          <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Location
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Share a hidden gem with the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} class="p-8 space-y-8">
            {/* 1. Basic Info Group */}
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  class="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Broken Rice Sài Gòn"
                  value={formData().title}
                  onInput={(e) =>
                    setFormData({
                      ...formData(),
                      title: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div class="flex flex-wrap gap-3">
                  <For each={CATEGORIES}>
                    {(cat) => (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData(), category: cat.id })
                        }
                        class={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                          formData().category === cat.id
                            ? "bg-primary-600 text-white border-primary-600 shadow-md transform scale-105"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  class="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="What makes this place special?"
                  value={formData().description}
                  onInput={(e) =>
                    setFormData({
                      ...formData(),
                      description: (e.target as HTMLTextAreaElement).value,
                    })
                  }
                ></textarea>
              </div>
            </div>

            {/* 2. Location & Address */}
            <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Location Details
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    class="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="Street address"
                    value={formData().address}
                    onInput={(e) =>
                      setFormData({
                        ...formData(),
                        address: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coordinates
                  </label>
                  <div class="flex gap-2">
                    <div class="flex-grow px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 font-mono text-sm flex items-center">
                      {locationStore.selectedLocation
                        ? `${locationStore.selectedLocation.lat.toFixed(6)}, ${locationStore.selectedLocation.lng.toFixed(6)}`
                        : "No location selected"}
                    </div>
                    <button
                      type="button"
                      class="px-6 py-3 bg-secondary text-white font-medium rounded-xl hover:bg-secondary-dark transition-colors shadow-sm active:translate-y-0.5"
                      onClick={() => {
                        startPickingLocation();
                        navigate("/");
                      }}
                    >
                      Pick on Map
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Image Upload (Drag & Drop) */}
            <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photos (Max 5)
              </label>

              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  class="hidden"
                  onChange={handleImageUpload}
                  title="Upload images"
                />
                <div class="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop or click to upload
                </p>
              </div>

              <div class="grid grid-cols-4 sm:grid-cols-5 gap-4">
                <For each={previews()}>
                  {(src, index) => (
                    <div class="relative aspect-square group">
                      <img
                        src={src}
                        alt={`Preview ${index()}`}
                        class="w-full h-full object-cover rounded-xl shadow-sm"
                      />
                      <button
                        type="button"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        onClick={() => removeImage(index())}
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Actions */}
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <A
                href="/"
                class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-2"
              >
                Cancel
              </A>
              <button
                type="submit"
                disabled={isSubmitting()}
                class="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:active:scale-100"
              >
                {isSubmitting() ? "Submitting..." : "Create Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contribute;
