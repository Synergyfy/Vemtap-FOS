"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, Receipt, PiggyBank, Building2, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { useAgents } from "@/lib/hooks/use-agents";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { useReceivables } from "@/lib/hooks/use-receivables";
import { usePayables } from "@/lib/hooks/use-payables";
import { useBusinesses, useBusinessStats } from "@/lib/hooks/use-businesses";

type Tab = "commissions" | "receivables" | "payables" | "businesses" | "agents";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "commissions", label: "Commissions", icon: Coins },
  { id: "receivables", label: "Receivables", icon: Receipt },
  { id: "payables", label: "Payables", icon: PiggyBank },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "agents", label: "Agents", icon: Users },
];

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState<Tab>("commissions");

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Business</h1>
        <p className="text-zinc-500">Commissions, receivables, payables, businesses, and agents.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "commissions" && <CommissionsTab />}
      {activeTab === "receivables" && <ReceivablesTab />}
      {activeTab === "payables" && <PayablesTab />}
      {activeTab === "businesses" && <BusinessesTab />}
      {activeTab === "agents" && <AgentsTab />}
    </div>
  );
}

function CommissionsTab() {
  const { data: agentsData, isLoading } = useAgents({ perPage: 100 });
  const { data: stats } = useDashboardStats();

  if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const agents = agentsData?.agents ?? [];
  const totalCommission = stats?.commissionsPaid ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 1;
  const commissionPct = (totalCommission / totalRevenue) * 100;
  const topAgents = [...agents].filter((a) => a.commissionEarned > 0).sort((a, b) => b.commissionEarned - a.commissionEarned).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Commission</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalCommission)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Commission % of Revenue</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{commissionPct.toFixed(1)}%</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Agents</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{agents.length}</h3>
        </div>
      </div>

      {topAgents.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Top Affiliates</h2>
            <Link href="/commission-planning" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Full <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium text-right">Commission</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {topAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{agent.name}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">{formatNaira(agent.commissionEarned)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceivablesTab() {
  const { data, isLoading } = useReceivables();

  if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const invoices = data?.invoices ?? [];
  const totalOutstanding = invoices.reduce((s, i) => s + (i.status === "Outstanding" || i.status === "Pending" ? i.amount : 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const collectedThisMonth = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Outstanding</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalOutstanding)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Overdue</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(totalOverdue)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Collected This Month</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{formatNaira(collectedThisMonth)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Invoices</p>
          <h3 className="text-xl font-bold text-indigo-500 mt-1">{invoices.length}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Invoices</h2>
          <Link href="/receivables" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Full <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {invoices.slice(0, 5).map((inv, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{inv.customer}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatNaira(inv.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === "Paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : inv.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PayablesTab() {
  const { data, isLoading } = usePayables();

  if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const { totalPayables, dueThisWeek, dueThisMonth, overdue, bills } = data ?? { totalPayables: 0, dueThisWeek: 0, dueThisMonth: 0, overdue: 0, bills: [] };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Payables</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalPayables)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Due This Week</p>
          <h3 className="text-xl font-bold text-amber-500 mt-1">{formatNaira(dueThisWeek)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Due This Month</p>
          <h3 className="text-xl font-bold text-orange-500 mt-1">{formatNaira(dueThisMonth)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Overdue</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(overdue)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Upcoming Bills</h2>
          <Link href="/payables" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Full <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {bills.slice(0, 5).map((bill, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{bill.description}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatNaira(bill.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.status === "Paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : bill.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{bill.status}</span>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No bills yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BusinessesTab() {
  const { data: backendData, isLoading } = useBusinesses({ limit: 100 });
  const { data: bizStats } = useBusinessStats();

  if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const businesses = (backendData?.data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    owner: b.owner || "—",
    plan: String(b.plan),
    mrr: b.mrr,
    status: String(b.status).charAt(0).toUpperCase() + String(b.status).slice(1).toLowerCase(),
  }));

  const activeBiz = bizStats?.activeBusinesses ?? backendData?.stats?.active ?? "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Active Businesses</p>
          <h3 className="text-xl font-bold text-blue-500 mt-1">{activeBiz}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total MRR</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{bizStats ? formatNaira(bizStats.totalMrr) : "—"}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Churn Rate</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{bizStats ? `${bizStats.churnRate}%` : "—"}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Businesses</p>
          <h3 className="text-xl font-bold text-purple-500 mt-1">{backendData?.stats?.total ?? bizStats?.totalBusinesses ?? "—"}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Businesses</h2>
          <Link href="/businesses" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Full <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Business</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium text-right">MRR</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {businesses.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{b.name}</div>
                    <div className="text-xs text-zinc-500">{b.owner}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800">
                      {b.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">{formatNaira(b.mrr)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No businesses yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AgentsTab() {
  const { data: backendData, isLoading } = useAgents();

  if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const agents = (backendData?.agents ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    businesses: a.businessesCount || 0,
    revenue: a.managedMrr || 0,
    commission: a.commissionEarned || 0,
    status: a.status === "ACTIVE" ? "Active" : "Inactive",
  }));

  const totalRevenue = agents.reduce((s, a) => s + a.revenue, 0);
  const totalCommission = agents.reduce((s, a) => s + a.commission, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Agents</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{agents.length}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Revenue Generated</p>
          <h3 className="text-xl font-bold text-blue-500 mt-1">{formatNaira(totalRevenue)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Commission Earned</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{formatNaira(totalCommission)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Businesses Acquired</p>
          <h3 className="text-xl font-bold text-purple-500 mt-1">{agents.reduce((s, a) => s + a.businesses, 0)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team Overview</h2>
          <Link href="/agents" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Full <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium text-right">Acquired</th>
                <th className="px-6 py-4 font-medium text-right">Revenue</th>
                <th className="px-6 py-4 font-medium text-right">Commission</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {agents.slice(0, 5).map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{agent.name}</td>
                  <td className="px-6 py-4 text-right text-zinc-900 dark:text-zinc-50">{agent.businesses}</td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">{formatNaira(agent.revenue)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">{formatNaira(agent.commission)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                      {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No agents yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
