import api from "./axios";
import type { Notification } from "@/lib/types";

export const notificationsApi = {
  getAll: async () => {
    return api.get("/notifications") as Promise<Notification[]>;
  },

  markAsRead: async (id: string) => {
    return api.patch(`/notifications/${id}/read`) as Promise<Notification>;
  },

  markAllAsRead: async () => {
    return api.patch("/notifications/read-all") as Promise<{ success: boolean }>;
  },
};
