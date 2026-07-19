"use client";

import { useState } from "react";
import { Trash2, TrendingUp, Users, Target, Tag, Zap, PieChart } from "lucide-react";

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;
const parseNum = (val: string) => {
  const clean = val.replace(/[,₦\s%]/g, "");
  const n = Number(clean);
  return isNaN(n) ? 0 : n;
};

type ScenarioType = "hiring" | "marketing" | "pricing" | "custom";

interface ScenarioBase {
  id: string;
  type: ScenarioType;
  title: string;
}

interface HiringScenario extends ScenarioBase {
  type: "hiring";
  headcount: number;
  salary: number;
  expectedRevenuePerHire: number;
}

interface MarketingScenario extends ScenarioBase {
  type: "marketing";
  budget: number;
  expectedCustomers: number;
}

interface PricingScenario extends ScenarioBase {
  type: "pricing";
  newPrice: number;
  churnImpact: number;
}

interface CustomScenario extends ScenarioBase {
  type: "custom";
  amount: number;
  isRevenue: boolean;
  frequency: "monthly" | "one-time";
}

type ScenarioBlock = HiringScenario | MarketingScenario | PricingScenario | CustomScenario;

const SCENARIO_TEMPLATES = [
  { type: "hiring", icon: Users, title: "Hire New Staff", desc: "See the impact of adding to your team" },
  { type: "marketing", icon: Target, title: "Run Marketing Campaign", desc: "Invest in ads and acquire customers" },
  { type: "pricing", icon: Tag, title: "Adjust Pricing", desc: "Change your prices and model churn" },
  { type: "custom", icon: Zap, title: "Custom Event", desc: "Add any specific revenue or expense" },
] as const;

interface BreakEvenData {
  grossRevenue?: number;
  totalMonthlyCosts?: number;
  arpu?: number;
  monthlyFixedCosts?: number;
}

interface RunwayData {
  closingCashBalance?: number;
}

