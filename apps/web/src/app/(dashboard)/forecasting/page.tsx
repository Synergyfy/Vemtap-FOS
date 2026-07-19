"use client";

import { useState } from "react";
import { useBreakEven } from "@/lib/hooks/use-pnl";
import { useForecastProjection } from "@/lib/hooks/use-forecasting";
import type { ForecastProjection } from "@/lib/types";
import {
  TrendingUp,
  AlertCircle,
  Activity,
  LineChart as LineChartIcon,
  CalendarDays,
  Wallet,
  Download,
  Play,
  Loader2,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function ForecastingPage() {
  const { data: breakEven } = useBreakEven();
  const forecastMutation = useForecastProjection();

  const [period, setPeriod] = useState<number>(6);
  const [growthRate, setGrowthRate] = useState(15);
  const [churnRate, setChurnRate] = useState(5);
  const [conversionRate, setConversionRate] = useState(12);

  const [result, setResult] = useState<ForecastProjection | null>(null);

  const baseBusinesses = breakEven?.activeBusinesses ?? 0;
  const arpu = breakEven?.arpu ?? 0;
  const fixedCosts = breakEven?.monthlyFixedCosts ?? 0;
  const grossRevenue = breakEven?.grossRevenue ?? 0;
  const variableCostMargin =
    grossRevenue > 0
      ? Number((1 - (breakEven?.totalMonthlyCosts ?? grossRevenue) / grossRevenue).toFixed(2))
      : 0.6;

  const handleRunForecast = () => {
    forecastMutation.mutate(
      {
        baseBusinesses,
        arpu,
        fixedCosts,
        grossRevenue,
        variableCostMargin,
        cashBalance: 0,
        qrThriveLeadsPerMonth: 0,
        period,
        growthRate,
        churnRate,
        conversionRate,
      },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const TooltipFormatter = (value: unknown, name: unknown) => {
    if (name === "Businesses") return [Number(value).toLocaleString(), "Active Businesses"];
    const n = String(name);
    return [formatNaira(Number(value)), n.charAt(0).toUpperCase() + n.slice(1)];
  };

  const forecastData = result?.monthlyData ?? [];
  const endData = forecastData[forecastData.length - 1];
  const initialMrr = baseBusinesses * arpu;
  const mrrGrowth = endData ? ((endData.mrr - initialMrr) / initialMrr) * 100 : 0;
  const isDeclining = result?.summary.isDeclining ?? churnRate > growthRate;

  const totalProjectedRevenue = forecastData.reduce((acc, curr) => acc + curr.mrr, 0);
  const totalProjectedExpenses = forecastData.reduce((acc, curr) => acc + curr.outflow, 0);
  const totalProjectedProfit = forecastData.reduce((acc, curr) => acc + curr.profit, 0);
  const finalCash = endData?.cashBalance ?? 0;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Forecast Overview
            <InfoTooltip content="Project future revenue, expenses, cash, and profit." />
          </h1>
          <p className="text-zinc-500">What we expect — revenue, expenses, cash, and profit forecasts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRunForecast} disabled={forecastMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {forecastMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Computing...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Forecast</>
            )}
          </button>
          {forecastData.length > 0 && (
            <button onClick={() => exportToCSV(forecastData as unknown as Record<string, unknown>[], "forecasting_data")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Forecast Revenue
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalProjectedRevenue)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Over {period} months</p>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Forecast Expenses
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalProjectedExpenses)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Over {period} months</p>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Forecast Profit
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalProjectedProfit)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Over {period} months</p>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-purple-500" /> Forecast Closing Cash
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(finalCash)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Month {period}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Variables
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Forecast Period</label>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{period} Months</span>
              </div>
              <input type="range" className="w-full accent-zinc-500" min="1" max="36" step="1" value={period}
                onChange={(e) => setPeriod(Number(e.target.value))} />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1"><span>1 mo</span><span>36 mo</span></div>
            </div>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Growth Rate</label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{growthRate}%</span>
              </div>
              <input type="range" className="w-full accent-blue-500" min="0" max="50" value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Churn Rate</label>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{churnRate}%</span>
              </div>
              <input type="range" className="w-full accent-red-500" min="0" max="30" value={churnRate}
                onChange={(e) => setChurnRate(Number(e.target.value))} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Conversion Rate</label>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{conversionRate}%</span>
              </div>
              <input type="range" className="w-full accent-green-500" min="0" max="100" value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Projected MRR (Month {period})
            </h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {endData ? formatNaira(endData.mrr) : "₦0"}
            </div>
            <div className={`text-sm font-medium ${mrrGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              {mrrGrowth >= 0 ? "+" : ""}{mrrGrowth.toFixed(1)}% vs current
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Total Projected Profit
            </h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{formatNaira(totalProjectedProfit)}</div>
            <div className="text-sm text-zinc-500">Cumulative over {period} months</div>
          </div>

          <div className={`md:col-span-2 rounded-xl border shadow-sm p-5 flex items-start gap-4 ${
            isDeclining
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50"
          }`}>
            <AlertCircle className={`w-6 h-6 shrink-0 mt-0.5 ${isDeclining ? "text-red-600" : "text-green-600"}`} />
            <div>
              <h3 className={`font-semibold ${isDeclining ? "text-red-900 dark:text-red-400" : "text-green-900 dark:text-green-400"}`}>
                {isDeclining ? "High Risk: Revenue Decline Projected" : "Healthy Trajectory Projected"}
              </h3>
              <p className={`text-sm mt-1 ${isDeclining ? "text-red-800 dark:text-red-300" : "text-green-800 dark:text-green-300"}`}>
                {isDeclining
                  ? "Churn rate is outpacing growth. Focus on retention immediately."
                  : "Growth strategy is outpacing churn. Revenue will compound positively."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {forecastData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-500" /> Revenue Forecast
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={TooltipFormatter}
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="mrr" name="MRR" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                  <Line yAxisId="right" type="monotone" dataKey="businesses" name="Businesses" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" /> Profit Forecast
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={TooltipFormatter}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                    <Legend />
                    <Bar dataKey="profit" name="Net Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" /> Cash Forecast
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={TooltipFormatter}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                    <Legend />
                    <Line type="monotone" dataKey="inflow" name="Inflows" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="outflow" name="Outflows" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cashBalance" name="Net Cash" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
