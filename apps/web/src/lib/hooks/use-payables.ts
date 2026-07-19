import { useQuery } from "@tanstack/react-query";
import { payablesApi } from "@/lib/api/payables.api";

export const payablesKeys = {
  all: ["payables"] as const,
};

export function usePayables() {
  return useQuery({
    queryKey: payablesKeys.all,
    queryFn: payablesApi.getAll,
    staleTime: 30_000,
  });
}
