import { create } from "zustand";
import { getMe, loginUser } from "../api/authApi";

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

const persistAuth = ({ token, user }) => {
  if (typeof window === "undefined") return;

  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);

  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_USER_KEY);
};

const clearPersistedAuth = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken),
  isAuthLoading: false,
  isBootstrapping: Boolean(initialToken),
  authError: null,

  clearAuthError: () => set({ authError: null }),

  finishBootstrapWithoutAuth: () => {
    clearPersistedAuth();

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      isBootstrapping: false,
      authError: null,
    });
  },

  login: async (credentials) => {
    set({
      isAuthLoading: true,
      authError: null,
    });

    try {
      const response = await loginUser(credentials);

      persistAuth({
        token: response.accessToken,
        user: response.user,
      });

      set({
        token: response.accessToken,
        user: response.user,
        isAuthenticated: true,
        isAuthLoading: false,
        isBootstrapping: false,
        authError: null,
      });

      return response;
    } catch (error) {
      clearPersistedAuth();

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
        isBootstrapping: false,
        authError:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed",
      });

      throw error;
    }
  },

  fetchMe: async () => {
    const token = get().token;

    if (!token) {
      get().finishBootstrapWithoutAuth();
      return null;
    }

    set({
      isAuthLoading: true,
      isBootstrapping: true,
      authError: null,
    });

    try {
      const response = await getMe();

      persistAuth({
        token,
        user: response.user,
      });

      set({
        user: response.user,
        isAuthenticated: true,
        isAuthLoading: false,
        isBootstrapping: false,
        authError: null,
      });

      return response;
    } catch (error) {
      clearPersistedAuth();

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
        isBootstrapping: false,
        authError:
          error?.response?.data?.message ||
          error?.message ||
          "Authentication failed",
      });

      throw error;
    }
  },

  logout: () => {
    clearPersistedAuth();

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      isBootstrapping: false,
      authError: null,
    });
  },
}));