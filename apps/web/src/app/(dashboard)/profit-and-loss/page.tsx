"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  Download,
  Loader2,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePnlStatement, usePnlRevenueTrends } from "@/lib/hooks/use-pnl";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function ProfitAndLossPage() {
  const { data: statement, isLoading } = usePnlStatement();
  const { data: trends } = usePnlRevenueTrends();

  const chartData = useMemo(() => {
    if (!trends) return [];
    return trends.map((t) => ({
      month: new Date(t.date).toLocaleString("default", { month: "short" }),
      revenue: t.revenue,
      expenses: t.revenue - t.profit,
      profit: t.profit,
      margin: t.revenue > 0 ? Number(((t.profit / t.revenue) * 100).toFixed(1)) : 0,
    }));
  }, [trends]);

  const pnlRows = useMemo(() => {
    if (!statement) return [];
    return [
      { category: "Gross Revenue", type: "header" as const, amount: 0 },
      { category: "Subscription Revenue", type: "item" as const, amount: statement.grossRevenue * 0.7 },
      { category: "SMS & Email Revenue", type: "item" as const, amount: statement.grossRevenue * 0.3 },
      { category: "Total Gross Revenue", type: "summary" as const, amount: statement.grossRevenue },
      { category: "Cost of Goods Sold (COGS)", type: "header" as const, amount: 0 },
      { category: "Gateway & API Costs", type: "item" as const, amount: -statement.gatewayCost },
      { category: "Total COGS", type: "summary" as const, amount: -statement.gatewayCost },
      { category: "Gross Profit", type: "total" as const, amount: statement.grossRevenue - statement.gatewayCost },
      { category: "Operating Expenses (OPEX)", type: "header" as const, amount: 0 },
      { category: "Agent Commissions", type: "item" as const, amount: -statement.commissionPaid },
      { category: "Other Operating Costs", type: "item" as const, amount: -statement.opexPaid },
      { category: "Total OPEX", type: "summary" as const, amount: -(statement.commissionPaid + statement.opexPaid) },
      { category: "Net Profit", type: "total_final" as const, amount: statement.netProfit },
    ];
  }, [statement]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!statement) {
    return <div className="p-6 bg-red-50...">Failed to load P&L data.</div>;
  }

  const lastMonth = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  const summaryStats = [
    {
      label: "Gross Revenue",
      value: formatNaira(statement.grossRevenue),
      tooltip: "Total incoming revenue before any deductions.",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      label: "Total Expenses",
      value: formatNaira(statement.gatewayCost + statement.commissionPaid + statement.opexPaid),
      tooltip: "Sum of all OPEX and COGS.",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/30",
    },
    {
      label: "Net Profit",
      value: formatNaira(statement.netProfit),
      tooltip: "Total profit remaining after all expenses.",
      icon: Wallet,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Net Profit Margin",
      value: `${statement.profitMarginPercentage}%`,
      tooltip: "Percentage of revenue that remains as profit.",
      icon: Percent,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Profit & Loss Statement
            <InfoTooltip content="A comprehensive breakdown of your business's financial health." />
          </h1>
          <p className="text-zinc-500">Track company profitability, margins, and operational efficiency.</p>
        </div>
        <button onClick={() => exportToCSV(pnlRows, "pnl_statement")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" /> Export P&L
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                {stat.label}
                <InfoTooltip content={stat.tooltip} />
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue vs Expenses & Margin Trend
          <InfoTooltip content="Historical overview of total revenue, expenses, and net margin percentage." />
        </h2>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v / 1000000}M`} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip formatter={(value: any, name: any) => [name === "margin" ? `${value}%` : formatNaira(Number(value)), name]}
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar yAxisId="left" dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Line yAxisId="right" type="monotone" dataKey="margin" name="Net Margin (%)" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">No trend data available yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Detailed P&L Statement</h2>
          <InfoTooltip content="Line-by-line breakdown of all income and expenses." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr><th className="px-6 py-4 font-medium">Category</th><th className="px-6 py-4 font-medium text-right">Amount (₦)</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {pnlRows.map((row, idx) => {
                if (row.type === "header") {
                  return (
                    <tr key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <td colSpan={2} className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider text-xs">{row.category}</td>
                    </tr>
                  );
                }
                if (row.type === "summary") {
                  return (
                    <tr key={idx} className="bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-300 dark:border-zinc-700">
                      <td className="px-6 py-3 font-medium text-zinc-700 dark:text-zinc-300 pl-10">{row.category}</td>
                      <td className={`px-6 py-3 text-right font-semibold ${row.amount >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-red-600 dark:text-red-400"}`}>
                        {row.amount < 0 ? `(${formatNaira(Math.abs(row.amount))})` : formatNaira(row.amount)}
                      </td>
                    </tr>
                  );
                }
                if (row.type === "total") {
                  return (
                    <tr key={idx} className="bg-blue-50/50 dark:bg-blue-900/10 border-t-2 border-blue-200 dark:border-blue-800">
                      <td className="px-6 py-4 font-bold text-blue-900 dark:text-blue-100">{row.category}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-900 dark:text-blue-100">{formatNaira(row.amount)}</td>
                    </tr>
                  );
                }
                if (row.type === "total_final") {
                  return (
                    <tr key={idx} className="bg-green-50 dark:bg-green-900/20 border-y-2 border-green-200 dark:border-green-800">
                      <td className="px-6 py-5 font-bold text-green-900 dark:text-green-100 text-base">{row.category}</td>
                      <td className="px-6 py-5 text-right font-bold text-green-900 dark:text-green-100 text-base">{formatNaira(row.amount)}</td>
                    </tr>
                  );
                }
                return (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400 pl-10">{row.category}</td>
                    <td className={`px-6 py-3 text-right ${row.amount >= 0 ? "text-zinc-700 dark:text-zinc-300" : "text-red-500 dark:text-red-400"}`}>
                      {row.amount < 0 ? `(${formatNaira(Math.abs(row.amount))})` : formatNaira(row.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
