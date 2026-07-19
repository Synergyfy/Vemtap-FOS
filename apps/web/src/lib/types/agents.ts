export interface AgentListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  dateJoined: string;
  managerId: string | null;
  managerName: string | null;
  businessesCount: number;
  managedMrr: number;
  commissionEarned: number;
}

export interface ListAgentsResponse {
  agents: AgentListItem[];
  total: number;
}

export interface Subordinate {
  id: string;
  name: string;
  email: string;
}

export interface AgentBusiness {
  id: string;
  name: string;
  plan: 'BASIC' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  mrr: number;
  status: string;
}

export interface AgentDetailResponse extends AgentListItem {
  subordinates: Subordinate[];
  businesses: AgentBusiness[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueTrendResponse {
  months: MonthlyRevenue[];
}

// Backward-compatible aliases so existing imports still work
export type Agent = AgentListItem;
export type AgentDetail = AgentDetailResponse;
export type AgentsResponse = ListAgentsResponse;
