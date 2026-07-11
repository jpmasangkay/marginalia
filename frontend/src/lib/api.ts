import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Axios instance pre-configured for the Marginalia API.
 * - withCredentials: true  → sends httpOnly cookies on every request
 * - baseURL                → from VITE_API_URL env var
 */
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

/**
 * Response interceptor: on 401, attempt a silent token refresh once.
 * If the refresh also fails, clear state and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for these endpoints — callers handle 401 themselves
    const isAuthCheck = originalRequest.url?.includes('/auth/me');
    const isRefresh = originalRequest.url?.includes('/auth/refresh');
    const isLogin = originalRequest.url?.includes('/auth/login');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthCheck &&
      !isRefresh &&
      !isLogin
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve) => {
          refreshSubscribers.push(resolve);
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<{ user: AuthUser; message: string }>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<{ user: AuthUser; message: string }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ user: AuthUser }>('/auth/me'),
};

// ─── Notes API ────────────────────────────────────────────────────────────────
export interface ApiChecklistItem {
  _id: string;
  text: string;
  checked: boolean;
}

export interface ApiNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  checklist: ApiChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type NotePayload = {
  title: string;
  content?: string;
  category?: string;
  color: string;
  checklist?: { text: string; checked: boolean }[];
};

export const notesApi = {
  getAll: (search?: string) =>
    api.get<{ notes: ApiNote[] }>('/notes', { params: search ? { search } : {} }),

  create: (payload: NotePayload) =>
    api.post<{ note: ApiNote }>('/notes', payload),

  update: (id: string, payload: NotePayload) =>
    api.put<{ note: ApiNote }>(`/notes/${id}`, payload),

  delete: (id: string) => api.delete(`/notes/${id}`),

  toggleChecklistItem: (noteId: string, itemId: string) =>
    api.patch<{ note: ApiNote }>(`/notes/${noteId}/checklist/${itemId}`),
};

// ─── Categories API ───────────────────────────────────────────────────────────
export interface ApiCategory {
  _id: string;
  name: string;
  color: string;
}

export const categoriesApi = {
  getAll: () => api.get<{ categories: ApiCategory[] }>('/categories'),
  create: (name: string, color: string) =>
    api.post<{ category: ApiCategory }>('/categories', { name, color }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
