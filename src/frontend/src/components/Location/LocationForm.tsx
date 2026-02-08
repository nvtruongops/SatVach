import { Component, createSignal, For, Show } from "solid-js";
import {
  locationStore,
  closeForm,
  startPickingLocation,
} from "../../stores/locationStore";

const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍜" },
  { id: "cafe", label: "Cafe", icon: "☕" },
  { id: "service", label: "Service", icon: "🛠️" },
  { id: "entertainment", label: "Fun", icon: "🎮" },
  { id: "shopping", label: "Shop", icon: "🛍️" },
  { id: "parking", label: "Parking", icon: "🅿️" },
];

const LocationForm: Component = () => {
  const [images, setImages] = createSignal<File[]>([]);
  const [previews, setPreviews] = createSignal<string[]>([]);
  const [formData, setFormData] = createSignal({
    title: "",
    description: "",
    category: "food",
    address: "",
  });

  const handleImageUpload = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (files.length + images().length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setImages([...images(), ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews(), ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images()];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews()];
    URL.revokeObjectURL(newPreviews[index]); // Cleanup
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!locationStore.selectedLocation) {
      alert("Please pick a location on the map");
      return;
    }

    try {
      // 1. Upload images
      const uploadedImageIds: string[] = [];
      const imageFiles = images();

      // Import dynamically to avoid circular dependencies if any, or just standard import
      const { imagesApi } = await import("../../api/images");
      const { locationsApi } = await import("../../api/locations");

      // Parallel uploads
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file) => imagesApi.upload(file));
        const results = await Promise.all(uploadPromises);
        results.forEach((res) => uploadedImageIds.push(res.id));
      }

      // 2. Create Location
      const locationData = {
        title: formData().title,
        description: formData().description,
        category: formData().category,
        address: formData().address,
        latitude: locationStore.selectedLocation.lat,
        longitude: locationStore.selectedLocation.lng,
        image_ids: uploadedImageIds,
      };

      await locationsApi.create(locationData);

      alert("Location created successfully!");
      setFormData({
        title: "",
        description: "",
        category: "food",
        address: "",
      });
      setImages([]);
      setPreviews([]);
      closeForm();
    } catch (error: any) {
      console.error("Failed to create location:", error);
      alert(error.message || "Failed to create location");
    }
  };

  return (
    <Show when={locationStore.isFormOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Location
            </h3>
            <button
              onClick={closeForm}
              class="text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                ></path>
              </svg>
            </button>
          </div>

          <form class="p-4 space-y-4" onSubmit={handleSubmit}>
            {/* Map Picker */}
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Location
              </label>
              <div class="flex items-center gap-2">
                <div class="flex-grow p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {locationStore.selectedLocation
                    ? `${locationStore.selectedLocation.lat.toFixed(6)}, ${locationStore.selectedLocation.lng.toFixed(6)}`
                    : "No location selected"}
                </div>
                <button
                  type="button"
                  onClick={startPickingLocation}
                  class="text-white bg-secondary hover:bg-teal-600 font-medium rounded-lg text-sm px-4 py-2.5"
                >
                  📍 Pick on Map
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Name
              </label>
              <input
                type="text"
                id="location-title"
                name="title"
                required
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Category
              </label>
              <select
                id="location-category"
                name="category"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData().category}
                onChange={(e) =>
                  setFormData({
                    ...formData(),
                    category: (e.target as HTMLSelectElement).value,
                  })
                }
              >
                <For each={CATEGORIES}>
                  {(cat) => (
                    <option value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  )}
                </For>
              </select>
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Address
              </label>
              <input
                type="text"
                id="location-address"
                name="address"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData().address}
                onInput={(e) =>
                  setFormData({
                    ...formData(),
                    address: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                id="location-description"
                name="description"
                rows="3"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData().description}
                onInput={(e) =>
                  setFormData({
                    ...formData(),
                    description: (e.target as HTMLTextAreaElement).value,
                  })
                }
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Images (Max 5)
              </label>
              <input
                id="location-images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                onChange={handleImageUpload}
              />
              <div class="grid grid-cols-5 gap-2 mt-2">
                <For each={previews()}>
                  {(src, index) => (
                    <div class="relative aspect-square">
                      <img
                        src={src}
                        class="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => removeImage(index())}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div class="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                onClick={closeForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Create Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};

export default LocationForm;
