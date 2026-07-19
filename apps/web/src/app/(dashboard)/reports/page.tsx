"use client";

import { useState } from "react";
import {
  FileText,
  BarChart3,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useReports } from "@/lib/hooks/use-reports";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"financial" | "management" | "investor" | "custom">("financial");
  const { data, isLoading, error } = useReports();

  const [customDate, setCustomDate] = useState("30days");
  const [customCategory, setCustomCategory] = useState("All");
  const [customDept, setCustomDept] = useState("All");

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-zinc-500">Failed to load reports. Please try again.</p>
        </div>
      </div>
    );
  }

  const { reportSections, investorMetrics } = data;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" /> Financial Reports
        </h1>
        <p className="text-zinc-500">Generate and view financial, management, and investor reports.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["financial", "management", "investor", "custom"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "custom" ? "Custom Report" : tab.charAt(0).toUpperCase() + tab.slice(1) + " Reports"}
          </button>
        ))}
      </div>

      {activeTab === "financial" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportSections.map((r) => (
            <div key={r.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{r.label}</h3>
                <span className={`text-sm font-medium ${r.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{r.change}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{r.value}</p>
              <p className="text-xs text-zinc-400 mt-2">Click to view detailed report</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "management" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Executive Summary</h2>
            <p className="text-sm text-zinc-500 mt-1">Simplified executive report for management review.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₦12.5M</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Expenses</p>
              <p className="text-2xl font-bold text-red-500">₦4.8M</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Profit</p>
              <p className="text-2xl font-bold text-blue-600">₦7.7M</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Cash</p>
              <p className="text-2xl font-bold text-purple-600">₦8.2M</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Runway</p>
              <p className="text-2xl font-bold text-amber-600">12 Months</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Customers</p>
              <p className="text-2xl font-bold text-indigo-600">340</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Growth</p>
              <p className="text-2xl font-bold text-emerald-600">+22%</p>
            </div>
            <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1">Risk Level</p>
              <p className="text-2xl font-bold text-rose-600">Low</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "investor" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Investor Report</h2>
              <p className="text-sm text-zinc-500 mt-1">High-level company performance metrics.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-sm font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {investorMetrics.map((m) => (
              <div key={m.label} className="text-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "custom" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Custom Report</h2>
            <p className="text-sm text-zinc-500 mt-1">Select filters and generate a custom report.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1">Date Range</label>
                <select value={customDate} onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1">Category</label>
                <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="All">All Categories</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Profit">Profit</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1">Department</label>
                <select value={customDept} onChange={(e) => setCustomDept(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="All">All Departments</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
            <div className="p-12 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              Select filters and click Generate Report to see data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
