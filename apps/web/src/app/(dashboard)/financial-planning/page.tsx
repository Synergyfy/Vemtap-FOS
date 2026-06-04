"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  Loader2,
  Save,
  Play,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

const formatNaira = (value: number) =>
  `₦${Math.round(value).toLocaleString()}`;

export default function FinancialPlanningPage() {
  const [timeView, setTimeView] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");

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

  useEffect(() => {
    setTargetRevenue(currentTarget?.targetRevenue ?? 0);
    setTargetBusinesses(currentTarget?.targetBusinesses ?? 0);
    setTargetSms(currentTarget?.targetSmsUsage ?? 0);
    setTargetEmail(currentTarget?.targetEmailUsage ?? 0);
    setProfitMargin(currentTarget?.profitMargin ?? 0);
  }, [currentTarget]);

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

  const requiredRevenue = targetRevenue;
  const requiredBusinesses = targetBusinesses;

  const achievedRevenuePct = currentTarget?.achievedRevenuePercentage ?? 0;
  const achievedProfitPct = currentTarget?.achievedProfitPercentage ?? 0;
  const actualRevenue = currentTarget
    ? Math.round(currentTarget.targetRevenue * (achievedRevenuePct / 100))
    : 0;
  const actualProfit = currentTarget
    ? Math.round(
        (currentTarget.targetRevenue * (achievedProfitPct / 100) *
          currentTarget.profitMargin) /
          100,
      )
    : 0;
  const actualBiz = currentTarget
    ? Math.round(currentTarget.targetBusinesses * (achievedRevenuePct / 100))
    : 0;

  const revenueProgress = Math.min(100, Math.round(achievedRevenuePct));
  const businessProgress = Math.min(100, Math.round(achievedProfitPct));

  const [growthRate, setGrowthRate] = useState(15);
  const [pricing, setPricing] = useState(5000);
  const [agentFactor, setAgentFactor] = useState(1.0);
  const [projectionMonths, setProjectionMonths] = useState(6);
  const [scenarioInputChurn, setScenarioInputChurn] = useState(5);

  const [scenarioResult, setScenarioResult] =
    useState<ScenarioSimulation | null>(null);

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

  const requiredBizPerAgent = Math.max(
    1,
    Math.round(requiredBusinesses / (currentTarget ? 1 : 1)),
  );

  if (targetsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Financial Planning
        </h1>
        <p className="text-zinc-500">
          Set targets, simulate scenarios, and track your financial health.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* A. TARGET SETTING ENGINE */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" /> Target Setting
                  Engine
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Set your{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">
                    {timeView}
                  </span>{" "}
                  targets and save them to the backend.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map(
                    (view) => (
                      <button
                        key={view}
                        onClick={() => setTimeView(view)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                          timeView === view
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        }`}
                      >
                        {view}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={handleSaveTarget}
                  disabled={createTarget.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {createTarget.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3 capitalize flex items-center">
                  {timeView} Targets
                  <InfoTooltip
                    content={`These targets are for a ${timeView} period. Adjust them and click Save.`}
                  />
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 flex items-center mb-1">
                      Target Revenue (₦)
                      <InfoTooltip content="The total income you aim to generate in this period." />
                    </label>
                    <input
                      type="number"
                      value={targetRevenue}
                      onChange={(e) =>
                        setTargetRevenue(Number(e.target.value))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-[10px] text-zinc-400 mt-1 ml-1">
                      {formatNaira(targetRevenue)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 flex items-center mb-1">
                      Target New Businesses
                      <InfoTooltip content="Number of new merchant signups or acquisitions." />
                    </label>
                    <input
                      type="number"
                      value={targetBusinesses}
                      onChange={(e) =>
                        setTargetBusinesses(Number(e.target.value))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 flex items-center mb-1">
                        SMS Usage
                        <InfoTooltip content="Target number of SMS messages sent via platform." />
                      </label>
                      <input
                        type="number"
                        value={targetSms}
                        onChange={(e) => setTargetSms(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 flex items-center mb-1">
                        Email Usage
                        <InfoTooltip content="Target number of emails sent via platform." />
                      </label>
                      <input
                        type="number"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 flex items-center mb-1">
                      Profit Margin %
                      <InfoTooltip content="The percentage of revenue that remains as profit after all expenses." />
                    </label>
                    <input
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 capitalize">
                  Required ({timeView})
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">
                      Required Revenue
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatNaira(requiredRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">
                      New Businesses
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {requiredBusinesses} businesses
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">
                      Per Target Period
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {requiredBizPerAgent} biz / period
                    </span>
                  </div>
                </div>
                <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>
                    You need {requiredBusinesses} new businesses this{" "}
                    {timeView.replace("ly", "")} to stay on track.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. BUDGET VS ACTUALS */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Budget vs Actuals
              </h2>
            </div>
            {currentTarget ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Revenue Actual</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatNaira(actualRevenue)}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Target: {formatNaira(currentTarget.targetRevenue)}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">
                    Active Businesses
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {actualBiz}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Target: {currentTarget.targetBusinesses}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Net Profit</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatNaira(actualProfit)}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Margin: {profitMargin}%
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">SMS Sent</p>
                  <p className="text-lg font-bold text-purple-600">
                    {currentTarget.targetSmsUsage.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Target: {currentTarget.targetSmsUsage.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-6">
                Save a target above to see budget vs actuals.
              </p>
            )}
          </div>

          {/* E. SCENARIO SIMULATOR */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" /> Scenario
                  Simulator
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Adjust variables and run the simulation on the server.
                </p>
              </div>
              <button
                onClick={handleRunScenario}
                disabled={scenarioSim.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {scenarioSim.isPending ? "Simulating..." : "Run Simulation"}
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 flex items-center">
                    Projection Duration
                    <InfoTooltip content="How many months into the future you want to project your profits." />
                  </label>
                  <span className="text-sm font-bold text-purple-600">
                    {projectionMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full accent-purple-500 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  min="1"
                  max="24"
                  step="1"
                  value={projectionMonths}
                  onChange={(e) =>
                    setProjectionMonths(Number(e.target.value))
                  }
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-2 px-1">
                  <span>1 Month</span>
                  <span>12 Months</span>
                  <span>24 Months</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="text-xs font-medium text-zinc-500 flex items-center mb-2">
                    Growth Rate (%)
                    <InfoTooltip content="The percentage of business growth expected each month." />
                  </label>
                  <input
                    type="range"
                    className="w-full accent-purple-500"
                    min="0"
                    max="100"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">
                    {growthRate}%
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 flex items-center mb-2">
                    Churn Rate (%)
                    <InfoTooltip content="The percentage of customers likely to stop using the service each month." />
                  </label>
                  <input
                    type="range"
                    className="w-full accent-red-500"
                    min="0"
                    max="20"
                    value={scenarioInputChurn}
                    onChange={(e) =>
                      setScenarioInputChurn(Number(e.target.value))
                    }
                  />
                  <div className="text-xs text-right mt-1 font-medium">
                    {scenarioInputChurn}%
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 flex items-center mb-2">
                    Pricing (ARPU) ₦
                    <InfoTooltip content="Average Revenue Per User." />
                  </label>
                  <input
                    type="range"
                    className="w-full accent-blue-500"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={pricing}
                    onChange={(e) => setPricing(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">
                    {formatNaira(pricing)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 flex items-center mb-2">
                    Agent Perf. Factor
                    <InfoTooltip content="A multiplier for how efficient your sales agents are." />
                  </label>
                  <input
                    type="range"
                    className="w-full accent-green-500"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={agentFactor}
                    onChange={(e) => setAgentFactor(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">
                    {agentFactor.toFixed(1)}x
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2 flex items-center">
                    Best Case
                  </h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                    {scenarioResult
                      ? formatNaira(scenarioResult.best.totalProfit)
                      : "—"}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Projected Profit ({projectionMonths} mo)
                  </p>
                  {scenarioResult && (
                    <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-500 font-medium">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Maximum Growth
                    </div>
                  )}
                </div>

                <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 transition-all scale-105 shadow-md z-10">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider mb-2 flex items-center">
                    Expected Case
                  </h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                    {scenarioResult
                      ? formatNaira(scenarioResult.expected.totalProfit)
                      : "—"}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Projected Profit ({projectionMonths} mo)
                  </p>
                  {scenarioResult && (
                    <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-500 font-medium">
                      <Activity className="w-3 h-3 mr-1" /> Baseline Trajectory
                    </div>
                  )}
                </div>

                <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-2 flex items-center">
                    Worst Case
                  </h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                    {scenarioResult
                      ? formatNaira(scenarioResult.worst.totalProfit)
                      : "—"}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Projected Profit ({projectionMonths} mo)
                  </p>
                  {scenarioResult && (
                    <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-500 font-medium">
                      <ArrowDownRight className="w-3 h-3 mr-1" /> High Risk
                      Factors
                    </div>
                  )}
                </div>
              </div>

              {!scenarioResult && (
                <p className="text-xs text-zinc-400 text-center mt-6">
                  Click <span className="font-medium">Run Simulation</span> to
                  see projections.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* F. GOAL TRACKER */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Goal Tracker
            </h2>
            {currentTarget ? (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium flex items-center">
                      Revenue Target
                      <InfoTooltip content="Progress towards your revenue goal." />
                    </span>
                    <span className="text-zinc-500">
                      {formatNaira(actualRevenue)} /{" "}
                      {formatNaira(currentTarget.targetRevenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${revenueProgress}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                      revenueProgress >= 50
                        ? "text-green-600 dark:text-green-500"
                        : "text-amber-600 dark:text-amber-500"
                    }`}
                  >
                    {revenueProgress >= 50 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {revenueProgress >= 50
                      ? "On track"
                      : "Behind schedule"}{" "}
                    ({revenueProgress}%)
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium flex items-center">
                      Business Target
                      <InfoTooltip content="Progress towards your business signup goal." />
                    </span>
                    <span className="text-zinc-500">
                      {actualBiz} / {currentTarget.targetBusinesses}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${businessProgress}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                      businessProgress >= 50
                        ? "text-green-600 dark:text-green-500"
                        : "text-amber-600 dark:text-amber-500"
                    }`}
                  >
                    {businessProgress >= 50 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {businessProgress >= 50
                      ? "On track"
                      : "Behind schedule"}{" "}
                    ({businessProgress}%)
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-6">
                Save a target to start tracking progress.
              </p>
            )}
          </div>

          {/* C. BREAK-EVEN TRACKER & D. CASH FLOW PLANNER */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" /> Financial Health
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center">
                  Break-Even Tracker
                  <InfoTooltip content="Shows how close your revenue is to covering all operating expenses." />
                </h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {breakEven?.progressPercent ?? 0}%
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">
                    {breakEven?.isProfitable ? "profitable" : "to break-even"}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        breakEven?.progressPercent ?? 0,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-zinc-500">
                  {breakEven?.isProfitable
                    ? `Revenue exceeds costs by ${formatNaira(Math.abs(breakEven.remainingGap))}`
                    : `Remaining gap: ${formatNaira(breakEven?.remainingGap ?? 0)}`}
                </p>
                {breakEven && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Need {breakEven.breakEvenBusinesses} active businesses at
                    ₦{breakEven.arpu.toLocaleString()} ARPU
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center">
                  Cash Runway
                  <InfoTooltip content="Estimated survival time if no new funding or major revenue changes occur." />
                </h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {runway && runway.runwayMonths < 99
                      ? runway.runwayMonths
                      : "99+"}
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">
                    {runway && runway.runwayMonths < 99
                      ? "months left"
                      : "months (positive cash flow)"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  Net inflow {formatNaira(runway?.monthlyNetCashFlow ?? 0)}/mo,
                  burn rate {formatNaira(runway?.monthlyBurnRate ?? 0)}/mo.
                  Cash balance:{" "}
                  {formatNaira(runway?.closingCashBalance ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* G. DECISION SUPPORT PANEL */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm p-6">
            <h2 className="text-base font-semibold text-amber-900 dark:text-amber-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Decision Support
            </h2>

            <ul className="space-y-3">
              <li className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                You need {requiredBusinesses} new businesses this{" "}
                {timeView.replace("ly", "")} to hit your revenue target.
              </li>
              {breakEven && !breakEven.isProfitable && (
                <li className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Revenue gap of {formatNaira(breakEven.remainingGap)} —
                  consider reducing opex or increasing prices to reach
                  break-even faster.
                </li>
              )}
              {runway &&
                runway.runwayMonths < 12 &&
                runway.runwayMonths < 99 && (
                  <li className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Cash runway critically low ({runway.runwayMonths} months).
                    Prioritize profitability and reduce burn rate.
                  </li>
                )}
              {scenarioResult &&
                scenarioResult.worst.totalProfit < 0 && (
                  <li className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Worst-case scenario shows negative profit — review
                    assumptions and build contingency plans.
                  </li>
                )}
              <li className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {breakEven && !breakEven.isProfitable
                  ? "Focus on plan upgrades to close the revenue gap faster."
                  : "Focus on upsells and agent expansion to accelerate growth."}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
