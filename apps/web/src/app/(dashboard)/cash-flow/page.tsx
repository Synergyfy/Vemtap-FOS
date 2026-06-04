"use client";

import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Clock,
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
  Legend,
} from "recharts";
import { useCashFlows, useRunway } from "@/lib/hooks/use-pnl";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function CashFlowPage() {
  const { data: cashInflows, isLoading: inLoading } = useCashFlows({ type: "INFLOW", perPage: 50 });
  const { data: cashOutflows, isLoading: outLoading } = useCashFlows({ type: "OUTFLOW", perPage: 50 });
  const { data: runway, isLoading: runwayLoading } = useRunway();

  const chartData = useMemo(() => {
    const dateMap = new Map<string, { date: string; inflow: number; outflow: number }>();

    (cashInflows?.cashflows ?? []).forEach((c) => {
      const key = new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dateMap.has(key)) dateMap.set(key, { date: key, inflow: 0, outflow: 0 });
      dateMap.get(key)!.inflow += c.amount;
    });

    (cashOutflows?.cashflows ?? []).forEach((c) => {
      const key = new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dateMap.has(key)) dateMap.set(key, { date: key, inflow: 0, outflow: 0 });
      dateMap.get(key)!.outflow += c.amount;
    });

    return Array.from(dateMap.values()).sort((a, b) => {
      const [aM, aD] = a.date.split(" ");
      const [bM, bD] = b.date.split(" ");
      return new Date(`${aM} ${aD}, 2026`).getTime() - new Date(`${bM} ${bD}, 2026`).getTime();
    });
  }, [cashInflows, cashOutflows]);

  const totalInflow = useMemo(() =>
    (cashInflows?.cashflows ?? []).reduce((s, c) => s + c.amount, 0),
    [cashInflows]);

  const totalOutflow = useMemo(() =>
    (cashOutflows?.cashflows ?? []).reduce((s, c) => s + c.amount, 0),
    [cashOutflows]);

  const netCash = totalInflow - totalOutflow;

  const allLedger = useMemo(() => {
    const items = [
      ...(cashInflows?.cashflows ?? []).map((c) => ({ ...c, type: "Inflow" as const })),
      ...(cashOutflows?.cashflows ?? []).map((c) => ({ ...c, type: "Outflow" as const })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashInflows, cashOutflows]);

  const isLoading = inLoading || outLoading || runwayLoading;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const summaryStats = [
    {
      label: "Total Cash Inflow",
      value: formatNaira(totalInflow),
      tooltip: "Total cash received in the period.",
      icon: ArrowUpRight,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Total Cash Outflow",
      value: formatNaira(totalOutflow),
      tooltip: "Total cash spent in the period.",
      icon: ArrowDownRight,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/30",
    },
    {
      label: "Net Cash Position",
      value: formatNaira(netCash),
      tooltip: "Difference between inflow and outflow.",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      label: "Est. Runway",
      value: runway ? `${runway.runwayMonths >= 99 ? "24+" : runway.runwayMonths} Months` : "N/A",
      tooltip: "Estimated time before cash reserves are depleted.",
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Cash Flow Monitor
            <InfoTooltip content="Track real-time liquid cash movements and bank settlements." />
          </h1>
          <p className="text-zinc-500">Track liquid cash movements, bank settlements, and runway.</p>
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

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" /> Cash Movement Trend
          <InfoTooltip content="Visualize cash coming in vs cash going out over time." />
        </h2>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(value: any, name: any) => [formatNaira(Number(value)), name === "inflow" ? "Cash Inflow" : "Cash Outflow"]}
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                <Area type="monotone" dataKey="inflow" name="Cash Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outflow" name="Cash Outflow" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">No cash flow data available.</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
            Recent Cash Movements
            <InfoTooltip content="Chronological ledger of recent transactions affecting liquid cash." />
          </h2>
          {runway && (
            <span className="text-xs text-zinc-500">
              Opening: {formatNaira(runway.openingCashBalance)} | Closing: {formatNaira(runway.closingCashBalance)}
            </span>
          )}
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {allLedger.map((trx) => (
                <tr key={trx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{trx.category}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(trx.date).toLocaleString()} • {trx.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      trx.type === "Inflow" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {trx.type === "Inflow" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {trx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${trx.type === "Inflow" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                    {trx.type === "Inflow" ? "+" : "-"}{formatNaira(trx.amount)}
                  </td>
                </tr>
              ))}
              {allLedger.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No cash movements recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
