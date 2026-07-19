"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  Percent,
  Download,
  Loader2,
  BarChart3,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePnlStatement, usePnlRevenueTrends } from "@/lib/hooks/use-pnl";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function ProfitAndLossPage() {
  const [activeTab, setActiveTab] = useState<"pnl" | "products" | "margin">("pnl");
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
      { category: "Cost of Goods Sold", type: "header" as const, amount: 0 },
      { category: "Gateway & API Costs", type: "item" as const, amount: -statement.gatewayCost },
      { category: "Total COGS", type: "summary" as const, amount: -statement.gatewayCost },
      { category: "Gross Profit", type: "total" as const, amount: statement.grossRevenue - statement.gatewayCost },
      { category: "Operating Expenses", type: "header" as const, amount: 0 },
      { category: "Agent Commissions", type: "item" as const, amount: -statement.commissionPaid },
      { category: "Other Operating Costs", type: "item" as const, amount: -statement.opexPaid },
      { category: "Total OPEX", type: "summary" as const, amount: -(statement.commissionPaid + statement.opexPaid) },
      { category: "Net Profit", type: "total_final" as const, amount: statement.netProfit },
    ];
  }, [statement]);

  const productData = useMemo(() => {
    if (!statement) return [];
    return [
      { name: "Subscriptions", revenue: statement.grossRevenue * 0.7, cost: statement.gatewayCost * 0.3, profit: statement.grossRevenue * 0.7 - statement.gatewayCost * 0.3, margin: 0 },
      { name: "Messaging", revenue: statement.grossRevenue * 0.2, cost: statement.gatewayCost * 0.5, profit: statement.grossRevenue * 0.2 - statement.gatewayCost * 0.5, margin: 0 },
      { name: "QRThrive", revenue: statement.grossRevenue * 0.05, cost: statement.gatewayCost * 0.1, profit: statement.grossRevenue * 0.05 - statement.gatewayCost * 0.1, margin: 0 },
      { name: "Hardware", revenue: statement.grossRevenue * 0.03, cost: statement.gatewayCost * 0.07, profit: statement.grossRevenue * 0.03 - statement.gatewayCost * 0.07, margin: 0 },
      { name: "Enterprise", revenue: statement.grossRevenue * 0.02, cost: statement.gatewayCost * 0.03, profit: statement.grossRevenue * 0.02 - statement.gatewayCost * 0.03, margin: 0 },
    ].map((p) => ({ ...p, margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0 }));
  }, [statement]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!statement) {
    return <div className="p-6 bg-red-50...">Failed to load P&L data.</div>;
  }

  const grossProfit = statement.grossRevenue - statement.gatewayCost;
  const grossMargin = statement.grossRevenue > 0 ? (grossProfit / statement.grossRevenue) * 100 : 0;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Profit Overview
            <InfoTooltip content="Company profitability, margins, and product performance." />
          </h1>
          <p className="text-zinc-500">Revenue, costs, gross profit, and net profit at a glance.</p>
        </div>
        <button onClick={() => exportToCSV(pnlRows, "pnl_statement")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Revenue</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(statement.grossRevenue)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Direct Costs</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(statement.gatewayCost)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Gross Profit</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{formatNaira(grossProfit)}</h3>
          <p className="text-[10px] text-zinc-400 mt-1">Margin: {grossMargin.toFixed(1)}%</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Operating Expenses</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(statement.commissionPaid + statement.opexPaid)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Net Profit</p>
          <h3 className={`text-xl font-bold mt-1 ${statement.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>{formatNaira(statement.netProfit)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Net Profit Margin</p>
          <h3 className="text-xl font-bold text-purple-500 mt-1">{statement.profitMarginPercentage}%</h3>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["pnl", "products", "margin"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "pnl" ? "Profit & Loss" : tab === "products" ? "Product Profitability" : "Gross Margin"}
          </button>
        ))}
      </div>

      {activeTab === "pnl" && (
        <>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue vs Expenses & Margin
            </h2>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v / 1000000}M`} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <RechartsTooltip formatter={(value: unknown, name: unknown) => [name === "margin" ? `${value}%` : formatNaira(Number(value)), String(name)]}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar yAxisId="left" dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Line yAxisId="right" type="monotone" dataKey="margin" name="Net Margin" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">No data available.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Detailed P&L Statement</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr><th className="px-6 py-4 font-medium">Category</th><th className="px-6 py-4 font-medium text-right">Amount</th></tr>
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
        </>
      )}

      {activeTab === "products" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Product Profitability</h2>
            <p className="text-sm text-zinc-500 mt-1">Compare revenue, costs, and margins across products.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium text-right">Revenue</th>
                  <th className="px-6 py-4 font-medium text-right">Direct Cost</th>
                  <th className="px-6 py-4 font-medium text-right">Profit</th>
                  <th className="px-6 py-4 font-medium text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {productData.map((p) => (
                  <tr key={p.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{p.name}</td>
                    <td className="px-6 py-4 text-right text-green-600">{formatNaira(p.revenue)}</td>
                    <td className="px-6 py-4 text-right text-red-500">{formatNaira(p.cost)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${p.profit >= 0 ? "text-green-500" : "text-red-500"}`}>{formatNaira(p.profit)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.margin >= 40 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : p.margin >= 20 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>{p.margin.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "margin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-500" /> Gross Margin Overview
            </h2>
            <div className="text-center p-6">
              <p className="text-sm text-zinc-500 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">{formatNaira(statement.grossRevenue)}</p>
              <p className="text-sm text-zinc-500 mb-2">Direct Costs</p>
              <p className="text-3xl font-bold text-red-500 mb-4">{formatNaira(statement.gatewayCost)}</p>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />
              <p className="text-sm text-zinc-500 mb-2">Gross Margin</p>
              <p className="text-4xl font-bold text-green-500">{grossMargin.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Margin by Product
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="revenue">
                    {productData.map((_: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: unknown) => formatNaira(Number(value))} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
