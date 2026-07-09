export interface ForecastInput {
  baseBusinesses: number;
  arpu: number;
  fixedCosts: number;
  grossRevenue: number;
  variableCostMargin: number;
  cashBalance: number;
  qrThriveLeadsPerMonth: number;
  period: number;
  growthRate: number;
  churnRate: number;
  conversionRate: number;
}

export interface MonthlyForecast {
  month: string;
  businesses: number;
  mrr: number;
  profit: number;
  inflow: number;
  outflow: number;
  cashBalance: number;
}

export interface ForecastSummary {
  projectedMrr: number;
  mrrGrowthPercent: number;
  totalProjectedProfit: number;
  isDeclining: boolean;
  healthAlert: "HEALTHY" | "HIGH_RISK";
}

export interface ForecastProjection {
  summary: ForecastSummary;
  monthlyData: MonthlyForecast[];
}
