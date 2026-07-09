import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api/agents.api";

export const agentKeys = {
  all: ["agents"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...agentKeys.all, "list", filters] as const,
  detail: (id: string) => [...agentKeys.all, "detail", id] as const,
  revenue: (id: string) => [...agentKeys.all, "revenue", id] as const,
};

export function useAgents(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: agentKeys.list(params as Record<string, unknown>),
    queryFn: () => agentsApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getOne(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAgentRevenue(id: string | null) {
  return useQuery({
    queryKey: agentKeys.revenue(id ?? ""),
    queryFn: () => agentsApi.getRevenue(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.all }),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof agentsApi.update>[1] }) =>
      agentsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.all }),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.all }),
  });
}
