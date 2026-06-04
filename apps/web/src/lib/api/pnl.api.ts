import api from "./axios";
import type {
  PnlStatement,
  CashFlowEntry,
  CashFlowsResponse,
  RunwayData,
  BreakEvenData,
  RevenueTrend,
} from "@/lib/types";

export const pnlApi = {
  getStatement: async () => {
    return api.get("/pnl/statement") as unknown as Promise<PnlStatement>;
  },

  getCashFlows: async (params?: { page?: number; perPage?: number; type?: string }) => {
    return api.get("/pnl/cashflows", { params }) as unknown as Promise<CashFlowsResponse>;
  },

  createCashFlow: async (data: { type: string; category: string; amount: number; date?: string | null }) => {
    return api.post("/pnl/cashflows", data) as unknown as Promise<CashFlowEntry>;
  },

  getRunway: async () => {
    return api.get("/pnl/cashflow-runway") as unknown as Promise<RunwayData>;
  },

  getBreakEven: async () => {
    return api.get("/pnl/cost-break-even") as unknown as Promise<BreakEvenData>;
  },

  getRevenueTrends: async () => {
    return api.get("/pnl/revenue-trends") as unknown as Promise<RevenueTrend[]>;
  },
};
