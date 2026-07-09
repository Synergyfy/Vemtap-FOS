import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  snapshots: () => [...dashboardKeys.all, "snapshots"] as const,
  insights: () => [...dashboardKeys.all, "insights"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardApi.getStats,
    staleTime: 15_000,
  });
}

export function useDashboardSnapshots() {
  return useQuery({
    queryKey: dashboardKeys.snapshots(),
    queryFn: dashboardApi.getSnapshots,
    staleTime: 30_000,
  });
}

export function useDashboardInsights() {
  return useQuery({
    queryKey: dashboardKeys.insights(),
    queryFn: dashboardApi.getInsights,
    staleTime: 60_000,
  });
}
