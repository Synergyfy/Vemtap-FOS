import api from "./axios";
import type { Budget, Forecast } from "@/lib/types";

export const budgetsApi = {
  getAll: async () => {
    return api.get("/budgets") as Promise<Budget[]>;
  },

  create: async (data: {
    periodType: string;
    targetRevenue: number;
    targetBusinesses: number;
    targetSmsUsage: number;
    targetProfit: number;
    startDate: string;
    endDate: string;
  }) => {
    return api.post("/budgets", data) as Promise<Budget>;
  },

  getForecasts: async (params?: { scenario?: string }) => {
    return api.get("/budgets/forecasts", { params }) as Promise<Forecast[]>;
  },
};
