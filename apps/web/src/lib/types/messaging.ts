export interface SmsLog {
  id: string;
  businessId: string;
  businessName: string | null;
  smsCount: number;
  costPerSms: number;
  sellingPricePerSms: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  date: string;
}

export interface EmailLog {
  id: string;
  businessId: string;
  businessName: string | null;
  emailCount: number;
  costPerEmail: number;
  sellingPricePerEmail: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  date: string;
}

export interface MessagingAggregates {
  totalSmsSent: number;
  totalEmailsSent: number;
  totalMessagingCost: number;
  totalMessagingRevenue: number;
  totalMessagingProfit: number;
}

export interface SmsLogsResponse {
  logs: SmsLog[];
  total: number;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
  total: number;
}
