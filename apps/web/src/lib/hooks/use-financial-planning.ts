import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialPlanningApi } from "@/lib/api/financial-planning.api";
import type {
  CreateFinancialTargetInput,
  ScenarioSimulationInput,
} from "@/lib/types";

export const financialPlanningKeys = {
  all: ["financial-planning"] as const,
  targets: (periodType?: string) =>
    [...financialPlanningKeys.all, "targets", periodType] as const,
};

export function useFinancialTargets(periodType?: string) {
  return useQuery({
    queryKey: financialPlanningKeys.targets(periodType),
    queryFn: () => financialPlanningApi.getTargets(periodType),
    staleTime: 30_000,
  });
}

export function useCreateFinancialTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFinancialTargetInput) =>
      financialPlanningApi.createTarget(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: financialPlanningKeys.all,
      }),
  });
}

export function useScenarioSimulation() {
  return useMutation({
    mutationFn: (data: ScenarioSimulationInput) =>
      financialPlanningApi.simulateScenarios(data),
  });
}
