"use client";

import { useState, useMemo } from "react";
import {
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Wallet,
  CreditCard,
  ListOrdered,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRevenueTransactions, useRevenueTrends, useRevenueAggregates, useRevenueChartData } from "@/lib/hooks/use-revenue";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const PAGE_SIZE = 10;

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-300 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {formatNaira(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Compute date filter params for API
  const dateParams = useMemo(() => {
    if (dateRange === "30days") {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return { startDate: d.toISOString() };
    }
    if (dateRange === "90days") {
      const d = new Date(); d.setDate(d.getDate() - 90);
      return { startDate: d.toISOString() };
    }
    return {};
  }, [dateRange]);

  const platform = platformFilter !== "All" ? platformFilter.toUpperCase() : undefined;
  const type = typeFilter !== "All" ? typeFilter.toUpperCase() : undefined;

  const { data: txData, isLoading: txLoading } = useRevenueTransactions({
    page: currentPage,
    perPage: PAGE_SIZE,
    platform,
    type,
    ...dateParams,
  });

  const { data: trends, isLoading: trendsLoading } = useRevenueTrends();
  const { data: aggregates, isLoading: aggLoading } = useRevenueAggregates();
  const { data: chartData, isLoading: chartLoading } = useRevenueChartData({
    platform,
    type,
    ...dateParams,
  });

  const transactions = txData?.transactions ?? [];
  const totalRecords = txData?.total ?? 0;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  const monthlyData = chartData?.monthlyPlatformRevenue ?? [];
  const planData = chartData?.revenueByType ?? [];

  const aggCards = useMemo(() => {
    const a = aggregates;
    return [
      { label: "Total Revenue", value: a ? formatNaira(a.totalRevenue) : "—", icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Subscription Revenue", value: a ? formatNaira(a.subscriptionRevenue) : "—", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "SMS Revenue", value: a ? formatNaira(a.smsRevenue) : "—", icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
      { label: "Total Profit", value: a ? formatNaira(a.totalProfit) : "—", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
      { label: "Agent Payouts", value: a ? formatNaira(a.agentPayouts) : "—", icon: Wallet, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
      { label: "Total Transactions", value: a?.totalTransactions ?? "—", icon: ListOrdered, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
    ];
  }, [aggregates]);

  // Use trends API for the line chart
  const trendChartData = useMemo(() => {
    if (!trends) return [];
    return trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
      revenue: t.revenue,
      profit: t.profit,
    }));
  }, [trends]);

  const isLoading = txLoading || trendsLoading || chartLoading;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Revenue Analytics
            <InfoTooltip content="Analyze where your revenue is coming from across platforms and products." />
          </h1>
          <p className="text-zinc-500">Deep dive into revenue streams across platforms and plans.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer">
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <select value={platformFilter} onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer">
              <option value="All">All Platforms</option>
              <option value="VEMTAP">Vemtap</option>
              <option value="QRTHRIVE">QRThrive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer">
              <option value="All">All Types</option>
              <option value="SUBSCRIPTION">Subscriptions</option>
              <option value="SMS">SMS Revenue</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!aggLoading && aggregates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {aggCards.map((card) => (
            <div key={card.label} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3 transition-all">
              <div className={`p-2.5 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">{card.label}</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-500" /> Revenue Growth
              <InfoTooltip content="Daily revenue and profit trend." />
            </h2>
            {trendChartData.length > 0 && (
              <button onClick={() => exportToCSV(trendChartData, "revenue_trends")}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" title="Export Chart Data">
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="h-72 w-full">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No data available</div>
            )}
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Vemtap vs QRThrive
            <InfoTooltip content="Compare revenue generated by your two main platforms." />
          </h2>
          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Bar dataKey="vemtap" name="Vemtap" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qrthrive" name="QRThrive" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No data</div>
            )}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-500" /> Revenue by Type
            <InfoTooltip content="See which revenue types contribute the most to your bottom line." />
          </h2>
          <div className="h-64 w-full flex items-center justify-center">
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {planData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatNaira(Number(value))} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-500">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* REVENUE TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
            Transaction History
            <InfoTooltip content="A detailed log of all transactions from the API." />
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{totalRecords} records</span>
            <button onClick={() => exportToCSV(transactions, "transactions_history")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Revenue Type</th>
                <th className="px-6 py-4 font-medium">Business</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                    {new Date(trx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-50">
                    {trx.referenceId || trx.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trx.type === "SUBSCRIPTION"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : trx.type === "ENTERPRISE"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : trx.type === "SMS"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {trx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                    {trx.businessName || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNaira(trx.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
