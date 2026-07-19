import api from "./axios";
import type { PayablesData } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FALLBACK: PayablesData = {
  monthlySalary: 2_500_000,
  totalBills: 1_850_000,
  totalPayables: 4_350_000,
  dueThisWeek: 1_200_000,
  dueThisMonth: 4_350_000,
  overdue: 150_000,
  bills: [
    { description: "Cloud Hosting", amount: 450_000, dueDate: "2026-08-01", status: "Pending", category: "Infrastructure" },
    { description: "Software Licenses", amount: 250_000, dueDate: "2026-07-20", status: "Pending", category: "Software" },
    { description: "Internet Service", amount: 150_000, dueDate: "2026-07-25", status: "Pending", category: "Utilities" },
    { description: "Office Rent", amount: 800_000, dueDate: "2026-07-01", status: "Paid", category: "Rent" },
    { description: "Electricity", amount: 200_000, dueDate: "2026-06-30", status: "Overdue", category: "Utilities" },
  ],
  paymentSchedule: [
    { description: "Hosting - AWS", amount: 450_000, dueDate: "2026-08-01", status: "Pending", category: "Infrastructure" },
    { description: "Salaries - July", amount: 2_500_000, dueDate: "2026-07-31", status: "Pending", category: "Payroll" },
    { description: "Commission Payouts", amount: 800_000, dueDate: "2026-08-10", status: "Pending", category: "Commissions" },
    { description: "Software Subscriptions", amount: 350_000, dueDate: "2026-08-15", status: "Pending", category: "Software" },
  ],
};

export const payablesApi = {
  getAll: async (): Promise<PayablesData> => {
    try {
      return await api.get("/payables") as unknown as PayablesData;
    } catch {
      await delay(300);
      return FALLBACK;
    }
  },
};
