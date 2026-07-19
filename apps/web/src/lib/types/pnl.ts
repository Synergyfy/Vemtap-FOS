export interface PnlStatement {
  grossRevenue: number;
  gatewayCost: number;
  commissionPaid: number;
  opexPaid: number;
  netProfit: number;
  profitMarginPercentage: number;
}

export interface CashFlowEntry {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface CashFlowsResponse {
  cashflows: CashFlowEntry[];
  total: number;
}

export interface BreakEvenData {
  totalMonthlyCosts: number;
  monthlyFixedCosts: number;
  grossRevenue: number;
  activeBusinesses: number;
  arpu: number;
  breakEvenBusinesses: number;
  breakEvenRevenue: number;
  progressPercent: number;
  remainingGap: number;
  isProfitable: boolean;
}

export interface RunwayData {
  openingCashBalance: number;
  closingCashBalance: number;
  monthlyNetCashFlow: number;
  monthlyBurnRate: number;
  runwayMonths: number;
}
