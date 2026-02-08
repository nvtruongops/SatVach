import { apiClient } from "../lib/apiClient";

export interface PostAuthor {
  id: number;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface PostImage {
  id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface PostComment {
  id: number;
  content: string;
  user: PostAuthor;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  is_published: boolean;
  author: PostAuthor;
  images: PostImage[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments: PostComment[];
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  cover_image_url?: string;
}

export const postsApi = {
  list: (skip = 0, limit = 20) =>
    apiClient.get<PostListResponse>(`/posts?skip=${skip}&limit=${limit}`),

  get: (id: number) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: CreatePostData) => apiClient.post<Post>("/posts", data),

  update: (
    id: number,
    data: Partial<CreatePostData & { is_published: boolean }>,
  ) => apiClient.patch<Post>(`/posts/${id}`, data),

  delete: (id: number) => apiClient.delete(`/posts/${id}`),

  uploadImage: (postId: number, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    return apiClient.post<PostImage>(`/posts/${postId}/images`, formData);
  },

  toggleLike: (postId: number) =>
    apiClient.post<{ liked: boolean }>(`/posts/${postId}/like`),

  addComment: (postId: number, content: string) =>
    apiClient.post<PostComment>(`/posts/${postId}/comments`, { content }),

  deleteComment: (postId: number, commentId: number) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};
