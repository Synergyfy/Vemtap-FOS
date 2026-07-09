import FOS_API from "./axios";
import type {
  FinancialTarget,
  CreateFinancialTargetInput,
  ScenarioSimulation,
  ScenarioSimulationInput,
} from "@/lib/types";

export const financialPlanningApi = {
  createTarget: async (data: CreateFinancialTargetInput) => {
    return FOS_API.post<FinancialTarget>(
      "/financial-planning/targets",
      data,
    ) as unknown as Promise<FinancialTarget>;
  },

  getTargets: async (periodType?: string) => {
    return FOS_API.get<FinancialTarget[]>(
      "/financial-planning/targets",
      { params: periodType ? { periodType } : undefined },
    ) as unknown as Promise<FinancialTarget[]>;
  },

  simulateScenarios: async (data: ScenarioSimulationInput) => {
    return FOS_API.post<ScenarioSimulation>(
      "/financial-planning/scenarios",
      data,
    ) as unknown as Promise<ScenarioSimulation>;
  },
};
