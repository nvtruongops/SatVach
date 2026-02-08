import { apiClient } from "../lib/apiClient";
import { Location } from "./locations";

export interface AdminLocationListResponse {
  items: Location[];
  total: number;
  skip: number;
  limit: number;
}

export const adminApi = {
  getLocations: (
    status?: "pending" | "approved" | "rejected",
    skip: number = 0,
    limit: number = 50,
  ) => {
    const params: any = { skip, limit };
    if (status) {
      params.status = status;
    }
    return apiClient.get<AdminLocationListResponse>("/admin/locations", {
      params,
    });
  },

  updateLocationStatus: (
    id: string,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    return apiClient.patch<Location>(`/admin/locations/${id}/status`, {
      status,
      reason,
    });
  },

  getDashboardStats: () => {
    return apiClient.get<{
      stats: {
        total_locations: number;
        pending_locations: number;
        approved_locations: number;
        rejected_locations: number;
        total_users: number;
      };
      recent_activity: Location[];
    }>("/admin/dashboard/stats");
  },

  getUsers: (skip: number = 0, limit: number = 50) => {
    return apiClient.get<{
      items: any[]; // User type
      total: number;
      skip: number;
      limit: number;
    }>("/admin/users", {
      params: { skip, limit },
    });
  },

  updateUserStatus: (id: number, is_active: boolean) => {
    return apiClient.patch<any>(`/admin/users/${id}/status`, {
      is_active,
    });
  },
};
