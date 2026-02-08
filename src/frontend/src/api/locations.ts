import { apiClient } from "../lib/apiClient";

export interface Location {
  id: string;
  title: string;
  description?: string;
  category: string;
  geom: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  status: "pending" | "approved" | "rejected";
  image_urls?: string[];
  created_at: string;
  updated_at: string;
  distance?: number;
}

export interface LocationCreate {
  title: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_ids?: string[]; // Assuming backend accepts IDs of uploaded images
}

export interface LocationUpdate {
  title?: string;
  description?: string;
  category?: string;
  status?: "pending" | "approved" | "rejected";
  image_ids?: string[];
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  query?: string;
  category?: string;
}

export const locationsApi = {
  search: (params: SearchParams) => {
    return apiClient.get<Location[]>("/locations/search", {
      params: params as any,
    });
  },

  getByViewport: (bbox: [number, number, number, number]) => {
    // bbox: [minLng, minLat, maxLng, maxLat]
    return apiClient.get<Location[]>("/locations/viewport", {
      params: {
        min_lng: bbox[0],
        min_lat: bbox[1],
        max_lng: bbox[2],
        max_lat: bbox[3],
      },
    });
  },

  getById: (id: string) => {
    return apiClient.get<Location>(`/locations/${id}`);
  },

  create: (data: LocationCreate) => {
    return apiClient.post<Location>("/locations", data);
  },

  update: (id: string, data: LocationUpdate) => {
    return apiClient.patch<Location>(`/locations/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/locations/${id}`);
  },
};
