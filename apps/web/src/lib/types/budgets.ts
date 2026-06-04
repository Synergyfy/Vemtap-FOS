export interface Budget {
  id: string;
  periodType: string;
  targetRevenue: number;
  targetBusinesses: number;
  targetSmsUsage: number;
  targetProfit: number;
  startDate: string;
  endDate: string;
  achievedRevenuePercentage: number;
  achievedProfitPercentage: number;
}

export interface Forecast {
  id: string;
  forecastType: string;
  projectedValue: number;
  growthRate: number;
  churnRate: number;
  conversionRate: number;
  period: string;
  scenario: string;
}
