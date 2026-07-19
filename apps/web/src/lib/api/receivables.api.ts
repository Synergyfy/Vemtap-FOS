import api from "./axios";
import type { ReceivablesData } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FALLBACK: ReceivablesData = {
  invoices: [
    { customer: "ABC Corp", amount: 500_000, dueDate: "2026-07-25", status: "Outstanding" },
    { customer: "XYZ Ltd", amount: 350_000, dueDate: "2026-07-15", status: "Overdue" },
    { customer: "Tech Solutions", amount: 200_000, dueDate: "2026-08-01", status: "Outstanding" },
    { customer: "Global Services", amount: 750_000, dueDate: "2026-06-30", status: "Overdue" },
    { customer: "Nigerian Enterprises", amount: 150_000, dueDate: "2026-07-20", status: "Pending" },
  ],
  totalOutstanding: 1_950_000,
  totalOverdue: 1_100_000,
  collectedThisMonth: 1_250_000,
};

export const receivablesApi = {
  getAll: async (): Promise<ReceivablesData> => {
    try {
      return await api.get("/receivables") as unknown as ReceivablesData;
    } catch {
      await delay(300);
      return FALLBACK;
    }
  },
};
