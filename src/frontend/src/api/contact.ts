import { apiClient } from "../lib/apiClient";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  user_id: number | null;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageListResponse {
  items: ContactMessage[];
  total: number;
  skip: number;
  limit: number;
}

export const contactApi = {
  /** Submit contact message (public) */
  send: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    return apiClient.post<ContactMessage>("/contact", data);
  },

  /** Submit as authed user */
  sendAuthed: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    return apiClient.post<ContactMessage>("/contact/auth", data);
  },
};
