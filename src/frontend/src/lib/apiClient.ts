/**
 * API Client Wrapper
 * Handles base URL, headers, and error handling for all API requests.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  // 1. Build URL with query params
  // Handle both absolute URLs (http://...) and relative paths (/api/v1)
  const baseUrl = API_BASE_URL.startsWith("http")
    ? API_BASE_URL
    : window.location.origin + API_BASE_URL;
  const url = new URL(`${baseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // 2. Set default headers & Auth
  const token = localStorage.getItem("access_token");
  const authHeaders: Record<string, string> = {};

  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  };

  // Allow uploading files (multipart/form-data)
  if (config.body instanceof FormData && config.headers) {
    // Let browser set Content-Type for FormData (includes boundary)
    delete (config.headers as Record<string, string>)["Content-Type"];
  }

  try {
    const response = await fetch(url.toString(), config);

    // 3. Response Interceptor / Error Handling
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorData;

      try {
        errorData = await response.json();
        if (errorData.detail) {
          errorMessage =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Response was not JSON
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    // 4. Parse JSON
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Handle network errors or cancellations
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error (e.g., ERR_CONNECTION_REFUSED)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra:\n" +
          "1. Docker Desktop đang chạy\n" +
          "2. Backend đang chạy (docker-compose up -d)\n" +
          "3. Port 8000 không bị chặn",
      );
    }

    throw new Error(
      error instanceof Error ? error.message : "Unknown network error",
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  // Helper for file uploads
  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: formData }),
};
