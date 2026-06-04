import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pnlApi } from "@/lib/api/pnl.api";

export const pnlKeys = {
  all: ["pnl"] as const,
  statement: () => [...pnlKeys.all, "statement"] as const,
  cashflows: (params?: Record<string, unknown>) =>
    [...pnlKeys.all, "cashflows", params] as const,
  runway: () => [...pnlKeys.all, "runway"] as const,
  breakEven: () => [...pnlKeys.all, "break-even"] as const,
  revenueTrends: () => [...pnlKeys.all, "revenue-trends"] as const,
};

export function usePnlStatement() {
  return useQuery({
    queryKey: pnlKeys.statement(),
    queryFn: pnlApi.getStatement,
    staleTime: 30_000,
  });
}

export function useCashFlows(params?: { page?: number; perPage?: number; type?: string }) {
  return useQuery({
    queryKey: pnlKeys.cashflows(params as Record<string, unknown>),
    queryFn: () => pnlApi.getCashFlows(params),
    staleTime: 30_000,
  });
}

export function useCreateCashFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pnlApi.createCashFlow,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pnlKeys.all }),
  });
}

export function useRunway() {
  return useQuery({
    queryKey: pnlKeys.runway(),
    queryFn: pnlApi.getRunway,
    staleTime: 60_000,
  });
}

export function useBreakEven() {
  return useQuery({
    queryKey: pnlKeys.breakEven(),
    queryFn: pnlApi.getBreakEven,
    staleTime: 30_000,
  });
}

export function useRevenueTrends() {
  return useQuery({
    queryKey: pnlKeys.revenueTrends(),
    queryFn: pnlApi.getRevenueTrends,
    staleTime: 30_000,
  });
}
