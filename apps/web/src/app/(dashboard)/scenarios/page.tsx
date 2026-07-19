"use client";

import { useState } from "react";
import {
  GitBranch,
  DollarSign,
  Users,
  Target,
} from "lucide-react";
import { useBreakEven, useRunway } from "@/lib/hooks/use-pnl";
import ScenarioBuilder from "./ScenarioBuilder";

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

export default function ScenariosPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "breakeven" | "revenue-target" | "affordability" | "hiring">("builder");
  const { data: breakEven } = useBreakEven();
  const { data: runway } = useRunway();

  const [targetRevenue, setTargetRevenue] = useState(5000000);

  const monthlyFixed = breakEven?.monthlyFixedCosts ?? 0;
  const avgRevenue = breakEven?.arpu ?? 5000;
  const handleCalcBreakEven = () => {
    const needed = Math.ceil(monthlyFixed / avgRevenue);
    return { customers: needed, revenue: needed * avgRevenue };
  };

  const handleCalcRevenueTarget = () => {
    const customersNeeded = Math.ceil(targetRevenue / avgRevenue);
    return { customers: customersNeeded, perPlan: { silver: Math.ceil(customersNeeded * 0.5), gold: Math.ceil(customersNeeded * 0.3), platinum: Math.ceil(customersNeeded * 0.2) } };
  };

  const handleCalcAffordability = (expense: number) => {
    const cashImpact = expense;
    const monthlyImpact = expense;
    const revenueRequired = expense * 1.3;
    const runwayImpact = runway?.runwayMonths ?? 12;
    return { cashImpact, monthlyImpact, revenueRequired, runwayImpact };
  };

  const handleCalcHiring = (salary: number) => {
    const monthlyCost = salary;
    const revenueRequired = salary * 2;
    const customersNeeded = Math.ceil(revenueRequired / avgRevenue);
    const runwayImpact = runway?.runwayMonths ?? 12;
    return { monthlyCost, revenueRequired, customersNeeded, runwayImpact };
  };

  const [affordExpense, setAffordExpense] = useState(100000);
  const [hireSalary, setHireSalary] = useState(300000);
  const be = handleCalcBreakEven();
  const rt = handleCalcRevenueTarget();
  const aff = handleCalcAffordability(affordExpense);
  const hire = handleCalcHiring(hireSalary);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-purple-500" /> Scenario Overview
        </h1>
        <p className="text-zinc-500">Test decisions before making them — scenarios, break-even, and calculators.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["builder", "breakeven", "revenue-target", "affordability", "hiring"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "builder" ? "Scenario Builder" : tab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      {activeTab === "builder" && (
        <ScenarioBuilder breakEven={breakEven} runway={runway} />
      )}

      {activeTab === "breakeven" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Break-Even Calculator</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-500">Fixed Expenses</span>
                <span className="font-semibold">{formatNaira(monthlyFixed)}</span>
              </div>
              <div className="flex justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-500">Avg Customer Revenue</span>
                <span className="font-semibold">{formatNaira(avgRevenue)}</span>
              </div>
              <div className="flex justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Revenue Needed</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{formatNaira(be.revenue)}</span>
              </div>
              <div className="flex justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Customers Needed</span>
                <span className="font-bold text-green-700 dark:text-green-300">{be.customers}</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-2">Break-Even Status</p>
              <p className="text-5xl font-bold text-indigo-500">{breakEven?.progressPercent ?? 0}%</p>
              <p className="text-sm text-zinc-500 mt-2">{breakEven?.isProfitable ? "Profitable" : "Not yet at break-even"}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "revenue-target" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Revenue Target Calculator</h2>
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Revenue (₦)</label>
              <input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Customers Needed: <span className="text-xl font-bold">{rt.customers}</span></p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Silver: {rt.perPlan.silver} | Gold: {rt.perPlan.gold} | Platinum: {rt.perPlan.platinum}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-center">
            <div className="text-center">
              <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(targetRevenue)}</p>
              <p className="text-sm text-zinc-500 mt-2">Target Monthly Revenue</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "affordability" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Affordability Calculator</h2>
            <p className="text-sm text-zinc-500 mb-4">Can VEMTAP afford this?</p>
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Expense (₦)</label>
              <input type="number" value={affordExpense} onChange={(e) => setAffordExpense(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-sm text-zinc-500">Cash Impact</span>
                  <span className="font-semibold text-red-500">{formatNaira(aff.cashImpact)}</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-sm text-zinc-500">Monthly Expense Impact</span>
                  <span className="font-semibold text-red-500">{formatNaira(aff.monthlyImpact)}</span>
                </div>
                <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Revenue Required</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">{formatNaira(aff.revenueRequired)}</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Runway Impact</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{aff.runwayImpact} months</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-sm text-zinc-500 mb-2">Can VEMTAP afford {formatNaira(affordExpense)}?</p>
              <p className={`text-2xl font-bold ${affordExpense < (runway?.closingCashBalance ?? 0) * 0.1 ? "text-green-500" : "text-red-500"}`}>
                {affordExpense < (runway?.closingCashBalance ?? 0) * 0.1 ? "Yes" : "Review Required"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "hiring" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Hiring Simulator</h2>
            <p className="text-sm text-zinc-500 mb-4">Calculate the financial impact of a new hire.</p>
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
              <input type="text" defaultValue="New Developer"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly Salary (₦)</label>
              <input type="number" value={hireSalary} onChange={(e) => setHireSalary(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-sm text-zinc-500">Monthly Cost</span>
                  <span className="font-semibold text-red-500">{formatNaira(hire.monthlyCost)}</span>
                </div>
                <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Revenue Required</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">{formatNaira(hire.revenueRequired)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Customers Needed</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{hire.customersNeeded}</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Runway Impact</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{hire.runwayImpact} months</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(hireSalary)}/mo</p>
              <p className="text-sm text-zinc-500 mt-2">Additional Monthly Cost</p>
              <p className="text-sm text-zinc-400 mt-4">Revenue needed: {formatNaira(hire.revenueRequired)}/mo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
