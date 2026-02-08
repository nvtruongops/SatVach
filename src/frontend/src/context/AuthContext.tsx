import {
  createContext,
  createSignal,
  useContext,
  JSX,
  Show,
  createEffect,
} from "solid-js";

import { apiClient } from "../lib/apiClient";

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: "user" | "admin" | "moderator";
  avatar_url?: string;
}

interface AuthContextType {
  user: () => User | null;
  isAuthenticated: () => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: () => boolean;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider = (props: { children: JSX.Element }) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isInitializing, setIsInitializing] = createSignal(true);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Login to get token
      const formData = new FormData();
      formData.append("username", usernameOrEmail);
      formData.append("password", password);

      const response = await apiClient.post<{ access_token: string }>(
        "/auth/login/access-token",
        formData,
      );

      const { access_token } = response;
      localStorage.setItem("access_token", access_token);

      // 2. Fetch user details
      await fetchCurrentUser();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<any>("/auth/me");
      const userData = response;
      // Map backend user to frontend user interface
      // Assuming backend returns: { id, email, username, is_superuser, ... }
      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || undefined,
        role: userData.is_superuser ? "admin" : "user",
        avatar_url: userData.avatar_url,
      };
      setUser(user);
      localStorage.setItem("auth_user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Verify token by fetching user
      await fetchCurrentUser();
    }
    setIsInitializing(false);
  };

  createEffect(() => {
    checkAuth();
  });

  const isAuthenticated = () => !!user();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      <Show when={!isInitializing()} fallback={null}>
        {props.children}
      </Show>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
