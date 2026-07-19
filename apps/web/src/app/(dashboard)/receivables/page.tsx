"use client";

import { useState } from "react";
import {
  Receipt,
  Clock,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { useReceivables } from "@/lib/hooks/use-receivables";
import type { Invoice } from "@/lib/types/receivables";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calcDaysOverdue(dueDate: string): number {
  return Math.floor((Date.now() - new Date(dueDate).getTime()) / MS_PER_DAY);
}

export default function ReceivablesPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "overdue">("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addedInvoices, setAddedInvoices] = useState<Invoice[]>([]);
  const [invCustomer, setInvCustomer] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invStatus, setInvStatus] = useState("Outstanding");
  const { data, isLoading, error } = useReceivables();

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-zinc-500">Failed to load receivables. Please try again.</p>
        </div>
      </div>
    );
  }

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomer || !invAmount || !invDueDate) return;
    const newInvoice: Invoice = {
      customer: invCustomer,
      amount: Number(invAmount),
      dueDate: invDueDate,
      status: invStatus,
    };
    setAddedInvoices((prev) => [...prev, newInvoice]);
    setInvCustomer(""); setInvAmount(""); setInvDueDate(""); setInvStatus("Outstanding");
    setIsFormOpen(false);
  };

  const invoices = [...(data?.invoices ?? []), ...addedInvoices];
  const totalOutstanding = invoices.reduce((s, i) => s + (i.status === "Outstanding" || i.status === "Pending" ? i.amount : 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const collectedThisMonth = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const overdueDays = overdue.map((inv) => calcDaysOverdue(inv.dueDate));

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-500" /> Receivables Overview
          </h1>
          <p className="text-zinc-500">Money owed to VEMTAP — invoices, overdue payments, collections.</p>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm">
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : "Add Invoice"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-500" /> New Invoice
          </h2>
          <form onSubmit={handleAddInvoice} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Customer</label>
              <input type="text" required value={invCustomer} onChange={(e) => setInvCustomer(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. ABC Corp" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount (₦)</label>
              <input type="number" required min="0" value={invAmount} onChange={(e) => setInvAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Due Date</label>
              <input type="date" required value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Status</label>
              <select value={invStatus} onChange={(e) => setInvStatus(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Outstanding">Outstanding</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors h-[38px]">
              Add Invoice
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Outstanding</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalOutstanding)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Due Soon</p>
          <h3 className="text-xl font-bold text-amber-500 mt-1">{formatNaira(totalOutstanding * 0.4)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Overdue</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(totalOverdue)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Collected This Month</p>
          <h3 className="text-xl font-bold text-green-500 mt-1">{formatNaira(collectedThisMonth)}</h3>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["overview", "invoices", "overdue"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "overview" ? "Overview" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Collection History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Invoice</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {invoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{inv.customer}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">INV-{String(i + 1).padStart(4, "0")}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatNaira(inv.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === "Paid" ? "bg-green-100 text-green-800"
                          : inv.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : inv.status === "Outstanding" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Outstanding Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {invoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{inv.customer}</td>
                    <td className="px-6 py-4 font-semibold">{formatNaira(inv.amount)}</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "overdue" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Overdue Payments</h2>
            <p className="text-sm text-zinc-500 mt-1">Payments past their due date.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {overdue.map((inv, i) => {
                  const daysOverdue = overdueDays[i];
                  return (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{inv.customer}</td>
                      <td className="px-6 py-4 text-right font-semibold text-red-500">{formatNaira(inv.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500">
                          <Clock className="w-3 h-3" /> {daysOverdue} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {overdue.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No overdue payments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
