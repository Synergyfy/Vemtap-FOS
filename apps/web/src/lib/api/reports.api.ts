import api from "./axios";
import type { ReportsData } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FALLBACK: ReportsData = {
  reportSections: [
    { label: "Profit & Loss", value: "₦2.5M", change: "+18%" },
    { label: "Cash Flow", value: "₦8.2M", change: "+5%" },
    { label: "Revenue", value: "₦12.5M", change: "+22%" },
    { label: "Expenses", value: "₦4.8M", change: "-3%" },
  ],
  investorMetrics: [
    { label: "MRR", value: "₦2.1M" },
    { label: "ARR", value: "₦25.2M" },
    { label: "Revenue Growth", value: "+22%" },
    { label: "Customer Growth", value: "+15%" },
    { label: "Churn", value: "5%" },
    { label: "Gross Margin", value: "62%" },
    { label: "Burn Rate", value: "₦800k/mo" },
    { label: "Cash Runway", value: "12 months" },
  ],
};

export const reportsApi = {
  getAll: async (): Promise<ReportsData> => {
    try {
      return await api.get("/reports") as unknown as ReportsData;
    } catch {
      await delay(300);
      return FALLBACK;
    }
  },
};
