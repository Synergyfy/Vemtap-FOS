"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";
import { useRevenueTransactions } from "@/lib/hooks/use-revenue";
import { useExpenses } from "@/lib/hooks/use-expenses";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

type TransactionTab = "all" | "income" | "expenses" | "transfers";

type TransferTx = { id: string; date: string; type: "Transfer"; category: string; description: string; amount: number; reference: string };

const transferTransactions: TransferTx[] = [
  { id: "XFR-001", date: "2026-07-15", type: "Transfer", category: "Internal Transfer", description: "Operating Account → Reserve", amount: 500000, reference: "XFR-2026-001" },
  { id: "XFR-002", date: "2026-07-10", type: "Transfer", category: "Internal Transfer", description: "Revenue → Operating Account", amount: 1200000, reference: "XFR-2026-002" },
  { id: "XFR-003", date: "2026-07-05", type: "Transfer", category: "Internal Transfer", description: "Reserve → Investment Account", amount: 300000, reference: "XFR-2026-003" },
];

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<TransactionTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: revenueData, isLoading: revLoading } = useRevenueTransactions({ perPage: 50 });
  const { data: expensesData, isLoading: expLoading } = useExpenses({ perPage: 50 });

  const allTransactions = useMemo(() => {
    const items: { id: string; date: string; type: "Income" | "Expense" | "Transfer"; category: string; description: string; amount: number; reference: string }[] = [];

    (revenueData?.transactions ?? []).forEach((t) => {
      items.push({
        id: t.id,
        date: t.date,
        type: "Income",
        category: t.type,
        description: t.businessName || "Revenue",
        amount: t.amount,
        reference: t.referenceId || t.id.slice(0, 8),
      });
    });

    (expensesData?.expenses ?? []).forEach((e) => {
      items.push({
        id: e.id,
        date: e.date,
        type: "Expense",
        category: e.category,
        description: e.category,
        amount: e.amount,
        reference: e.id.slice(0, 8),
      });
    });

    items.push(...transferTransactions);

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenueData, expensesData]);

  const filtered = useMemo(() => {
    let items = allTransactions;
    if (activeTab === "income") items = items.filter((t) => t.type === "Income");
    if (activeTab === "expenses") items = items.filter((t) => t.type === "Expense");
    if (activeTab === "transfers") items = items.filter((t) => t.type === "Transfer");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((t) =>
        t.reference.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allTransactions, activeTab, searchQuery]);

  const totalIncome = useMemo(() => allTransactions.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0), [allTransactions]);
  const totalExpenses = useMemo(() => allTransactions.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0), [allTransactions]);

  const isLoading = revLoading || expLoading;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-blue-500" /> All Transactions
        </h1>
        <p className="text-zinc-500">Every financial movement — revenue, expenses, transfers, refunds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Income</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{formatNaira(totalIncome)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Expenses</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(totalExpenses)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Net</p>
          <h3 className={`text-xl font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? "text-green-500" : "text-red-500"}`}>{formatNaira(totalIncome - totalExpenses)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Transactions</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{allTransactions.length}</h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {(["all", "income", "expenses", "transfers"] as const).map((tab) => {
            const icons = { all: ArrowLeftRight, income: TrendingUp, expenses: TrendingDown, transfers: ArrowRightLeft };
            const Icon = icons[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}>
                <Icon className="w-4 h-4" />
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by ID, category..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">TXN-{tx.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500 text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === "Income"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : tx.type === "Transfer"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {tx.type === "Income" ? <TrendingUp className="w-3 h-3" /> : tx.type === "Transfer" ? <ArrowRightLeft className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{tx.category}</td>
                  <td className="px-6 py-4 text-zinc-500">{tx.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${tx.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "Income" ? "+" : "-"}{formatNaira(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-zinc-500">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
