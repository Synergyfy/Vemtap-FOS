export interface FinancialTarget {
  id: string;
  periodType: "daily" | "weekly" | "monthly" | "yearly";
  targetRevenue: number;
  targetBusinesses: number;
  targetSmsUsage: number;
  targetEmailUsage: number;
  profitMargin: number;
  achievedRevenuePercentage: number;
  achievedProfitPercentage: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CreateFinancialTargetInput {
  periodType: "daily" | "weekly" | "monthly" | "yearly";
  targetRevenue: number;
  targetBusinesses: number;
  targetSmsUsage: number;
  targetEmailUsage: number;
  profitMargin: number;
  startDate: string;
  endDate: string;
}

export interface ScenarioSimulationInput {
  currentBusinesses: number;
  growthRate: number;
  churnRate: number;
  pricing: number;
  agentFactor: number;
  projectionMonths: number;
  profitMargin: number;
}

export interface ScenarioMonthBreakdown {
  month: number;
  businesses: number;
  profit: number;
}

export interface ScenarioResult {
  totalProfit: number;
  monthlyBreakdown: ScenarioMonthBreakdown[];
}

export interface ScenarioSimulation {
  best: ScenarioResult;
  expected: ScenarioResult;
  worst: ScenarioResult;
}
