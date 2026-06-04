import api from "./axios";
import type { DashboardStats, DashboardSnapshot, DashboardInsight } from "@/lib/types";

export const dashboardApi = {
  getStats: async () => {
    return api.get("/dashboard/stats") as unknown as Promise<DashboardStats>;
  },

  getSnapshots: async () => {
    return api.get("/dashboard/snapshots") as unknown as Promise<DashboardSnapshot[]>;
  },

  getInsights: async () => {
    return api.get("/dashboard/insights") as unknown as Promise<DashboardInsight[]>;
  },
};
