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
  lat: number;
  lng: number;
  radius: number; // in meters (or km depending on backend, usually meters for PostGIS ST_DWithin if srid=4326 cast to geography, or just degrees... wait, spec says 500m-50km. Backend using ST_DWithin probably wants meters if using geography type, or degrees if geometry. Let's assume meters or whatever the backend expects. Based on SKILL.md FE-4.2 `radius=${radius}` it doesn't specify unit, but typically meters or km. BE-3.6 `ST_DWithin`. Let's assume meters.)
  q?: string;
  category?: string;
}

export const locationsApi = {
  search: (params: SearchParams) => {
    return apiClient.get<Location[]>("/api/v1/locations/search", {
      params: params as any,
    });
  },

  getByViewport: (bbox: [number, number, number, number]) => {
    // bbox: [minLng, minLat, maxLng, maxLat]
    return apiClient.get<Location[]>("/api/v1/locations/viewport", {
      params: { bbox: bbox.join(",") },
    });
  },

  getById: (id: string) => {
    return apiClient.get<Location>(`/api/v1/locations/${id}`);
  },

  create: (data: LocationCreate) => {
    return apiClient.post<Location>("/api/v1/locations", data);
  },

  update: (id: string, data: LocationUpdate) => {
    return apiClient.patch<Location>(`/api/v1/locations/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/api/v1/locations/${id}`);
  },
};
