import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports.api";

export const reportsKeys = {
  all: ["reports"] as const,
};

export function useReports() {
  return useQuery({
    queryKey: reportsKeys.all,
    queryFn: reportsApi.getAll,
    staleTime: 30_000,
  });
}
