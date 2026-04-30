"use client";

import { useState, useMemo } from "react";
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2
} from "lucide-react";

// Helper for formatting currency
const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function FinancialPlanningPage() {
  const [timeView, setTimeView] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");

  // --- Budget Planner State ---
  const [targetRevenue, setTargetRevenue] = useState(5000000);
  const [targetBusinesses, setTargetBusinesses] = useState(500);
  const [targetSms, setTargetSms] = useState(10000);
  const [targetEmail, setTargetEmail] = useState(25000);
  const [profitMargin, setProfitMargin] = useState(40);
  
  // Assume 5 active agents for calculation
  const activeAgents = 5;

  // Calculate required metrics based on timeView (assuming inputs are monthly targets)
  const timeMultiplier = {
    daily: 1 / 30,
    weekly: 1 / 4,
    monthly: 1,
    yearly: 12,
  }[timeView];

  const requiredRevenue = Math.round(targetRevenue * timeMultiplier);
  const requiredBusinesses = Math.max(1, Math.round(targetBusinesses * timeMultiplier));
  const businessesPerAgent = Math.max(1, Math.round(requiredBusinesses / activeAgents));

  // --- Scenario Simulator State ---
  const [growthRate, setGrowthRate] = useState(15);
  const [churnRate, setChurnRate] = useState(2);
  const [pricing, setPricing] = useState(15000);
  const [agentFactor, setAgentFactor] = useState(1.0);

  // Simple 6-month profit projection based on inputs
  const calculateScenarios = useMemo(() => {
    const currentActiveBusinesses = 300;
    
    // Monthly projection formula (simplified)
    const runProjection = (gRate: number, cRate: number, pFactor: number) => {
      let totalProfit = 0;
      let biz = currentActiveBusinesses;
      for (let i = 0; i < 6; i++) {
        // Apply growth and churn
        biz = biz * (1 + (gRate / 100) * pFactor) * (1 - (cRate / 100));
        const monthRev = biz * pricing;
        // Assume base profit margin of 40%
        totalProfit += monthRev * 0.4; 
      }
      return totalProfit;
    };

    const expected = runProjection(growthRate, churnRate, agentFactor);
    // Best case: slightly higher growth, lower churn
    const best = runProjection(growthRate * 1.2, Math.max(0, churnRate - 1), agentFactor * 1.1);
    // Worst case: lower growth, higher churn
    const worst = runProjection(growthRate * 0.5, churnRate + 3, agentFactor * 0.8);

    return { expected, best, worst };
  }, [growthRate, churnRate, pricing, agentFactor]);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Financial Planning</h1>
        <p className="text-zinc-500">Set targets, simulate scenarios, and track your financial health.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* A. BUDGET PLANNER */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" /> Target Setting Engine
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Set your monthly targets and view requirements.</p>
              </div>
              
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start">
                {(["daily", "weekly", "monthly", "yearly"] as const).map((view) => (
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
                ))}
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">Monthly Targets</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 block mb-1">Target Revenue (₦)</label>
                    <input 
                      type="number" 
                      value={targetRevenue}
                      onChange={(e) => setTargetRevenue(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 block mb-1">Target Businesses</label>
                    <input 
                      type="number" 
                      value={targetBusinesses}
                      onChange={(e) => setTargetBusinesses(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 block mb-1">SMS Usage</label>
                      <input 
                        type="number" 
                        value={targetSms}
                        onChange={(e) => setTargetSms(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 block mb-1">Email Usage</label>
                      <input 
                        type="number" 
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 block mb-1">Profit Margin %</label>
                    <input 
                      type="number" 
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Auto Calculations */}
              <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 capitalize">Required ({timeView})</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">Required Revenue</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatNaira(requiredRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">New Businesses</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{requiredBusinesses} businesses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Agent Performance</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{businessesPerAgent} biz / agent</span>
                  </div>
                </div>
                
                <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>You need {requiredBusinesses} new businesses this {timeView.replace('ly','')} to stay on track.</p>
                </div>
              </div>
            </div>
          </div>

          {/* E. SCENARIO SIMULATOR */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" /> Scenario Simulator
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Adjust variables to see 6-month projected profit outcomes.</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-2">Growth Rate (%)</label>
                  <input 
                    type="range" 
                    className="w-full accent-purple-500" 
                    min="0" max="100" 
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">{growthRate}%</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-2">Churn Rate (%)</label>
                  <input 
                    type="range" 
                    className="w-full accent-red-500" 
                    min="0" max="20" 
                    value={churnRate}
                    onChange={(e) => setChurnRate(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">{churnRate}%</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-2">Pricing (ARPU) ₦</label>
                  <input 
                    type="range" 
                    className="w-full accent-blue-500" 
                    min="5000" max="50000" step="1000" 
                    value={pricing}
                    onChange={(e) => setPricing(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">₦{pricing.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-2">Agent Perf. Factor</label>
                  <input 
                    type="range" 
                    className="w-full accent-green-500" 
                    min="0.5" max="2" step="0.1" 
                    value={agentFactor}
                    onChange={(e) => setAgentFactor(Number(e.target.value))}
                  />
                  <div className="text-xs text-right mt-1 font-medium">{agentFactor.toFixed(1)}x</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2">Best Case</h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{formatNaira(calculateScenarios.best)}</div>
                  <p className="text-xs text-zinc-500">Projected Profit (6 mo)</p>
                  <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-500 font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> Low Risk
                  </div>
                </div>
                
                <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider mb-2">Expected Case</h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{formatNaira(calculateScenarios.expected)}</div>
                  <p className="text-xs text-zinc-500">Projected Profit (6 mo)</p>
                  <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-500 font-medium">
                    <Activity className="w-3 h-3 mr-1" /> Baseline Trajectory
                  </div>
                </div>
                
                <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4 transition-all">
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-2">Worst Case</h4>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{formatNaira(calculateScenarios.worst)}</div>
                  <p className="text-xs text-zinc-500">Projected Profit (6 mo)</p>
                  <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-500 font-medium">
                    <ArrowDownRight className="w-3 h-3 mr-1" /> High Risk
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* F. GOAL TRACKING SYSTEM */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Goal Tracker
            </h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">Monthly Revenue Target</span>
                  <span className="text-zinc-500">₦3.2M / ₦{formatNaira(targetRevenue).replace('₦','')}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[64%] transition-all"></div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1.5 font-medium">On track</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">Weekly Business Target</span>
                  <span className="text-zinc-500">12 / {Math.max(1, Math.round(targetBusinesses / 4))}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[70%] transition-all"></div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1.5 font-medium">At risk</p>
              </div>
            </div>
          </div>

          {/* C. BREAK-EVEN TRACKER & D. CASH FLOW PLANNER */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" /> Financial Health
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-2">Break-Even Tracker</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">85%</span>
                  <span className="text-sm text-zinc-500 mb-1">to profitability</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-indigo-500 w-[85%]"></div>
                </div>
                <p className="text-xs text-zinc-500">Remaining gap: <span className="font-medium text-zinc-900 dark:text-zinc-50">₦450,000</span></p>
              </div>
              
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-500 mb-2">Cash Runway</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">8.5</span>
                  <span className="text-sm text-zinc-500 mb-1">months left</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  Based on expected inflows (₦2.1M) and planned expenses (₦1.8M/mo).
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
                You need {requiredBusinesses} new businesses this {timeView.replace('ly','')} to hit your revenue target.
              </li>
              <li className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Reduce commission by 2% to improve margin towards Break-Even.
              </li>
              <li className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {churnRate > 5 ? "High churn rate detected! Focus on retention immediately." : "Focus on Gold plan upgrades to reach the weekly revenue target faster."}
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
