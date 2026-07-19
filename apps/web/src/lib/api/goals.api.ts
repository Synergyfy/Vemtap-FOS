import api from "./axios";
import type { GoalsData } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FALLBACK: GoalsData = {
  goals: [
    { id: "1", name: "Reach ₦5M Monthly Revenue", target: 5_000_000, current: 4_200_000, deadline: "2026-12-31", category: "Revenue" },
    { id: "2", name: "Emergency Reserve (₦5M)", target: 5_000_000, current: 3_750_000, deadline: "2026-12-31", category: "Reserve" },
    { id: "3", name: "Gross Margin > 60%", target: 60, current: 65, deadline: "2026-12-31", category: "Margin" },
    { id: "4", name: "Cash Runway > 12 Months", target: 12, current: 9, deadline: "2026-06-30", category: "Runway" },
  ],
  projects: [
    { id: "p1", name: "AI Feature Development", budget: 2_000_000, spent: 800_000, revenue: 0, status: "In Progress", deadline: "2026-09-30" },
    { id: "p2", name: "Marketing Campaign", budget: 500_000, spent: 350_000, revenue: 200_000, status: "In Progress", deadline: "2026-08-15" },
    { id: "p3", name: "Hardware Deployment", budget: 1_000_000, spent: 1_000_000, revenue: 800_000, status: "Completed", deadline: "2026-06-30" },
  ],
};

export const goalsApi = {
  getAll: async (): Promise<GoalsData> => {
    try {
      return await api.get("/goals") as unknown as GoalsData;
    } catch {
      await delay(300);
      return FALLBACK;
    }
  },
};
