import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetsApi } from "@/lib/api/budgets.api";

export const budgetKeys = {
  all: ["budgets"] as const,
  list: () => [...budgetKeys.all, "list"] as const,
  forecasts: (params?: Record<string, unknown>) =>
    [...budgetKeys.all, "forecasts", params] as const,
};

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: budgetsApi.getAll,
    staleTime: 60_000,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useForecasts(params?: { scenario?: string }) {
  return useQuery({
    queryKey: budgetKeys.forecasts(params as Record<string, unknown>),
    queryFn: () => budgetsApi.getForecasts(params),
    staleTime: 60_000,
  });
}
