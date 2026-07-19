import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "@/lib/api/revenue.api";

export const revenueKeys = {
  all: ["revenue"] as const,
  transactions: (filters?: Record<string, unknown>) =>
    [...revenueKeys.all, "transactions", filters] as const,
  aggregates: () => [...revenueKeys.all, "aggregates"] as const,
  trends: () => [...revenueKeys.all, "trends"] as const,
  chartData: (filters?: Record<string, unknown>) =>
    [...revenueKeys.all, "chartData", filters] as const,
  businessHistory: (businessId: string) =>
    [...revenueKeys.all, "businessHistory", businessId] as const,
};

export function useRevenueTransactions(filters?: {
  page?: number;
  perPage?: number;
  type?: string;
  platform?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: revenueKeys.transactions(filters as Record<string, unknown>),
    queryFn: () => revenueApi.getTransactions(filters),
    staleTime: 30_000,
  });
}

export function useRevenueAggregates() {
  return useQuery({
    queryKey: revenueKeys.aggregates(),
    queryFn: revenueApi.getAggregates,
    staleTime: 30_000,
  });
}

export function useRevenueTrends() {
  return useQuery({
    queryKey: revenueKeys.trends(),
    queryFn: revenueApi.getTrends,
    staleTime: 30_000,
  });
}

export function useRevenueChartData(filters?: {
  startDate?: string;
  endDate?: string;
  platform?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: revenueKeys.chartData(filters as Record<string, unknown>),
    queryFn: () => revenueApi.getChartData(filters),
    staleTime: 30_000,
  });
}

export function useBusinessRevenueHistory(businessId: string | null) {
  return useQuery({
    queryKey: revenueKeys.businessHistory(businessId ?? ""),
    queryFn: () => revenueApi.getBusinessRevenueHistory(businessId!),
    enabled: !!businessId,
    staleTime: 30_000,
  });
}
