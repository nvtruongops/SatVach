import { apiClient } from "../lib/apiClient";

export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
}

export const imagesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<ImageUploadResponse>("/images/upload", formData);
  },

  getPresignedUrl: (filename: string, fileType: string) => {
    return apiClient.get<{ url: string; fields: Record<string, string> }>(
      "/images/presigned",
      {
        params: { filename, file_type: fileType },
      },
    );
  },
};
