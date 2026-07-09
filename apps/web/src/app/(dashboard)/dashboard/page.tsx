"use client";

import {
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  Wallet,
  Activity,
  QrCode,
  Award,
  Building2,
  PiggyBank,
  Loader2,
  Lightbulb,
} from "lucide-react";
import {
  useDashboardStats,
  useDashboardSnapshots,
  useDashboardInsights,
} from "@/lib/hooks/use-dashboard";

const formatNaira = (value: number) => {
  return `₦${Math.round(value).toLocaleString()}`;
};

const insightSeverityStyles: Record<string, string> = {
  SUCCESS: "border-green-500/30 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400",
  WARNING: "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
  DANGER: "border-red-500/30 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
  INFO: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
};

function StatCard({ stat }: { stat: { label: string; value: string; change?: string; icon: React.ComponentType<{ className?: string }>; color: string; positive?: boolean; sub?: string } }) {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <stat.icon className={stat.color} />
        {stat.change !== undefined && (
          <span
            className={`text-xs font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}
          >
            {stat.change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stat.value}
        </h3>
        {stat.sub && <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: snapshots } = useDashboardSnapshots();
  const { data: insights } = useDashboardInsights();

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
        Failed to load dashboard metrics. Please verify that the NestJS backend API is online.
      </div>
    );
  }

  // Compute change % from snapshots (compare latest two)
  let changeTotalRevenue: string | undefined;
  let changeBusinesses: string | undefined;
  let changeProfit: string | undefined;

  if (snapshots && snapshots.length >= 2) {
    const prev = snapshots[snapshots.length - 2];
    const curr = snapshots[snapshots.length - 1];
    const pct = (a: number, b: number) =>
      b > 0 ? `${((a - b) / b * 100).toFixed(1)}%` : undefined;
    changeTotalRevenue = pct(curr.totalRevenue, prev.totalRevenue);
    changeBusinesses = pct(curr.totalBusinesses, prev.totalBusinesses);
    changeProfit = pct(curr.totalProfit, prev.totalProfit);
  }

  // Extract best agent from insights
  let bestAgentName = "";
  let bestAgentSub = "";

  if (insights) {
    const highPerf = insights.find((i) => i.type === "HIGH_PERFORMANCE");
    if (highPerf) {
      bestAgentName = highPerf.title.replace("Top CRM Agent Identified", "").trim();
      bestAgentSub = highPerf.message;
    }
  }

  const row1Stats = [
    {
      label: "Total Revenue",
      value: formatNaira(stats.totalRevenue),
      change: changeTotalRevenue,
      icon: DollarSign,
      color: "text-blue-500",
      positive: changeTotalRevenue ? changeTotalRevenue.startsWith("+") : true,
    },
    {
      label: "Total Active Businesses",
      value: stats.totalBusinesses.toLocaleString(),
      change: changeBusinesses,
      icon: Building2,
      color: "text-indigo-500",
      positive: changeBusinesses ? changeBusinesses.startsWith("+") : true,
    },
    {
      label: "Net Profit",
      value: formatNaira(stats.netProfit),
      change: changeProfit,
      icon: TrendingUp,
      color: "text-green-500",
      positive: changeProfit ? changeProfit.startsWith("+") : true,
    },
    {
      label: "SMS Sent Count",
      value: stats.smsSent.toLocaleString(),
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      label: "Active Agents CRM",
      value: stats.activeAgents.toLocaleString(),
      icon: Users,
      color: "text-amber-500",
    },
  ];

  const row2Stats = [
    {
      label: "Vemtap Platform Revenue",
      value: formatNaira(stats.vemtapRevenue),
      icon: Activity,
      color: "text-blue-400",
    },
    {
      label: "QRThrive Revenue Share",
      value: formatNaira(stats.qrthriveRevenue),
      icon: QrCode,
      color: "text-indigo-400",
    },
    {
      label: "Total Commissions Generated",
      value: formatNaira(stats.commissionsPaid),
      icon: Wallet,
      color: "text-orange-500",
    },
    {
      label: "Estimated Cash Reserve Balance",
      value: formatNaira(stats.cashBalance),
      icon: PiggyBank,
      color: "text-emerald-500",
    },
  ];

  const row3Stats = [
    {
      label: "Best Performing Agent",
      value: bestAgentName,
      sub: bestAgentSub,
      icon: Award,
      color: "text-amber-500",
    },
    {
      label: "Conversion Rate (QRThrive → Vemtap)",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Churn Rate",
      value: `${stats.churnRate}%`,
      icon: Users,
      color: stats.churnRate > 10 ? "text-red-500" : "text-zinc-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-zinc-500">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {row1Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row2Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row3Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Insights Panel */}
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
                  className={`p-4 rounded-lg border ${insightSeverityStyles[insight.severity] || insightSeverityStyles.INFO}`}
                >
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-sm mt-1 opacity-80">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
