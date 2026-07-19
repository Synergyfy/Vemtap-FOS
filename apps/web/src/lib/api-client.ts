import api from "./api/axios";

export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    api.get(url, { params }).then((res) => res.data as T),

  post: <T>(url: string, data?: unknown) =>
    api.post(url, data).then((res) => res.data as T),

  put: <T>(url: string, data?: unknown) =>
    api.put(url, data).then((res) => res.data as T),

  patch: <T>(url: string, data?: unknown) =>
    api.patch(url, data).then((res) => res.data as T),

  delete: <T>(url: string) =>
    api.delete(url).then((res) => res.data as T),
};
