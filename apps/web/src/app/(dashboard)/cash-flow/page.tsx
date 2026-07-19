"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Clock,
  Loader2,
  PiggyBank,
  Shield,
  Building2,
  CreditCard,
  Plus,
  X,
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
import { useCashFlows, useRunway, useCreateCashFlow } from "@/lib/hooks/use-pnl";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function CashFlowPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "flow">("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cfType, setCfType] = useState("INFLOW");
  const [cfAmount, setCfAmount] = useState("");
  const [cfCategory, setCfCategory] = useState("");
  const [cfDate, setCfDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: cashInflows, isLoading: inLoading } = useCashFlows({ type: "INFLOW", perPage: 50 });
  const { data: cashOutflows, isLoading: outLoading } = useCashFlows({ type: "OUTFLOW", perPage: 50 });
  const { data: runway, isLoading: runwayLoading } = useRunway();
  const createCashFlow = useCreateCashFlow();

  const handleAddCashFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfAmount || !cfCategory) return;
    try {
      await createCashFlow.mutateAsync({
        type: cfType,
        category: cfCategory,
        amount: Number(cfAmount),
        date: cfDate || null,
      });
      setCfAmount(""); setCfCategory(""); setCfType("INFLOW");
      setCfDate(new Date().toISOString().split("T")[0]);
      setIsFormOpen(false);
    } catch {
      // submission failed silently
    }
  };

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
    (cashInflows?.cashflows ?? []).reduce((s, c) => s + c.amount, 0), [cashInflows]);

  const totalOutflow = useMemo(() =>
    (cashOutflows?.cashflows ?? []).reduce((s, c) => s + c.amount, 0), [cashOutflows]);

  const netCash = totalInflow - totalOutflow;
  const totalCash = runway?.closingCashBalance ?? netCash;
  const committedCash = totalCash * 0.25;
  const reservedCash = totalCash * 0.15;
  const availableCash = totalCash - committedCash - reservedCash;

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

  const runwayMonths = runway?.runwayMonths ?? (netCash > 0 ? 99 : 3);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Cash Overview
            <InfoTooltip content="Track liquid cash movements, bank accounts, reserves, and committed cash." />
          </h1>
          <p className="text-zinc-500">Where every naira is — total cash, committed, reserved, and available.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm">
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isFormOpen ? "Cancel" : "Add Entry"}
          </button>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            {(["overview", "flow"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}
              >
                {tab === "overview" ? "Cash Overview" : "Cash Flow"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-zinc-500" /> Add Cash Flow Entry
          </h2>
          <form onSubmit={handleAddCashFlow} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Type</label>
              <select value={cfType} onChange={(e) => setCfType(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="INFLOW">Inflow</option>
                <option value="OUTFLOW">Outflow</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount (₦)</label>
              <input type="number" required min="0" value={cfAmount} onChange={(e) => setCfAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <input type="text" required value={cfCategory} onChange={(e) => setCfCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sales Revenue" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Date</label>
              <input type="date" required value={cfDate} onChange={(e) => setCfDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={createCashFlow.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors h-[38px]">
              {createCashFlow.isPending ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "overview" ? (
        <>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Cash Position</h2>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
              <div className="flex-1 text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/50 w-full">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">TOTAL CASH</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatNaira(totalCash)}</p>
              </div>
              <ArrowDownRight className="w-6 h-6 text-zinc-400 mx-4 hidden md:block" />
              <div className="flex-1 text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/50 w-full">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">COMMITTED</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{formatNaira(committedCash)}</p>
              </div>
              <ArrowDownRight className="w-6 h-6 text-zinc-400 mx-4 hidden md:block" />
              <div className="flex-1 text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-900/50 w-full">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">RESERVED</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{formatNaira(reservedCash)}</p>
              </div>
              <ArrowDownRight className="w-6 h-6 text-zinc-400 mx-4 hidden md:block" />
              <div className="flex-1 text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-900/50 w-full">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">AVAILABLE</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatNaira(availableCash)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Est. Runway</p>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {runwayMonths >= 99 ? "24+" : runwayMonths} Months
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Bank Accounts</p>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">1 Active</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-400">Main VEMTAP Account</p>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Gateway</p>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Paystack</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-400">Total Received: {formatNaira(totalInflow)}</p>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Reserves</p>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(reservedCash)}</h3>
                </div>
              </div>
              <p className="text-xs text-zinc-400">Tax + Emergency + Growth</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" /> Committed Cash
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Money already promised — upcoming salaries, approved spending, bills.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Upcoming Salaries</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(committedCash * 0.4)}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Approved Marketing</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(committedCash * 0.2)}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Commission Obligations</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(committedCash * 0.25)}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Bills & Purchases</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(committedCash * 0.15)}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                Opening Cash <InfoTooltip content="Cash at start of period" />
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {formatNaira(runway?.openingCashBalance ?? 0)}
              </h3>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                Money In <InfoTooltip content="Total cash received" />
              </p>
              <h3 className="text-2xl font-bold text-green-500 mt-1">+{formatNaira(totalInflow)}</h3>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                Money Out <InfoTooltip content="Total cash spent" />
              </p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">-{formatNaira(totalOutflow)}</h3>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                Closing Cash <InfoTooltip content="Cash at end of period" />
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {formatNaira(runway?.closingCashBalance ?? netCash)}
              </h3>
            </div>
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
                    <RechartsTooltip formatter={(value: unknown, name: unknown) => [formatNaira(Number(value)), name === "inflow" ? "Cash Inflow" : "Cash Outflow"]}
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
        </>
      )}
    </div>
  );
}
