import api from "./axios";
import type {
  RevenueAggregates,
  RevenueTrend,
  TransactionsResponse,
  RevenueChartDataResponse,
  BusinessRevenueHistoryResponse,
} from "@/lib/types";

export const revenueApi = {
  getTransactions: async (params?: {
    page?: number;
    perPage?: number;
    type?: string;
    platform?: string;
    businessId?: string;
    agentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get("/revenue/transactions", { params }) as unknown as Promise<TransactionsResponse>;
  },

  getAggregates: async () => {
    return api.get("/revenue/aggregates") as unknown as Promise<RevenueAggregates>;
  },

  getTrends: async () => {
    return api.get("/revenue/trends") as unknown as Promise<RevenueTrend[]>;
  },

  getChartData: async (params?: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    type?: string;
  }) => {
    return api.get("/revenue/chart-data", { params }) as unknown as Promise<RevenueChartDataResponse>;
  },

  getBusinessRevenueHistory: async (businessId: string) => {
    return api.get(`/revenue/business/${businessId}/history`) as unknown as Promise<BusinessRevenueHistoryResponse>;
  },
};
