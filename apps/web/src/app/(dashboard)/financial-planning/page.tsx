"use client";

import { useState } from "react";
import { useBreakEven, useRunway } from "@/lib/hooks/use-pnl";
import {
  useFinancialTargets,
  useCreateFinancialTarget,
  useScenarioSimulation,
} from "@/lib/hooks/use-financial-planning";
import type { ScenarioSimulation } from "@/lib/types";
import {
  Target,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Loader2,
  Save,
  Play,
  BarChart3,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

export default function FinancialPlanningPage() {
  const [activeTab, setActiveTab] = useState<"planning" | "budget">("planning");
  const [timeView, setTimeView] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const { data: breakEven } = useBreakEven();
  const { data: runway } = useRunway();
  const { data: targets, isLoading: targetsLoading } = useFinancialTargets();
  const createTarget = useCreateFinancialTarget();
  const scenarioSim = useScenarioSimulation();

  const currentTarget = targets?.find(t => t.periodType === timeView) ?? null;

  const [targetRevenue, setTargetRevenue] = useState(0);
  const [targetBusinesses, setTargetBusinesses] = useState(0);
  const [targetSms, setTargetSms] = useState(0);
  const [targetEmail, setTargetEmail] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  const handleSaveTarget = () => {
    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    createTarget.mutate({
      periodType: timeView,
      targetRevenue,
      targetBusinesses,
      targetSmsUsage: targetSms,
      targetEmailUsage: targetEmail,
      profitMargin,
      startDate: today,
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  const [growthRate, setGrowthRate] = useState(15);
  const [pricing, setPricing] = useState(5000);
  const [agentFactor, setAgentFactor] = useState(1.0);
  const [projectionMonths] = useState(6);
  const [scenarioInputChurn, setScenarioInputChurn] = useState(5);
  const [scenarioResult, setScenarioResult] = useState<ScenarioSimulation | null>(null);

  const handleRunScenario = () => {
    scenarioSim.mutate(
      {
        currentBusinesses: breakEven?.activeBusinesses ?? 340,
        growthRate,
        churnRate: scenarioInputChurn,
        pricing,
        agentFactor,
        projectionMonths,
        profitMargin: profitMargin || 30,
      },
      { onSuccess: (data) => setScenarioResult(data) },
    );
  };

  const requiredRevenue = targetRevenue;
  const requiredBusinesses = targetBusinesses;

  const achievedRevenuePct = currentTarget?.achievedRevenuePercentage ?? 0;
  const actualRevenue = currentTarget
    ? Math.round(currentTarget.targetRevenue * (achievedRevenuePct / 100)) : 0;
  const actualBiz = currentTarget
    ? Math.round(currentTarget.targetBusinesses * (achievedRevenuePct / 100)) : 0;

  const revenueProgress = Math.min(100, Math.round(achievedRevenuePct));

  const budgetVariance = currentTarget
    ? ((actualRevenue - currentTarget.targetRevenue) / currentTarget.targetRevenue * 100) : 0;
  const budgetStatus: "on-track" | "warning" | "over-budget" = budgetVariance >= 0
    ? "on-track" : budgetVariance >= -10 ? "warning" : "over-budget";

  if (targetsLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Planning & Budget
        </h1>
        <p className="text-zinc-500">Plan revenue, set budgets, and compare with actual results.</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["planning", "budget"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {tab === "planning" ? "Planning" : "Budget vs Actual"}
          </button>
        ))}
      </div>

      {activeTab === "planning" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" /> Monthly Plan
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">Set expected revenue, expenses, and targets.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((view) => (
                      <button key={view} onClick={() => setTimeView(view)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                          timeView === view
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleSaveTarget} disabled={createTarget.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" />
                    {createTarget.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3 capitalize flex items-center">
                    {timeView} Targets
                    <InfoTooltip content={`Targets for a ${timeView} period.`} />
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1">Target Revenue (₦)</label>
                      <input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1">Target New Businesses</label>
                      <input type="number" value={targetBusinesses} onChange={(e) => setTargetBusinesses(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1">SMS Usage</label>
                        <input type="number" value={targetSms} onChange={(e) => setTargetSms(Number(e.target.value))}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1">Email Usage</label>
                        <input type="number" value={targetEmail} onChange={(e) => setTargetEmail(Number(e.target.value))}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1">Profit Margin %</label>
                      <input type="number" value={profitMargin} onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 capitalize">Required ({timeView})</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500">Required Revenue</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatNaira(requiredRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500">New Businesses</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{requiredBusinesses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Revenue Target</span>
                      <span className="font-semibold text-green-600">{formatNaira(requiredRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" /> Scenario Simulator
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">Test assumptions before committing.</p>
                </div>
                <button onClick={handleRunScenario} disabled={scenarioSim.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  <Play className="w-4 h-4" />
                  {scenarioSim.isPending ? "Simulating..." : "Run"}
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2">Growth Rate</label>
                    <input type="range" className="w-full accent-purple-500" min="0" max="100" value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))} />
                    <div className="text-xs text-right mt-1 font-medium">{growthRate}%</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2">Churn Rate</label>
                    <input type="range" className="w-full accent-red-500" min="0" max="20" value={scenarioInputChurn}
                      onChange={(e) => setScenarioInputChurn(Number(e.target.value))} />
                    <div className="text-xs text-right mt-1 font-medium">{scenarioInputChurn}%</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2">Pricing (ARPU)</label>
                    <input type="range" className="w-full accent-blue-500" min="5000" max="100000" step="5000" value={pricing}
                      onChange={(e) => setPricing(Number(e.target.value))} />
                    <div className="text-xs text-right mt-1 font-medium">{formatNaira(pricing)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2">Agent Factor</label>
                    <input type="range" className="w-full accent-green-500" min="0.5" max="5" step="0.1" value={agentFactor}
                      onChange={(e) => setAgentFactor(Number(e.target.value))} />
                    <div className="text-xs text-right mt-1 font-medium">{agentFactor.toFixed(1)}x</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase mb-2">Best Case</h4>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {scenarioResult ? formatNaira(scenarioResult.best.totalProfit) : "—"}
                    </div>
                    <p className="text-xs text-zinc-500">Projected Profit ({projectionMonths} mo)</p>
                  </div>
                  <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 scale-105 shadow-md z-10">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase mb-2">Expected</h4>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {scenarioResult ? formatNaira(scenarioResult.expected.totalProfit) : "—"}
                    </div>
                    <p className="text-xs text-zinc-500">Projected Profit ({projectionMonths} mo)</p>
                  </div>
                  <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-600 dark:text-red-500 uppercase mb-2">Worst Case</h4>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {scenarioResult ? formatNaira(scenarioResult.worst.totalProfit) : "—"}
                    </div>
                    <p className="text-xs text-zinc-500">Projected Profit ({projectionMonths} mo)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Goal Tracker
              </h2>
              {currentTarget ? (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">Revenue Target</span>
                      <span className="text-zinc-500">{formatNaira(actualRevenue)} / {formatNaira(currentTarget.targetRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${revenueProgress}%` }}></div>
                    </div>
                    <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${revenueProgress >= 50 ? "text-green-600" : "text-amber-600"}`}>
                      {revenueProgress >= 50 ? "On track" : "Behind schedule"} ({revenueProgress}%)
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-6">Save a target to start tracking.</p>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" /> Financial Health
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 mb-2">Break-Even</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{breakEven?.progressPercent ?? 0}%</span>
                    <span className="text-sm text-zinc-500 mb-1">{breakEven?.isProfitable ? "profitable" : "to break-even"}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${Math.min(breakEven?.progressPercent ?? 0, 100)}%` }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-500 mb-2">Cash Runway</h3>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {runway && runway.runwayMonths < 99 ? runway.runwayMonths : "99+"}
                    </span>
                    <span className="text-sm text-zinc-500 mb-1">months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Budget vs Actual
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Compare planned targets with actual performance.</p>
          </div>
          {currentTarget ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">Budget</th>
                    <th className="px-6 py-4 font-medium text-right">Actual</th>
                    <th className="px-6 py-4 font-medium text-right">Variance</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">Revenue</td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-zinc-50">{formatNaira(currentTarget.targetRevenue)}</td>
                    <td className="px-6 py-4 text-right text-green-600">{formatNaira(actualRevenue)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${budgetVariance >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {budgetVariance >= 0 ? "+" : ""}{budgetVariance.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budgetStatus === "on-track" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : budgetStatus === "warning" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {budgetStatus === "on-track" ? "On Track" : budgetStatus === "warning" ? "Warning" : "Over Budget"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">Businesses</td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-zinc-50">{currentTarget.targetBusinesses}</td>
                    <td className="px-6 py-4 text-right text-green-600">{actualBiz}</td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-500">—</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">SMS Usage</td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-zinc-50">{currentTarget.targetSmsUsage.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">{currentTarget.targetSmsUsage.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-500">0%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        On Track
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-zinc-500">Save a target to see budget vs actual comparison.</div>
          )}
        </div>
      )}
    </div>
  );
}
