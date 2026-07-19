/* eslint-disable no-unused-vars */
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum AgentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  ENTERPRISE = "ENTERPRISE",
}

export enum BusinessStatus {
  ACTIVE = "ACTIVE",
  TRIAL = "TRIAL",
  CHURNED = "CHURNED",
}

export enum TransactionType {
  SUBSCRIPTION = "SUBSCRIPTION",
  SMS = "SMS",
  COMMISSION = "COMMISSION",
  EXPENSE = "EXPENSE",
  ENTERPRISE = "ENTERPRISE",
}

export enum Platform {
  VEMTAP = "VEMTAP",
  QRTHRIVE = "QRTHRIVE",
}

export enum PeriodType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum ForecastType {
  REVENUE = "REVENUE",
  PROFIT = "PROFIT",
  CASHFLOW = "CASHFLOW",
}

export enum ScenarioType {
  BEST = "BEST",
  EXPECTED = "EXPECTED",
  WORST = "WORST",
}

export enum CashFlowType {
  INFLOW = "INFLOW",
  OUTFLOW = "OUTFLOW",
}

export enum FrequencyType {
  ONE_TIME = "ONE_TIME",
  RECURRING = "RECURRING",
}
