import { useQuery } from "@tanstack/react-query";
import { receivablesApi } from "@/lib/api/receivables.api";

export const receivablesKeys = {
  all: ["receivables"] as const,
};

export function useReceivables() {
  return useQuery({
    queryKey: receivablesKeys.all,
    queryFn: receivablesApi.getAll,
    staleTime: 30_000,
  });
}
