import { apiClient } from "../lib/apiClient";
import { User } from "../types/user";

export interface SignupData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  new_password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  full_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const authApi = {
  signup: (data: SignupData) => {
    const { name, ...rest } = data;
    return apiClient.post<User>("/auth/signup", { ...rest, full_name: name });
  },

  verifyEmail: (data: VerifyEmailData) => {
    return apiClient.post<{ message: string }>("/auth/verify", data);
  },

  forgotPassword: (email: string) => {
    return apiClient.post<{ message: string }>(
      `/auth/password-recovery/${email}`,
    );
  },

  resetPassword: (data: ResetPasswordData) => {
    return apiClient.post<{ message: string }>("/auth/reset-password", data);
  },

  getMe: () => {
    return apiClient.get<User>("/auth/me");
  },

  updateProfile: (data: UpdateProfileData) => {
    return apiClient.patch<User>("/auth/me", data);
  },

  changePassword: (data: ChangePasswordData) => {
    return apiClient.post<{ message: string }>(
      "/auth/me/change-password",
      data,
    );
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<User>("/auth/me/avatar", formData);
  },
};
