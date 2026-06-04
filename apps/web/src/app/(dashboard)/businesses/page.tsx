"use client";

import { useState, useMemo } from "react";
import { useBusinesses, useBusinessStats } from "@/lib/hooks/use-businesses";
import { useBusinessRevenueHistory } from "@/lib/hooks/use-revenue";
import {
  Building2,
  Search,
  Filter,
  DollarSign,
  UserX,
  Award,
  ChevronRight,
  X,
  Mail,
  MessageSquare,
  Clock,
  ChevronLeft,
  Download,
  Loader2,
  Users,
  Store,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};



export default function BusinessesPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  // --- FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // TanStack Query dynamically fetching up to 100 client businesses from database
  const { data: backendData, error, isLoading } = useBusinesses({ limit: 100 });

  const { data: bizStats } = useBusinessStats();
  const adminStats = backendData?.stats;

  const { data: revenueHistory, isLoading: historyLoading } = useBusinessRevenueHistory(selectedBusiness?.id ?? null);

  const rawBusinesses = useMemo(() => {
    if (!backendData) return [];
    const list = backendData.data ?? [];
    return list.map((b: any) => ({
      id: b.id,
      name: b.name,
      owner: b.owner ? `${b.owner.firstName ?? ""} ${b.owner.lastName ?? ""}`.trim() || b.owner.email || "—" : "—",
      plan: b.plan ?? b.category?.name ?? "—",
      mrr: Number(b.mrr) || 0,
      status: toTitleCase(b.status),
      renewalDate: b.verifiedAt ?? b.createdAt ?? new Date().toISOString(),
      agentId: b.agentId ?? "—",
      agentName: b.agentName ?? "—",
      smsUsed: Number(b.smsUsed) || 0,
      emailUsed: Number(b.emailUsed) || 0,
    }));
  }, [backendData]);

  // Calculate dynamic metrics & filter
  const filteredBusinesses = useMemo(() => {
    let filtered = rawBusinesses;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b: any) =>
          b.name.toLowerCase().includes(q) ||
          b.owner.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q),
      );
    }

    if (planFilter !== "All") {
      filtered = filtered.filter((b: any) => b.plan === planFilter);
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((b: any) => b.status === statusFilter);
    }

    return filtered;
  }, [searchQuery, planFilter, statusFilter, rawBusinesses]);

  const summaryStats = useMemo(() => {
    const as = adminStats;
    const bs = bizStats;
    return [
      {
        label: "Active Businesses",
        value: as?.active ?? bs?.activeBusinesses ?? "—",
        tooltip: "Total number of businesses currently subscribed.",
        icon: Building2,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/30",
      },
      {
        label: "Total MRR",
        value: bs ? formatNaira(bs.totalMrr) : "—",
        tooltip: "Monthly Recurring Revenue from all active subscriptions.",
        icon: DollarSign,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/30",
      },
      {
        label: "Churn Rate",
        value: bs ? `${bs.churnRate}%` : "—",
        tooltip: "Percentage of businesses that have cancelled.",
        icon: UserX,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/30",
      },
      {
        label: "Best Selling Plan",
        value: bs?.bestSellingPlan ? `${bs.bestSellingPlan.plan} (${formatNaira(bs.bestSellingPlan.totalMrr)})` : "—",
        tooltip: "The plan that generates the most revenue.",
        icon: Award,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/30",
      },
      {
        label: "Total Businesses",
        value: as?.total ?? bs?.totalBusinesses ?? "—",
        tooltip: "Total registered businesses.",
        icon: Store,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/30",
      },
      {
        label: "Suspended",
        value: as?.suspended ?? bs?.churnedCount ?? "—",
        tooltip: "Count of suspended businesses.",
        icon: Users,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/30",
      },
    ];
  }, [adminStats, bizStats]);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, planFilter, statusFilter]);

  // Paginate data
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Close panel on escape key
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedBusiness(null);
    };
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium">
        Failed to load client businesses roster. Please verify that the NestJS backend API is online.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Subscription & Business Tracker
            <InfoTooltip content="Track all your individual subscriptions and enterprise business clients here." />
          </h1>
          <p className="text-zinc-500">
            Monitor active subscriptions, analyze churn, and manage individual
            business health.
          </p>
        </div>
        <button
          onClick={() => exportToCSV(filteredBusinesses, "businesses_data")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all"
          >
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-500 flex items-center">
                {stat.label}
                <InfoTooltip content={stat.tooltip} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE & CONTROLS */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="relative w-full xl:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business, owner, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer w-full"
              >
                <option value="All">All Plans</option>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer w-full"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Churned">Churned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Business</th>
                <th className="px-6 py-4 font-medium">Current Plan</th>
                <th className="px-6 py-4 font-medium text-right">MRR</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">
                  Renewal Date
                </th>
                <th className="px-6 py-4 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedBusinesses.map((business: any) => (
                <tr
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {business.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {business.owner} • {business.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border
                      ${
                        business.plan === "Free"
                          ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                          : business.plan === "Pro"
                            ? "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50"
                            : business.plan === "Silver"
                              ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                              : business.plan === "Gold"
                                ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50"
                                : business.plan === "Platinum"
                                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50"
                                  : "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50"
                      }`}
                    >
                      {business.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNaira(business.mrr)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        business.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : business.status === "Trial"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {business.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-500">
                    {business.status === "Churned"
                      ? "-"
                      : new Date(business.renewalDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    <ChevronRight className="w-5 h-5 inline" />
                  </td>
                </tr>
              ))}
              {filteredBusinesses.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No businesses found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRILL-DOWN SIDE PANEL OVERLAY */}
      {selectedBusiness && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
            onClick={() => setSelectedBusiness(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  {selectedBusiness.name}
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                      ${
                        selectedBusiness.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : selectedBusiness.status === "Trial"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                  >
                    {selectedBusiness.status}
                  </span>
                  <span className="text-zinc-500">{selectedBusiness.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Profile Details */}
              <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500">Owner</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {selectedBusiness.owner}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500">Acquired By</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {selectedBusiness.agentId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Current Plan</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-500">
                    {selectedBusiness.plan} (₦
                    {selectedBusiness.mrr.toLocaleString()}/mo)
                  </span>
                </div>
              </div>

              {/* Resource Usage */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Resource Consumption
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-5 h-5 text-purple-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {selectedBusiness.smsUsed.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500">
                      SMS Credits Used
                    </span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Mail className="w-5 h-5 text-amber-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {selectedBusiness.emailUsed.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Email Credits Used
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue History Chart */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Lifetime Revenue History
                </h3>
                <div className="h-48 w-full">
                  {historyLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                  ) : revenueHistory?.transactions && revenueHistory.transactions.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueHistory.transactions.map((t) => ({
                          date: new Date(t.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
                          revenue: t.amount,
                          profit: t.profit,
                        }))}
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRev"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#3f3f46"
                          opacity={0.2}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#71717a"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#71717a"
                          fontSize={10}
                          tickFormatter={(v) => `₦${v / 1000}k`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any) => [
                            formatNaira(Number(value)),
                            "Revenue Generated",
                          ]}
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#27272a",
                            borderRadius: "8px",
                            color: "#f4f4f5",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                      No transaction history available
                    </div>
                  )}
                </div>
              </div>

              {/* Renewal Notice */}
              {selectedBusiness.status !== "Churned" && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                      Next Renewal
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Subscription renews on{" "}
                      {new Date(
                        selectedBusiness.renewalDate,
                      ).toLocaleDateString()}{" "}
                      for {formatNaira(selectedBusiness.mrr)}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
