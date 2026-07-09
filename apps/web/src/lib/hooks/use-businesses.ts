import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessesApi } from "@/lib/api/businesses.api";

export const businessKeys = {
  all: ["businesses"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...businessKeys.all, "list", filters] as const,
  detail: (id: string) => [...businessKeys.all, "detail", id] as const,
  stats: () => [...businessKeys.all, "stats"] as const,
};

export function useBusinesses(params?: {
  page?: number;
  limit?: number;
  plan?: string;
  status?: string;
  agentId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: businessKeys.list(params as Record<string, unknown>),
    queryFn: () => businessesApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useBusinessStats() {
  return useQuery({
    queryKey: businessKeys.stats(),
    queryFn: businessesApi.getStats,
    staleTime: 30_000,
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => businessesApi.getOne(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof businessesApi.update>[1] }) =>
      businessesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}
