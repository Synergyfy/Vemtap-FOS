export interface DashboardStats {
  totalRevenue: number;
  netProfit: number;
  totalBusinesses: number;
  activeAgents: number;
  churnRate: number;
  conversionRate: number;
  smsSent: number;
  vemtapRevenue: number;
  qrthriveRevenue: number;
  commissionsPaid: number;
  cashBalance: number;
}

export interface DashboardSnapshot {
  date: string;
  totalRevenue: number;
  totalProfit: number;
  totalBusinesses: number;
  churnRate: number;
  conversionRate: number;
}

export interface DashboardInsight {
  type: string;
  title: string;
  message: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
}
