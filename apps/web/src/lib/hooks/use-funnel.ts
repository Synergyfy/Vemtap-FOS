import { useQuery } from "@tanstack/react-query";
import { funnelApi } from "@/lib/api/funnel.api";

export const funnelKeys = {
  all: ["funnel"] as const,
  stats: () => [...funnelKeys.all, "stats"] as const,
};

export function useFunnelStats() {
  return useQuery({
    queryKey: funnelKeys.stats(),
    queryFn: funnelApi.getStats,
    staleTime: 30_000,
  });
}
