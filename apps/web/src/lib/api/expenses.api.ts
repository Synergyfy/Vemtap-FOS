import api from "./axios";
import type { Expense, ExpensesResponse } from "@/lib/types";

export const expensesApi = {
  getAll: async (params?: { page?: number; perPage?: number; category?: string }) => {
    return api.get("/expenses", { params }) as unknown as Promise<ExpensesResponse>;
  },

  create: async (data: { category: string; amount: number; frequency: string; date?: string | null }) => {
    return api.post("/expenses", data) as unknown as Promise<Expense>;
  },
};
