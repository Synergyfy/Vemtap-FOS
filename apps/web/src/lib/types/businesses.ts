import type { Plan, BusinessStatus } from "@vemtap-fos/shared-types";

export interface Business {
  id: string;
  name: string;
  owner: string;
  plan: Plan;
  mrr: number;
  status: BusinessStatus;
  joinDate: string;
  renewalDate: string | null;
  lastPaymentDate: string | null;
  agentId: string | null;
  agentName: string | null;
  smsUsed: number;
  emailUsed: number;
}

export interface BusinessDetail extends Business {
  transactions: {
    id: string;
    type: string;
    amount: number;
    date: string;
  }[];
}

export interface BusinessesResponse {
  businesses: Business[];
  total: number;
}

export interface AdminBusinessesMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface AdminBusinessesStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  approvedToday: number;
  avgWaitTime: string;
}

export interface AdminBusinessesResponse {
  data: Business[];
  meta: AdminBusinessesMeta;
  stats: AdminBusinessesStats;
}

export interface BestSellingPlan {
  plan: string;
  totalMrr: number;
  businessCount: number;
}

export interface PlanDistributionItem {
  plan: string;
  count: number;
  totalMrr: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface BusinessStatsResponse {
  activeBusinesses: number;
  totalMrr: number;
  churnRate: number;
  churnedCount: number;
  totalBusinesses: number;
  bestSellingPlan: BestSellingPlan | null;
  planDistribution: PlanDistributionItem[];
  statusDistribution: StatusDistributionItem[];
}
