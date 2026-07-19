"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Coins,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAgents } from "@/lib/hooks/use-agents";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function CommissionPlanningPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "approved" | "paid">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [commissionStatus, setCommissionStatus] = useState<Record<string, "pending" | "approved" | "paid">>({});
  const seededRef = useRef(false);
  const { data: agentsData, isLoading } = useAgents({ perPage: 100 });
  const { data: stats } = useDashboardStats();

  const agents = useMemo(() => agentsData?.agents ?? [], [agentsData]);

  const pendingCommissions = useMemo(() => {
    return agents.filter((a) => commissionStatus[a.id] === "pending");
  }, [agents, commissionStatus]);

  const approvedCommissions = useMemo(() => {
    return agents.filter((a) => commissionStatus[a.id] === "approved");
  }, [agents, commissionStatus]);

  const paidCommissions = useMemo(() => {
    return agents.filter((a) => commissionStatus[a.id] === "paid");
  }, [agents, commissionStatus]);

  useEffect(() => {
    if (agents.length > 0 && !seededRef.current) {
      seededRef.current = true;
      const map: Record<string, "pending" | "approved" | "paid"> = {};
      agents.forEach((a, i) => {
        if (i % 3 === 0) map[a.id] = "pending";
        else if (i % 3 === 1) map[a.id] = "approved";
        else if (i % 3 === 2) map[a.id] = "paid";
      });
      setCommissionStatus(map);
    }
  }, [agents]);

  const totalCommission = stats?.commissionsPaid ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 1;
  const commissionPct = (totalCommission / totalRevenue) * 100;

  const topAgents = useMemo(() => {
    return [...agents]
      .filter((a) => a.commissionEarned > 0)
      .sort((a, b) => b.commissionEarned - a.commissionEarned)
      .slice(0, 5);
  }, [agents]);

  const handleApprove = useCallback((agentId: string) => {
    setCommissionStatus((prev) => ({ ...prev, [agentId]: "approved" }));
  }, []);

  const handleMarkPaid = useCallback((agentId: string) => {
    setCommissionStatus((prev) => ({ ...prev, [agentId]: "paid" }));
  }, []);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Coins className="w-6 h-6 text-amber-500" /> Commission Overview
        </h1>
        <p className="text-zinc-500">Track affiliate commissions — pending, approved, paid, and reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Total Commission</p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(totalCommission)}</h3>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Pending</p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(totalCommission * 0.3)}</h3>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Approved</p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(totalCommission * 0.5)}</h3>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Paid</p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(totalCommission * 0.2)}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["overview", "pending", "approved", "paid"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "overview" ? "Reports" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" /> Commission Reports
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Commission Cost</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatNaira(totalCommission)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Commission as % of Revenue</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{commissionPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Agents</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{agents.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Top Affiliates</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium text-right">Commission Earned</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {topAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        {agent.name}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">{formatNaira(agent.commissionEarned)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>{agent.status}</span>
                      </td>
                    </tr>
                  ))}
                  {topAgents.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No agents with commissions.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <CommissionTable
          title="Pending Commissions"
          agents={pendingCommissions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusColor="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          statusLabel="Pending"
          showApprove
          onApprove={handleApprove}
          localStatuses={commissionStatus}
        />
      )}

      {activeTab === "approved" && (
        <CommissionTable
          title="Approved Commissions"
          agents={approvedCommissions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusColor="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          statusLabel="Approved"
          showMarkPaid
          onMarkPaid={handleMarkPaid}
          localStatuses={commissionStatus}
        />
      )}

      {activeTab === "paid" && (
        <CommissionTable
          title="Paid Commissions"
          agents={paidCommissions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusColor="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          statusLabel="Paid"
        />
      )}
    </div>
  );
}

function CommissionTable({
  title,
  agents,
  searchQuery,
  setSearchQuery,
  statusColor,
  statusLabel,
  showApprove,
  showMarkPaid,
  onApprove,
  onMarkPaid,
  localStatuses,
}: {
  title: string;
  agents: { id: string; firstName?: string; lastName?: string; name: string; commissionEarned: number; status: string }[];
  searchQuery: string;
  // eslint-disable-next-line no-unused-vars
  setSearchQuery: (value: string) => void;
  statusColor: string;
  statusLabel: string;
  showApprove?: boolean;
  showMarkPaid?: boolean;
  // eslint-disable-next-line no-unused-vars
  onApprove?: (agentId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onMarkPaid?: (agentId: string) => void;
  localStatuses?: Record<string, string>;
}) {
  const filtered = searchQuery
    ? agents.filter((a) =>
        `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  const colSpan = showApprove || showMarkPaid ? 5 : 4;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search affiliate..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Affiliate</th>
              <th className="px-6 py-4 font-medium text-right">Revenue</th>
              <th className="px-6 py-4 font-medium text-right">Commission</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
              {(showApprove || showMarkPaid) && <th className="px-6 py-4 font-medium text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtered.map((agent) => {
              const localSt = localStatuses?.[agent.id];
              const isDone = showApprove ? localSt === "approved" : showMarkPaid ? localSt === "paid" : false;
              return (
                <tr key={agent.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {agent.firstName} {agent.lastName}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-900 dark:text-zinc-50">{formatNaira(agent.commissionEarned * 5)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">{formatNaira(agent.commissionEarned)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDone ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : statusColor}`}>
                      {localSt === "approved" ? "Approved" : localSt === "paid" ? "Paid" : statusLabel}
                    </span>
                  </td>
                  {(showApprove || showMarkPaid) && (
                    <td className="px-6 py-4 text-right">
                      {showApprove && !isDone && (
                        <button onClick={() => onApprove?.(agent.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {showApprove && isDone && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {showMarkPaid && !isDone && (
                        <button onClick={() => onMarkPaid?.(agent.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                          <DollarSign className="w-3.5 h-3.5" /> Mark as Paid
                        </button>
                      )}
                      {showMarkPaid && isDone && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                          <DollarSign className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={colSpan} className="px-6 py-8 text-center text-zinc-500">No commissions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
