"use client";

import { useState } from "react";
import {
  PiggyBank,
  Calendar,
  DollarSign,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { usePayables } from "@/lib/hooks/use-payables";
import type { PayablePayment } from "@/lib/types/payables";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function PayablesPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "bills" | "schedule">("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addedBills, setAddedBills] = useState<PayablePayment[]>([]);
  const [billVendor, setBillVendor] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billCategory, setBillCategory] = useState("");
  const { data, isLoading, error } = usePayables();

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-zinc-500">Failed to load payables. Please try again.</p>
        </div>
      </div>
    );
  }

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billVendor || !billAmount || !billDueDate || !billCategory) return;
    const newBill: PayablePayment = {
      description: billVendor,
      amount: Number(billAmount),
      dueDate: billDueDate,
      category: billCategory,
      status: "Pending",
    };
    setAddedBills((prev) => [...prev, newBill]);
    setBillVendor(""); setBillAmount(""); setBillDueDate(""); setBillCategory("");
    setIsFormOpen(false);
  };

  const { monthlySalary, totalPayables, dueThisWeek, dueThisMonth, overdue, paymentSchedule } = data;
  const bills = [...data.bills, ...addedBills];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-amber-500" /> Payables Overview
          </h1>
          <p className="text-zinc-500">Money VEMTAP owes — bills, salaries, vendor payments, and payment schedule.</p>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm">
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : "Add Bill"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-zinc-500" /> New Bill
          </h2>
          <form onSubmit={handleAddBill} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Vendor</label>
              <input type="text" required value={billVendor} onChange={(e) => setBillVendor(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cloud Provider" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount (₦)</label>
              <input type="number" required min="0" value={billAmount} onChange={(e) => setBillAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Due Date</label>
              <input type="date" required value={billDueDate} onChange={(e) => setBillDueDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <input type="text" required value={billCategory} onChange={(e) => setBillCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Infrastructure" />
            </div>
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors h-[38px]">
              Add Bill
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Payables</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNaira(totalPayables)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Due This Week</p>
          <h3 className="text-xl font-bold text-amber-500 mt-1">{formatNaira(dueThisWeek)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Due This Month</p>
          <h3 className="text-xl font-bold text-orange-500 mt-1">{formatNaira(dueThisMonth)}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Overdue</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(overdue)}</h3>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["overview", "bills", "schedule"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "overview" ? "Overview" : tab === "schedule" ? "Payment Schedule" : "Bills & Salaries"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" /> Salaries
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-500">Payroll Period</span>
                <span className="font-medium">July 2026</span>
              </div>
              <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-500">Total Salary</span>
                <span className="font-semibold">{formatNaira(monthlySalary)}</span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-green-700 dark:text-green-300">Paid</span>
                <span className="font-bold text-green-700 dark:text-green-300">{formatNaira(monthlySalary * 0)}</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-sm text-amber-700 dark:text-amber-300">Pending</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">{formatNaira(monthlySalary)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-blue-500" /> Vendor Payments
            </h2>
            <div className="space-y-3">
              {bills.slice(0, 3).map((bill, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{bill.description}</p>
                    <p className="text-[10px] text-zinc-500">{bill.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNaira(bill.amount)}</p>
                    <span className={`text-[10px] font-medium ${
                      bill.status === "Paid" ? "text-green-500" : bill.status === "Overdue" ? "text-red-500" : "text-amber-500"
                    }`}>{bill.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "bills" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {bills.map((bill, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{bill.description}</td>
                    <td className="px-6 py-4 text-zinc-500">{bill.category}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatNaira(bill.amount)}</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bill.status === "Paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : bill.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>{bill.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Payment Schedule
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Upcoming payments organized by date for cash planning.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paymentSchedule.map((p, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                      {new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50">{p.description}</td>
                    <td className="px-6 py-4 text-zinc-500">{p.category}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatNaira(p.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "Paid" ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
