import { useQuery } from "@tanstack/react-query";
import { goalsApi } from "@/lib/api/goals.api";

export const goalsKeys = {
  all: ["goals"] as const,
};

export function useGoals() {
  return useQuery({
    queryKey: goalsKeys.all,
    queryFn: goalsApi.getAll,
    staleTime: 30_000,
  });
}
