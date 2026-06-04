import {
  UserRole,
  AgentStatus,
  Plan,
  BusinessStatus,
  TransactionType,
  Platform,
  PeriodType,
  ForecastType,
  ScenarioType,
  CashFlowType,
  FrequencyType,
} from "../enums";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: AgentStatus;
  dateJoined: Date;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  name: string;
  owner: string;
  plan: Plan;
  mrr: number;
  status: BusinessStatus;
  joinDate: Date;
  renewalDate: Date | null;
  lastPaymentDate: Date | null;
  agentId: string | null;
  smsUsed: number;
  emailUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  platform: Platform;
  businessId: string | null;
  agentId: string | null;
  amount: number;
  cost: number;
  profit: number;
  paymentMethod: string | null;
  referenceId: string | null;
  date: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  periodType: PeriodType;
  targetRevenue: number;
  targetBusinesses: number;
  targetSmsUsage: number;
  targetProfit: number;
  startDate: Date;
  endDate: Date;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Forecast {
  id: string;
  forecastType: ForecastType;
  projectedValue: number;
  growthRate: number;
  churnRate: number;
  conversionRate: number;
  period: string;
  scenario: ScenarioType;
  createdAt: Date;
}

export interface CashFlow {
  id: string;
  type: CashFlowType;
  category: string;
  amount: number;
  referenceId: string | null;
  date: Date;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: FrequencyType;
  date: Date;
  createdAt: Date;
}

export interface SmsUsage {
  id: string;
  businessId: string;
  smsCount: number;
  costPerSms: number;
  sellingPricePerSms: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  date: Date;
}

export interface EmailUsage {
  id: string;
  businessId: string;
  emailCount: number;
  costPerEmail: number;
  sellingPricePerEmail: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  date: Date;
}

export interface QrThriveFunnel {
  id: string;
  qrScans: number;
  leadsCaptured: number;
  qrUsers: number;
  convertedToVemtap: number;
  conversionRate: number;
  date: Date;
}

export interface MetricsSnapshot {
  id: string;
  date: Date;
  totalRevenue: number;
  totalProfit: number;
  totalBusinesses: number;
  activeAgents: number;
  churnRate: number;
  conversionRate: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}
