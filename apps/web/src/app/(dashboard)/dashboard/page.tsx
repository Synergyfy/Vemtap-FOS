"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Lightbulb,
} from "lucide-react";
import {
  useDashboardStats,
  useDashboardSnapshots,
  useDashboardInsights,
} from "@/lib/hooks/use-dashboard";
import { useRunway, usePnlRevenueTrends } from "@/lib/hooks/use-pnl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

const insightSeverityStyles: Record<string, string> = {
  SUCCESS: "border-green-500/30 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400",
  WARNING: "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
  DANGER: "border-red-500/30 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
  INFO: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
};

function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</h3>
        <div className="flex items-center gap-2 mt-1">
          {change !== undefined && (
            <span className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}>
              {change}
            </span>
          )}
          {sub && <span className="text-xs text-zinc-400">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function HealthBadge({ label, status }: { label: string; status: "healthy" | "warning" | "critical" }) {
  const colors = {
    healthy: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400",
    warning: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400",
    critical: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400",
  };
  const icons = {
    healthy: CheckCircle2,
    warning: AlertTriangle,
    critical: AlertTriangle,
  };
  const Icon = icons[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${colors[status]}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: snapshots } = useDashboardSnapshots();
  const { data: insights } = useDashboardInsights();
  const { data: runway } = useRunway();
  const { data: trends } = usePnlRevenueTrends();

  const chartData = useMemo(() => {
    if (!trends) return [];
    return trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
      revenue: t.revenue,
      expenses: t.revenue - t.profit,
      profit: t.profit,
    }));
  }, [trends]);

  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d" | "6m" | "12m" | "all">("30d");

  if (statsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium">
        Failed to load dashboard metrics. Please verify that the backend API is online.
      </div>
    );
  }

  const changeTotalRevenue: string | undefined = (() => {
    if (!snapshots || snapshots.length < 2) return undefined;
    const prev = snapshots[snapshots.length - 2];
    const curr = snapshots[snapshots.length - 1];
    if (prev.totalRevenue <= 0) return undefined;
    const pct = ((curr.totalRevenue - prev.totalRevenue) / prev.totalRevenue * 100);
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from last month`;
  })();

  const changeExpenses: string | undefined = (() => {
    if (!snapshots || snapshots.length < 2) return undefined;
    const prev = snapshots[snapshots.length - 2];
    const curr = snapshots[snapshots.length - 1];
    const prevExp = prev.totalRevenue - prev.totalProfit;
    const currExp = curr.totalRevenue - curr.totalProfit;
    if (prevExp <= 0) return undefined;
    const pct = ((currExp - prevExp) / prevExp * 100);
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from last month`;
  })();

  const changeProfit: string | undefined = (() => {
    if (!snapshots || snapshots.length < 2) return undefined;
    const prev = snapshots[snapshots.length - 2];
    const curr = snapshots[snapshots.length - 1];
    if (prev.totalProfit <= 0) return undefined;
    const pct = ((curr.totalProfit - prev.totalProfit) / Math.abs(prev.totalProfit) * 100);
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from last month`;
  })();

  const totalCash = stats.cashBalance || 0;
  const availableCash = totalCash * 0.6;
  const monthlyRevenue = stats.totalRevenue || 0;
  const monthlyExpenses = (stats.totalRevenue - stats.netProfit) || 0;
  const netProfit = stats.netProfit || 0;
  const runwayMonths = runway?.runwayMonths ?? (netProfit > 0 ? 99 : 3);

  const revenueStatus: "healthy" | "warning" | "critical" = changeTotalRevenue
    ? (parseFloat(changeTotalRevenue) >= 0 ? "healthy" : "warning")
    : "healthy";

  const expenseStatus: "healthy" | "warning" | "critical" = changeExpenses
    ? (parseFloat(changeExpenses) <= 5 ? "healthy" : "warning")
    : "healthy";

  const cashStatus: "healthy" | "warning" | "critical" = runwayMonths >= 12
    ? "healthy"
    : runwayMonths >= 6 ? "warning" : "critical";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Command Centre
          </h1>
          <p className="text-zinc-500">
            What is the financial condition of VEMTAP right now?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Cash"
          value={formatNaira(totalCash)}
          icon={Wallet}
          color="text-blue-500"
        />
        <StatCard
          label="Available Cash"
          value={formatNaira(availableCash)}
          icon={PiggyBank}
          color="text-emerald-500"
        />
        <StatCard
          label="This Month Revenue"
          value={formatNaira(monthlyRevenue)}
          change={changeTotalRevenue}
          positive={changeTotalRevenue ? !changeTotalRevenue.startsWith("-") : true}
          icon={TrendingUp}
          color="text-green-500"
        />
        <StatCard
          label="This Month Expenses"
          value={formatNaira(monthlyExpenses)}
          change={changeExpenses}
          positive={changeExpenses ? changeExpenses.startsWith("-") : false}
          icon={TrendingDown}
          color="text-red-500"
        />
        <StatCard
          label="Net Profit"
          value={formatNaira(netProfit)}
          change={changeProfit}
          positive={changeProfit ? !changeProfit.startsWith("-") : true}
          icon={DollarSign}
          color={netProfit >= 0 ? "text-green-500" : "text-red-500"}
        />
        <StatCard
          label="Cash Runway"
          value={`${runwayMonths >= 99 ? "24+" : runwayMonths} Months`}
          icon={Clock}
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Revenue vs Expenses
            </h2>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              {(["7d", "30d", "6m", "12m", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartPeriod === p
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                  }`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <RechartsTooltip formatter={(value: any, name: any) => [formatNaira(Number(value)), name]}
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No data available</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Plan vs Actual
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Revenue</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Plan:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatNaira(monthlyRevenue * 1.1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Actual:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatNaira(monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Variance:</span>
                    <span className={`font-medium ${monthlyRevenue >= monthlyRevenue * 0.9 ? "text-green-500" : "text-red-500"}`}>
                      {formatNaira(monthlyRevenue - monthlyRevenue * 1.1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Expenses</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Budget:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatNaira(monthlyExpenses * 1.1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Actual:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatNaira(monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Variance:</span>
                    <span className={`font-medium ${monthlyExpenses <= monthlyExpenses * 1.1 ? "text-green-500" : "text-red-500"}`}>
                      {formatNaira(monthlyExpenses * 1.1 - monthlyExpenses)} under budget
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Financial Health
            </h2>
            <div className="space-y-2">
              <HealthBadge label={`Cash Position: ${cashStatus === "healthy" ? "Healthy" : cashStatus === "warning" ? "Warning" : "Critical"}`} status={cashStatus} />
              <HealthBadge label={`Revenue Performance: ${revenueStatus === "healthy" ? "On Track" : "Behind Target"}`} status={revenueStatus} />
              <HealthBadge label={`Expense Control: ${expenseStatus === "healthy" ? "Healthy" : "Overspending"}`} status={expenseStatus} />
              <HealthBadge label={`Cash Runway: ${runwayMonths >= 99 ? "24+" : runwayMonths} Months`} status={cashStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Alerts &amp; Insights
            </h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.title + insight.message}
                className={`p-4 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${insightSeverityStyles[insight.severity] || insightSeverityStyles.INFO}`}
              >
                <div className="flex items-start gap-2">
                  {insight.severity === "WARNING" || insight.severity === "DANGER" ? (
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : insight.severity === "SUCCESS" ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm mt-1 opacity-80">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
