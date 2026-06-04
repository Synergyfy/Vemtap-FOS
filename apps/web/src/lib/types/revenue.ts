export interface Transaction {
  id: string;
  type: string;
  paymentMethod: string;
  amount: number;
  cost: number;
  profit: number;
  referenceId: string;
  date: string;
  businessId: string | null;
  businessName: string | null;
  agentId: string | null;
  agentName: string | null;
}

export interface RevenueAggregates {
  totalRevenue: number;
  subscriptionRevenue: number;
  smsRevenue: number;
  totalProfit: number;
  agentPayouts: number;
  totalTransactions: number;
}

export interface MonthlyPlatformRevenueDto {
  month: string;
  total: number;
  vemtap: number;
  qrthrive: number;
}

export interface RevenueByTypeDto {
  name: string;
  value: number;
}

export interface RevenueChartDataResponse {
  monthlyPlatformRevenue: MonthlyPlatformRevenueDto[];
  revenueByType: RevenueByTypeDto[];
}

export interface BusinessTransactionItemDto {
  id: string;
  date: string;
  amount: number;
  profit: number;
  type: string;
}

export interface BusinessRevenueHistoryResponse {
  transactions: BusinessTransactionItemDto[];
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  profit: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}
