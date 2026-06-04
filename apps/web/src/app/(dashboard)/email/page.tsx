"use client";

import { useMemo } from "react";
import {
  Mail,
  TrendingUp,
  DollarSign,
  Award,
  Loader2,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useEmailLogs, useMessagingAggregates } from "@/lib/hooks/use-messaging";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function EmailTrackerPage() {
  const { data: emailData, isLoading } = useEmailLogs({ perPage: 100 });
  const { data: aggregates } = useMessagingAggregates();

  const chartData = useMemo(() => {
    if (!emailData?.logs) return [];
    const map = new Map<string, { month: string; volume: number; revenue: number }>();
    emailData.logs.forEach((log) => {
      const monthStr = new Date(log.date).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!map.has(monthStr)) {
        map.set(monthStr, { month: monthStr, volume: 0, revenue: 0 });
      }
      const entry = map.get(monthStr)!;
      entry.volume += log.emailCount;
      entry.revenue += log.totalRevenue;
    });
    return Array.from(map.values());
  }, [emailData]);

  const recentPurchases = useMemo(() => {
    if (!emailData?.logs) return [];
    return emailData.logs.slice(0, 20).map((log) => ({
      id: log.id,
      business: log.businessName || "—",
      credits: log.emailCount,
      amount: log.totalRevenue,
      date: log.date,
    }));
  }, [emailData]);

  const totalVolume = aggregates?.totalEmailsSent ?? 0;
  const totalRevenue = aggregates?.totalMessagingRevenue ?? 0;

  const topSender = useMemo(() => {
    if (!emailData?.logs) return "N/A";
    const map = new Map<string, number>();
    emailData.logs.forEach((log) => {
      const name = log.businessName || "—";
      map.set(name, (map.get(name) || 0) + log.emailCount);
    });
    let maxName = "";
    let maxVal = 0;
    map.forEach((v, k) => { if (v > maxVal) { maxVal = v; maxName = k; } });
    return maxName;
  }, [emailData]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const summaryStats = [
    {
      label: "Total Email Revenue",
      value: formatNaira(totalRevenue),
      tooltip: "Revenue generated from email credit sales.",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Total Emails Sold",
      value: totalVolume >= 1000000 ? `${(totalVolume / 1000000).toFixed(1)}M` : totalVolume.toLocaleString(),
      tooltip: "Total volume of email credits purchased.",
      icon: Mail,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      label: "Avg Cost / 10k",
      value: totalVolume > 0 ? `₦${Math.round(totalRevenue / totalVolume * 10000).toLocaleString()}` : "—",
      tooltip: "Average price charged per 10,000 email credits.",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
    {
      label: "Top Sender",
      value: topSender,
      tooltip: "The client consuming the most email credits.",
      icon: Award,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Email Revenue Tracker
            <InfoTooltip content="Track bulk email sales and consumption by your enterprise clients." />
          </h1>
          <p className="text-zinc-500">
            Monitor high-volume email campaign sales, consumption, and margins.
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Email Volume & Revenue Trends
            <InfoTooltip content="Monthly trends for email credit purchases and corresponding revenue." />
          </h2>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₦)" stroke="#10b981" strokeWidth={2} fill="url(#colorRev)" />
                  <Area yAxisId="right" type="monotone" dataKey="volume" name="Volume (Emails)" stroke="#f59e0b" strokeWidth={2} fill="url(#colorVol)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No email data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
              Recent Usage
              <InfoTooltip content="Log of recent bulk email credit purchases." />
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium text-right">Credits</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{p.business}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(p.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        +{p.credits.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-500">
                      {formatNaira(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
