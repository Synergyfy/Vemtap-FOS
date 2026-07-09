"use client";

import { useMemo } from "react";
import {
  Users,
  TrendingUp,
  Award,
  DollarSign,
  ArrowRight,
  QrCode,
  Loader2,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useFunnelStats } from "@/lib/hooks/use-funnel";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const COLORS = ["#94a3b8", "#8b5cf6", "#3b82f6"];

export default function QRThriveFunnelPage() {
  const { data: snapshots, isLoading } = useFunnelStats();

  const latest = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return null;
    return snapshots[snapshots.length - 1];
  }, [snapshots]);

  const funnelData = useMemo(() => {
    if (!latest) return [];
    return [
      { name: "Total QR Scans", users: latest.qrScans, fill: COLORS[0] },
      { name: "Leads Captured", users: latest.leadsCaptured, fill: COLORS[1] },
      { name: "Converted to Vemtap", users: latest.convertedToVemtap, fill: COLORS[2] },
    ];
  }, [latest]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!latest) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-xl text-sm font-medium">
        No QRThrive funnel data available yet.
      </div>
    );
  }

  const summaryStats = [
    {
      label: "Total QR Scans",
      value: latest.qrScans.toLocaleString(),
      tooltip: "Total QR code scans recorded.",
      icon: Users,
      color: "text-slate-500",
      bg: "bg-slate-50 dark:bg-slate-900/30",
    },
    {
      label: "Leads Captured",
      value: latest.leadsCaptured.toLocaleString(),
      tooltip: "Users who engaged after scanning.",
      icon: QrCode,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
    {
      label: "Converted to Vemtap",
      value: latest.convertedToVemtap.toLocaleString(),
      tooltip: "Users who fully converted to Vemtap.",
      icon: Award,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      label: "Conversion Rate",
      value: `${latest.conversionRate}%`,
      tooltip: "Percentage of QR users who converted to Vemtap.",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
    },
  ];

  const freeToProPct = latest.leadsCaptured > 0
    ? ((latest.qrUsers / latest.leadsCaptured) * 100).toFixed(1) : "0.0";
  const proToBusinessPct = latest.qrUsers > 0
    ? ((latest.convertedToVemtap / latest.qrUsers) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
          QRThrive Funnel Tracker
          <InfoTooltip content="Track how effectively QRThrive leads convert into paying users." />
        </h1>
        <p className="text-zinc-500">
          Monitor lead generation, conversions, and funnel performance from QRThrive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label}
            className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all">
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
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Conversion Funnel
            <InfoTooltip content="Visual representation of user drop-off at each stage of the funnel." />
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={140} />
                <RechartsTooltip formatter={(value: any) => [Number(value).toLocaleString(), "Users"]}
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                <Bar dataKey="users" radius={[0, 4, 4, 0]} barSize={40}>
                  {funnelData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Leads to QR Users</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{freeToProPct}%</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">QR Users to Vemtap</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{proToBusinessPct}%</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
              Daily Snapshots
              <InfoTooltip content="Recent daily funnel data points." />
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Scans</th>
                  <th className="px-4 py-3 font-medium text-right">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(snapshots ?? []).slice(-10).reverse().map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-zinc-900 dark:text-zinc-50">
                      {s.qrScans.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-green-600 dark:text-green-500 font-medium">{s.convertedToVemtap}</span>
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
