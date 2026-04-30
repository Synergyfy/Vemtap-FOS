"use client";

import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Wallet,
  Download,
  Calendar
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- MOCK DATA ---
const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map(month => {
    const revenue = Math.floor(Math.random() * 5000000 + 10000000); // 10M-15M
    const cogs = Math.floor(revenue * 0.15); // COGS 15%
    const opex = Math.floor(Math.random() * 2000000 + 3000000); // 3M-5M
    const expenses = cogs + opex;
    const profit = revenue - expenses;
    const margin = (profit / revenue) * 100;
    
    return {
      month,
      revenue,
      expenses,
      profit,
      margin: Number(margin.toFixed(1))
    };
  });
};

const chartData = generateMonthlyData();

const pnlStatement = [
  { category: "Gross Revenue", type: "header", amount: 0 },
  { category: "Subscription Revenue", type: "item", amount: 8500000 },
  { category: "SMS Revenue", type: "item", amount: 3200000 },
  { category: "Email Revenue", type: "item", amount: 1500000 },
  { category: "QRThrive Revenue", type: "item", amount: 2800000 },
  { category: "Total Gross Revenue", type: "summary", amount: 16000000 },
  
  { category: "Cost of Goods Sold (COGS)", type: "header", amount: 0 },
  { category: "SMS API Costs", type: "item", amount: -1200000 },
  { category: "Email API Costs", type: "item", amount: -500000 },
  { category: "Payment Gateway Fees", type: "item", amount: -240000 },
  { category: "Total COGS", type: "summary", amount: -1940000 },
  
  { category: "Gross Profit", type: "total", amount: 14060000 },

  { category: "Operating Expenses (OPEX)", type: "header", amount: 0 },
  { category: "Agent Commissions", type: "item", amount: -2400000 },
  { category: "Manager Commissions", type: "item", amount: -800000 },
  { category: "Server & Hosting", type: "item", amount: -450000 },
  { category: "Marketing & Ads", type: "item", amount: -1200000 },
  { category: "Salaries & Payroll", type: "item", amount: -3500000 },
  { category: "Total OPEX", type: "summary", amount: -8350000 },

  { category: "Net Profit", type: "total_final", amount: 5710000 },
];

export default function ProfitAndLossPage() {
  
  const { summaryStats } = useMemo(() => {
    // Current month is the last one in the mock array
    const currentMonth = chartData[chartData.length - 1];

    const stats = [
      { label: "Gross Revenue (MTD)", value: formatNaira(currentMonth.revenue), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "Total Expenses (MTD)", value: formatNaira(currentMonth.expenses), icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
      { label: "Net Profit (MTD)", value: formatNaira(currentMonth.profit), icon: Wallet, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Net Profit Margin", value: `${currentMonth.margin}%`, icon: Percent, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
    ];

    return { summaryStats: stats };
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Profit & Loss Statement</h1>
          <p className="text-zinc-500">Track company profitability, margins, and operational efficiency.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-4 h-4" /> This Month
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" /> Export P&L
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* P&L CHART */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue vs Expenses & Margin Trend
        </h2>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v/1000000}M`} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RechartsTooltip 
                formatter={(value: any, name: any) => [name === "margin" ? `${value}%` : formatNaira(Number(value)), name === "revenue" ? "Revenue" : name === "expenses" ? "Expenses" : "Net Margin"]}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar yAxisId="left" dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Line yAxisId="right" type="monotone" dataKey="margin" name="Net Margin (%)" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P&L TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Detailed P&L Statement (MTD)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {pnlStatement.map((row, idx) => {
                if (row.type === "header") {
                  return (
                    <tr key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <td colSpan={2} className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider text-xs">
                        {row.category}
                      </td>
                    </tr>
                  );
                }
                
                if (row.type === "summary") {
                  return (
                    <tr key={idx} className="bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-300 dark:border-zinc-700">
                      <td className="px-6 py-3 font-medium text-zinc-700 dark:text-zinc-300 pl-10">
                        {row.category}
                      </td>
                      <td className={`px-6 py-3 text-right font-semibold ${row.amount >= 0 ? 'text-zinc-900 dark:text-zinc-50' : 'text-red-600 dark:text-red-400'}`}>
                        {row.amount < 0 ? `(${formatNaira(Math.abs(row.amount))})` : formatNaira(row.amount)}
                      </td>
                    </tr>
                  );
                }

                if (row.type === "total") {
                  return (
                    <tr key={idx} className="bg-blue-50/50 dark:bg-blue-900/10 border-t-2 border-blue-200 dark:border-blue-800">
                      <td className="px-6 py-4 font-bold text-blue-900 dark:text-blue-100">
                        {row.category}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-900 dark:text-blue-100">
                        {formatNaira(row.amount)}
                      </td>
                    </tr>
                  );
                }

                if (row.type === "total_final") {
                  return (
                    <tr key={idx} className="bg-green-50 dark:bg-green-900/20 border-y-2 border-green-200 dark:border-green-800">
                      <td className="px-6 py-5 font-bold text-green-900 dark:text-green-100 text-base">
                        {row.category}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-green-900 dark:text-green-100 text-base">
                        {formatNaira(row.amount)}
                      </td>
                    </tr>
                  );
                }

                // Normal items
                return (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400 pl-10">
                      {row.category}
                    </td>
                    <td className={`px-6 py-3 text-right ${row.amount >= 0 ? 'text-zinc-700 dark:text-zinc-300' : 'text-red-500 dark:text-red-400'}`}>
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
