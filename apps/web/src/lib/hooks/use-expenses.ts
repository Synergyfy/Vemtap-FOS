import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api/expenses.api";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (params?: Record<string, unknown>) =>
    [...expenseKeys.all, "list", params] as const,
};

export function useExpenses(params?: { page?: number; perPage?: number; category?: string }) {
  return useQuery({
    queryKey: expenseKeys.list(params as Record<string, unknown>),
    queryFn: () => expensesApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof expensesApi.update>[1] }) =>
      expensesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}
