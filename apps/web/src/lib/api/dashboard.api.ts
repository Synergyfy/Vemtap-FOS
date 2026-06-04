import api from "./axios";
import type { DashboardStats, DashboardSnapshot, DashboardInsight } from "@/lib/types";

export const dashboardApi = {
  getStats: async () => {
    return api.get("/dashboard/stats") as Promise<DashboardStats>;
  },

  getSnapshots: async () => {
    return api.get("/dashboard/snapshots") as Promise<DashboardSnapshot[]>;
  },

  getInsights: async () => {
    return api.get("/dashboard/insights") as Promise<DashboardInsight[]>;
  },
};