export default function ScenarioBuilder({ breakEven, runway }: { breakEven: BreakEvenData | null | undefined; runway: RunwayData | null | undefined }) {
  const [blocks, setBlocks] = useState<ScenarioBlock[]>([]);

  // Base metrics
  const baseRevenue = breakEven?.grossRevenue ?? 500000;
  const baseExpenses = breakEven?.totalMonthlyCosts ?? 400000;
  const baseCash = runway?.closingCashBalance ?? 1000000;
  const currentAvgRevenue = breakEven?.arpu ?? 5000;
  const currentCustomers = Math.max(1, Math.floor(baseRevenue / currentAvgRevenue));

  const addBlock = (type: ScenarioType) => {
    const id = window.crypto.randomUUID();
    let newBlock: ScenarioBlock;
    
    switch(type) {
      case "hiring":
        newBlock = { id, type, title: "New Hires", headcount: 1, salary: 300000, expectedRevenuePerHire: 0 };
        break;
      case "marketing":
        newBlock = { id, type, title: "Marketing Push", budget: 150000, expectedCustomers: 10 };
        break;
      case "pricing":
        newBlock = { id, type, title: "Price Adjustment", newPrice: currentAvgRevenue * 1.2, churnImpact: 5 };
        break;
      case "custom":
        newBlock = { id, type, title: "Custom Event", amount: 50000, isRevenue: false, frequency: "monthly" };
        break;
    }
    
    setBlocks([newBlock, ...blocks]);
  };

  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  const updateBlock = <T extends ScenarioBlock>(id: string, updates: Partial<T>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } as ScenarioBlock : b));
  };

  // Calculations
  let totalMonthlyRevImpact = 0;
  let totalMonthlyExpImpact = 0;
  let totalOneTimeCashHit = 0;

  blocks.forEach(b => {
    if (b.type === "hiring") {
      totalMonthlyExpImpact += b.headcount * b.salary;
      totalMonthlyRevImpact += b.headcount * b.expectedRevenuePerHire;
    } else if (b.type === "marketing") {
      totalMonthlyExpImpact += b.budget;
      totalMonthlyRevImpact += b.expectedCustomers * currentAvgRevenue;
    } else if (b.type === "pricing") {
      const remainingCustomers = currentCustomers * (1 - (b.churnImpact / 100));
      const newTotalRev = remainingCustomers * b.newPrice;
      const oldTotalRev = currentCustomers * currentAvgRevenue;
      totalMonthlyRevImpact += (newTotalRev - oldTotalRev);
    } else if (b.type === "custom") {
      if (b.frequency === "one-time") {
        if (b.isRevenue) totalOneTimeCashHit += b.amount;
        else totalOneTimeCashHit -= b.amount;
      } else {
        if (b.isRevenue) totalMonthlyRevImpact += b.amount;
        else totalMonthlyExpImpact += b.amount;
      }
    }
  });

  const newRevenue = baseRevenue + totalMonthlyRevImpact;
  const newExpenses = baseExpenses + totalMonthlyExpImpact;
  const profit = newRevenue - newExpenses;
  const cash = baseCash + profit + totalOneTimeCashHit;
  const newRunway = profit > 0 ? 99 : Math.round(Math.max(0, cash) / Math.abs(profit));
  
  // Break-even uses the blended new avg revenue (approx) and new fixed costs (approx)
  // For simplicity, we just add the net expense impact to fixed costs.
  const newBreakEvenCustomers = Math.ceil(((breakEven?.monthlyFixedCosts ?? 0) + totalMonthlyExpImpact) / currentAvgRevenue);

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative items-start">
      {/* Left Pane: Builder (68%) */}
      <div className="w-full lg:w-[68%] space-y-6">
        
        {/* Add Scenario Menu */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Scenario Builder</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-lg">
            Create a &quot;What If&quot; scenario. Add different events like hiring, marketing, or pricing changes to instantly see how they affect your runway and profit.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {SCENARIO_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button 
                  key={tpl.type} 
                  onClick={() => addBlock(tpl.type)}
                  className="flex flex-col items-start p-4 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 border border-zinc-200 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-800/50 rounded-xl text-left transition-all group"
                >
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{tpl.title}</h3>
                  <p className="text-xs text-zinc-500">{tpl.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* The Scenarios List */}
        {blocks.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
            No events added yet. Select an option above to begin your scenario.
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Connector line between blocks */}
                {index !== blocks.length - 1 && (
                  <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-zinc-200 dark:bg-zinc-800 z-0" />
                )}
                
                {/* Block Header */}
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <span className="text-xs font-bold text-zinc-400">{index + 1}</span>
                    </div>
                    <input 
                      type="text" 
                      value={block.title} 
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      className="bg-transparent text-lg font-bold text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-1 -ml-1 w-full max-w-[200px]"
                    />
                  </div>
                  <button onClick={() => removeBlock(block.id)} className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm bg-transparent border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Block Body - Tailored Calculators */}
                <div className="p-6">
                  {block.type === "hiring" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">How many people?</label>
                        <div className="flex items-center">
                          <button onClick={() => updateBlock<HiringScenario>(block.id, { headcount: Math.max(1, block.headcount - 1) })} className="w-10 h-10 flex items-center justify-center rounded-l-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">-</button>
                          <input type="text" readOnly value={block.headcount} className="w-16 h-10 text-center border-y border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold text-lg" />
                          <button onClick={() => updateBlock<HiringScenario>(block.id, { headcount: block.headcount + 1 })} className="w-10 h-10 flex items-center justify-center rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">+</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Monthly Salary</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₦</span>
                          <input type="text" inputMode="numeric" value={block.salary.toLocaleString("en-US")} onChange={(e) => updateBlock<HiringScenario>(block.id, { salary: parseNum(e.target.value) })} className="w-full h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expected ROI (Revenue/mo)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₦</span>
                          <input type="text" inputMode="numeric" value={block.expectedRevenuePerHire === 0 ? "" : block.expectedRevenuePerHire.toLocaleString("en-US")} placeholder="0" onChange={(e) => updateBlock<HiringScenario>(block.id, { expectedRevenuePerHire: parseNum(e.target.value) })} className="w-full h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow" />
                        </div>
                        <p className="text-[10px] text-zinc-400">Optional: Revenue generated per hire</p>
                      </div>
                    </div>
                  )}

                  {block.type === "marketing" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Monthly Budget</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-lg">₦</span>
                          <input type="text" inputMode="numeric" value={block.budget.toLocaleString("en-US")} onChange={(e) => updateBlock<MarketingScenario>(block.id, { budget: parseNum(e.target.value) })} className="w-full h-14 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow shadow-inner" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expected New Customers</label>
                        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          <Target className="w-8 h-8 text-blue-500" />
                          <input type="number" value={block.expectedCustomers} onChange={(e) => updateBlock<MarketingScenario>(block.id, { expectedCustomers: Number(e.target.value) })} className="w-20 h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                          <span className="text-sm font-medium text-zinc-500">per month</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">Based on ARPU: {formatNaira(currentAvgRevenue)}</p>
                      </div>
                    </div>
                  )}

                  {block.type === "pricing" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                          <span>New Average Price (ARPU)</span>
                          <span className="text-[10px] font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Current: {formatNaira(currentAvgRevenue)}</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-lg">₦</span>
                          <input type="text" inputMode="numeric" value={block.newPrice.toLocaleString("en-US")} onChange={(e) => updateBlock<PricingScenario>(block.id, { newPrice: parseNum(e.target.value) })} className="w-full h-14 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 text-xl font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow shadow-inner" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex justify-between">
                          <span>Expected Customer Churn</span>
                          <span className="text-red-500 font-bold">{block.churnImpact}% loss</span>
                        </label>
                        <input type="range" min="0" max="100" value={block.churnImpact} onChange={(e) => updateBlock<PricingScenario>(block.id, { churnImpact: Number(e.target.value) })} className="w-full accent-red-500" />
                        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                          <span>0% (No one leaves)</span>
                          <span>100% (Everyone leaves)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === "custom" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₦</span>
                          <input type="text" inputMode="numeric" value={block.amount === 0 ? "" : block.amount.toLocaleString("en-US")} placeholder="0" onChange={(e) => updateBlock<CustomScenario>(block.id, { amount: parseNum(e.target.value) })} className="w-full h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Impact Type</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                          <button onClick={() => updateBlock<CustomScenario>(block.id, { isRevenue: true })} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${block.isRevenue ? "bg-white dark:bg-zinc-800 text-green-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>Revenue</button>
                          <button onClick={() => updateBlock<CustomScenario>(block.id, { isRevenue: false })} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${!block.isRevenue ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>Expense</button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Frequency</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                          <button onClick={() => updateBlock<CustomScenario>(block.id, { frequency: "monthly" })} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${block.frequency === "monthly" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>Monthly</button>
                          <button onClick={() => updateBlock<CustomScenario>(block.id, { frequency: "one-time" })} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${block.frequency === "one-time" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>One-time</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Block Footer / Summary */}
                <div className="px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end text-xs font-medium text-zinc-500">
                  {block.type === "hiring" && (
                     <span>Net Impact: <strong className={(block.headcount * block.expectedRevenuePerHire) - (block.headcount * block.salary) >= 0 ? "text-green-600" : "text-red-600"}>{formatNaira((block.headcount * block.expectedRevenuePerHire) - (block.headcount * block.salary))}/mo</strong></span>
                  )}
                  {block.type === "marketing" && (
                     <span>Net Impact: <strong className={(block.expectedCustomers * currentAvgRevenue) - block.budget >= 0 ? "text-green-600" : "text-red-600"}>{formatNaira((block.expectedCustomers * currentAvgRevenue) - block.budget)}/mo</strong></span>
                  )}
                  {block.type === "custom" && (
                     <span>Net Impact: <strong className={block.isRevenue ? "text-green-600" : "text-red-600"}>{block.isRevenue ? "+" : "-"}{formatNaira(block.amount)}{block.frequency === "monthly" ? "/mo" : " once"}</strong></span>
                  )}
                  {block.type === "pricing" && (
                    <span>Net Rev Impact: <strong className={(currentCustomers * (1 - block.churnImpact/100) * block.newPrice) - (currentCustomers * currentAvgRevenue) >= 0 ? "text-green-600" : "text-red-600"}>{((currentCustomers * (1 - block.churnImpact/100) * block.newPrice) - (currentCustomers * currentAvgRevenue) >= 0) ? "+" : ""}{formatNaira((currentCustomers * (1 - block.churnImpact/100) * block.newPrice) - (currentCustomers * currentAvgRevenue))}/mo</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Pane: Sticky Live Impact (32%) */}
      <div className="w-full lg:w-[32%] sticky top-6">
        <div className="bg-zinc-900 dark:bg-black rounded-2xl shadow-xl p-6 overflow-hidden relative text-white border border-zinc-800">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" /> Projected Outcome
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Monthly Revenue</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black">{formatNaira(newRevenue)}</span>
                  {totalMonthlyRevImpact !== 0 && (
                    <span className={`text-sm font-bold pb-1 flex items-center ${totalMonthlyRevImpact > 0 ? "text-green-400" : "text-red-400"}`}>
                      {totalMonthlyRevImpact > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                      {formatNaira(Math.abs(totalMonthlyRevImpact))}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Monthly Expenses</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black">{formatNaira(newExpenses)}</span>
                  {totalMonthlyExpImpact !== 0 && (
                    <span className={`text-sm font-bold pb-1 flex items-center ${totalMonthlyExpImpact > 0 ? "text-red-400" : "text-green-400"}`}>
                      {totalMonthlyExpImpact > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                      {formatNaira(Math.abs(totalMonthlyExpImpact))}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/80">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Projected Net Profit</p>
                <span className={`text-4xl font-black ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatNaira(profit)}
                </span>
                {totalOneTimeCashHit !== 0 && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Plus a one-time cash impact of <span className="text-white font-semibold">{formatNaira(Math.abs(totalOneTimeCashHit))}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800/80">
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Runway</p>
                  <p className="text-2xl font-bold text-white">
                    {newRunway >= 99 ? "24+ mo" : `${newRunway} mo`}
                  </p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Break-even</p>
                  <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                    {newBreakEvenCustomers} <span className="text-xs font-medium text-zinc-400">cust</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
