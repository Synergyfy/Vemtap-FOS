"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown,
  Target, Megaphone, Tag,
  Monitor, Building2, Wrench, Zap, ChevronDown,
  ChevronUp, ArrowRight, BarChart3,
  Briefcase, Laptop, Headphones, Palette,
} from "lucide-react";
import { useBreakEven, useRunway } from "@/lib/hooks/use-pnl";

/* ──────── Constants & Types ──────── */

type Frequency = "one-time" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "one-time", label: "One Time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface IncomeSource { id: string; name: string; amount: number; frequency: Frequency; growth: number; active: boolean; unitPrice?: number; customers?: number }
interface ExpenseSource { id: string; name: string; amount: number; frequency: Frequency; growth: number; active: boolean }

type ScenarioType =
  | "hire-sales" | "hire-developer" | "hire-designer" | "hire-support"
  | "marketing" | "change-pricing" | "new-product" | "enterprise-project"
  | "hardware" | "tech-upgrade" | "office" | "custom";

interface CommissionConfig { type: "fixed" | "percentage"; rate: number }
interface PricingModel {
  silverPrice: number; goldPrice: number; platinumPrice: number; enterprisePrice: number;
  silverCustomers: number; goldCustomers: number; platinumCustomers: number; enterpriseCustomers: number;
}

interface CustomItem { id: string; type: "income" | "expense" | "investment" | "revenue-increase" | "revenue-reduction"; name: string; amount: number; frequency: "monthly" | "one-time" }

type ScenarioParams =
  | { type: "idle" }
  | { type: "hire-sales"; count: number; salary: number; allowance: number; target: number; silverPct: number; goldPct: number; platinumPct: number; enterprisePct: number; commission: CommissionConfig }
  | { type: "hire-developer"; count: number; salary: number }
  | { type: "hire-designer"; count: number; salary: number }
  | { type: "hire-support"; count: number; salary: number }
  | { type: "marketing"; budget: number; duration: number; leads: number; conversionRate: number; businesses: number }
  | { type: "change-pricing"; pricing: PricingModel }
  | { type: "new-product"; devCost: number; launchCost: number; expectedRevenue: number }
  | { type: "enterprise-project"; projectValue: number; duration: number; cost: number }
  | { type: "hardware"; equipmentCost: number; quantity: number }
  | { type: "tech-upgrade"; developers: number; salary: number; aiCosts: number; hostingCosts: number; softwareCosts: number; equipmentCost: number }
  | { type: "office"; rent: number; setupCost: number; utilities: number }
  | { type: "custom"; items: CustomItem[] };

interface ScenarioLineItem {
  id: string;
  name: string;
  type: "revenue" | "expense";
  amount: number;
  frequency: "monthly" | "one-time";
  locked: boolean;
}

interface ScenarioInstance {
  id: string;
  label: string;
  params: ScenarioParams;
  items: ScenarioLineItem[];
}

const SCENARIO_TPL = [
  { type: "hire-sales" as ScenarioType, icon: Briefcase, title: "Hire Sales Person", desc: "Add sales headcount with targets and commission" },
  { type: "hire-developer" as ScenarioType, icon: Laptop, title: "Hire Developer", desc: "Add engineering talent to your team" },
  { type: "hire-designer" as ScenarioType, icon: Palette, title: "Hire Designer", desc: "Bring on design expertise" },
  { type: "hire-support" as ScenarioType, icon: Headphones, title: "Hire Customer Support", desc: "Scale your support team" },
  { type: "marketing" as ScenarioType, icon: Megaphone, title: "Marketing Campaign", desc: "Run ads and acquire customers" },
  { type: "change-pricing" as ScenarioType, icon: Tag, title: "Change Pricing", desc: "Adjust subscription prices and see impact" },
  { type: "new-product" as ScenarioType, icon: Zap, title: "New Product Launch", desc: "Launch a new product or feature" },
  { type: "enterprise-project" as ScenarioType, icon: Target, title: "Enterprise Project", desc: "Model a large client engagement" },
  { type: "hardware" as ScenarioType, icon: Monitor, title: "Hardware Purchase", desc: "Buy equipment or devices" },
  { type: "tech-upgrade" as ScenarioType, icon: Wrench, title: "Technology Upgrade", desc: "Upgrade your tech stack" },
  { type: "office" as ScenarioType, icon: Building2, title: "Office Expansion", desc: "Open or expand office space" },
  { type: "custom" as ScenarioType, icon: BarChart3, title: "Custom Scenario", desc: "Build your own from scratch" },
];

const DEFAULT_PRICING: PricingModel = {
  silverPrice: 8_000, goldPrice: 15_000, platinumPrice: 30_000, enterprisePrice: 100_000,
  silverCustomers: 200, goldCustomers: 100, platinumCustomers: 42, enterpriseCustomers: 10,
};

/* ──────── Helpers ──────── */

const FMT = (v: number) => `₦${Math.round(v).toLocaleString()}`;
const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);

function toMonthly(amount: number, freq: Frequency): number {
  switch (freq) {
    case "one-time": return amount;
    case "daily": return amount * 30;
    case "weekly": return amount * 4.33;
    case "monthly": return amount;
    case "quarterly": return amount / 3;
    case "yearly": return amount / 12;
  }
}

function toAnnual(amount: number, freq: Frequency): number {
  return toMonthly(amount, freq) * 12;
}

/* ──────── Generate line items from scenario params ──────── */

function generateItems(params: ScenarioParams): ScenarioLineItem[] {
  const items: ScenarioLineItem[] = [];
  switch (params.type) {
    case "idle": break;
    case "hire-sales": {
      const silverCx = Math.round(params.target * (params.silverPct / 100));
      const goldCx = Math.round(params.target * (params.goldPct / 100));
      const platinumCx = Math.round(params.target * (params.platinumPct / 100));
      const enterpriseCx = Math.round(params.target * (params.enterprisePct / 100));
      const revenue = silverCx * 8000 + goldCx * 15000 + platinumCx * 30000 + enterpriseCx * 100000;
      let commission = 0;
      if (params.commission.type === "percentage") commission = revenue * (params.commission.rate / 100);
      else commission = params.commission.rate;
      items.push({ id: uid(), name: "Subscription Revenue", type: "revenue", amount: revenue, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Salaries", type: "expense", amount: params.count * params.salary, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Allowances", type: "expense", amount: params.count * params.allowance, frequency: "monthly", locked: true });
      if (commission > 0) items.push({ id: uid(), name: "Commission", type: "expense", amount: commission, frequency: "monthly", locked: true });
      break;
    }
    case "hire-developer":
    case "hire-designer":
    case "hire-support": {
      items.push({ id: uid(), name: "Salaries", type: "expense", amount: params.count * params.salary, frequency: "monthly", locked: true });
      break;
    }
    case "marketing": {
      const avgRev = (8000 + 15000 + 30000) / 3;
      items.push({ id: uid(), name: "Ad Spend", type: "expense", amount: params.budget, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Customer Revenue", type: "revenue", amount: params.businesses * avgRev, frequency: "monthly", locked: true });
      break;
    }
    case "change-pricing": {
      items.push({ id: uid(), name: "Silver Subscriptions", type: "revenue", amount: params.pricing.silverCustomers * params.pricing.silverPrice, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Gold Subscriptions", type: "revenue", amount: params.pricing.goldCustomers * params.pricing.goldPrice, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Platinum Subscriptions", type: "revenue", amount: params.pricing.platinumCustomers * params.pricing.platinumPrice, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Enterprise Subscriptions", type: "revenue", amount: params.pricing.enterpriseCustomers * params.pricing.enterprisePrice, frequency: "monthly", locked: true });
      break;
    }
    case "new-product": {
      items.push({ id: uid(), name: "Product Revenue", type: "revenue", amount: params.expectedRevenue, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Development Cost", type: "expense", amount: params.devCost, frequency: "one-time", locked: true });
      items.push({ id: uid(), name: "Launch Cost", type: "expense", amount: params.launchCost, frequency: "one-time", locked: true });
      break;
    }
    case "enterprise-project": {
      items.push({ id: uid(), name: "Project Revenue", type: "revenue", amount: params.projectValue / params.duration, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Project Cost", type: "expense", amount: params.cost / params.duration, frequency: "monthly", locked: true });
      break;
    }
    case "hardware": {
      items.push({ id: uid(), name: "Equipment Purchase", type: "expense", amount: params.equipmentCost * params.quantity, frequency: "one-time", locked: true });
      break;
    }
    case "tech-upgrade": {
      items.push({ id: uid(), name: "Developer Salaries", type: "expense", amount: params.developers * params.salary, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "AI Costs", type: "expense", amount: params.aiCosts, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Hosting Costs", type: "expense", amount: params.hostingCosts, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Software Costs", type: "expense", amount: params.softwareCosts, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Equipment", type: "expense", amount: params.equipmentCost, frequency: "one-time", locked: true });
      break;
    }
    case "office": {
      items.push({ id: uid(), name: "Office Rent", type: "expense", amount: params.rent, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Utilities", type: "expense", amount: params.utilities, frequency: "monthly", locked: true });
      items.push({ id: uid(), name: "Setup Cost", type: "expense", amount: params.setupCost, frequency: "one-time", locked: true });
      break;
    }
    case "custom": {
      for (const ci of params.items) {
        const isRev = ci.type === "income" || ci.type === "revenue-increase";
        items.push({ id: uid(), name: ci.name || "Custom Item", type: isRev ? "revenue" : "expense", amount: ci.amount, frequency: ci.frequency, locked: true });
      }
      break;
    }
  }
  return items;
}

function defaultParams(type: ScenarioType): ScenarioParams {
  switch (type) {
    case "hire-sales": return { type: "hire-sales", count: 1, salary: 200_000, allowance: 50_000, target: 50, silverPct: 50, goldPct: 30, platinumPct: 15, enterprisePct: 5, commission: { type: "percentage", rate: 5 } };
    case "hire-developer": return { type: "hire-developer", count: 1, salary: 300_000 };
    case "hire-designer": return { type: "hire-designer", count: 1, salary: 250_000 };
    case "hire-support": return { type: "hire-support", count: 1, salary: 150_000 };
    case "marketing": return { type: "marketing", budget: 200_000, duration: 3, leads: 500, conversionRate: 5, businesses: 25 };
    case "change-pricing": return { type: "change-pricing", pricing: { ...DEFAULT_PRICING } };
    case "new-product": return { type: "new-product", devCost: 500_000, launchCost: 300_000, expectedRevenue: 400_000 };
    case "enterprise-project": return { type: "enterprise-project", projectValue: 5_000_000, duration: 6, cost: 2_000_000 };
    case "hardware": return { type: "hardware", equipmentCost: 500_000, quantity: 5 };
    case "tech-upgrade": return { type: "tech-upgrade", developers: 1, salary: 300_000, aiCosts: 50_000, hostingCosts: 100_000, softwareCosts: 80_000, equipmentCost: 300_000 };
    case "office": return { type: "office", rent: 300_000, setupCost: 200_000, utilities: 50_000 };
    case "custom": return { type: "custom", items: [] };
  }
}

function tplTitle(type: ScenarioType): string {
  return SCENARIO_TPL.find((t) => t.type === type)?.title ?? "Scenario";
}

/* ──────── Main Page ──────── */

export default function ScenariosPage() {
  const { data: breakEven } = useBreakEven();
  const { data: runway } = useRunway();

  const [incomes, setIncomes] = useState<IncomeSource[]>(() => [
    { id: uid(), name: "Silver Subscription", amount: 200 * 8000, frequency: "monthly", growth: 0, active: true, unitPrice: 8000, customers: 200 },
    { id: uid(), name: "Gold Subscription", amount: 100 * 15000, frequency: "monthly", growth: 0, active: true, unitPrice: 15000, customers: 100 },
    { id: uid(), name: "Platinum Subscription", amount: 42 * 30000, frequency: "monthly", growth: 0, active: true, unitPrice: 30000, customers: 42 },
    { id: uid(), name: "Enterprise Subscription", amount: 10 * 100000, frequency: "monthly", growth: 0, active: true, unitPrice: 100000, customers: 10 },
  ]);
  const [expenses, setExpenses] = useState<ExpenseSource[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioInstance[]>([]);

  const addScenario = useCallback((type: ScenarioType) => {
    const params = defaultParams(type);
    setScenarios((prev) => [...prev, { id: uid(), label: tplTitle(type), params, items: generateItems(params) }]);
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateParams = useCallback((id: string, params: ScenarioParams) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, params, items: generateItems(params) } : s)));
  }, []);

  const updateItem = useCallback((scenarioId: string, itemId: string, amount: number) => {
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, amount, locked: false } : it)) } : s)));
  }, []);

  const removeItem = useCallback((scenarioId: string, itemId: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s)));
  }, []);

  const addCustomItem = useCallback((scenarioId: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, items: [...s.items, { id: uid(), name: "", type: "expense" as const, amount: 0, frequency: "monthly" as const, locked: false }] } : s)));
  }, []);

  const addIncome = () => setIncomes((prev) => [...prev, { id: uid(), name: "", amount: 0, frequency: "monthly", growth: 0, active: true }]);
  const updateIncome = (id: string, upd: Partial<IncomeSource>) => {
    setIncomes((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const next = { ...i, ...upd };
      if (upd.unitPrice !== undefined || upd.customers !== undefined) {
        const price = upd.unitPrice ?? i.unitPrice ?? 0;
        const cx = upd.customers ?? i.customers ?? 0;
        next.amount = price * cx;
      }
      return next;
    }));
  };
  const removeIncome = (id: string) => setIncomes((prev) => prev.filter((i) => i.id !== id));
  const addExpense = () => setExpenses((prev) => [...prev, { id: uid(), name: "", amount: 0, frequency: "monthly", growth: 0, active: true }]);
  const updateExpense = (id: string, upd: Partial<ExpenseSource>) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...upd } : e)));
  const removeExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  /* ──────── Base financials ──────── */

  const baseIncome = useMemo(() => {
    let monthly = 0, annual = 0;
    for (const inc of incomes) { if (!inc.active) continue; const m = toMonthly(inc.amount, inc.frequency); monthly += m; annual += toAnnual(inc.amount, inc.frequency); }
    return { monthly, annual };
  }, [incomes]);

  const baseExpense = useMemo(() => {
    let monthly = 0, annual = 0;
    for (const exp of expenses) { if (!exp.active) continue; const m = toMonthly(exp.amount, exp.frequency); monthly += m; annual += toAnnual(exp.amount, exp.frequency); }
    return { monthly, annual };
  }, [expenses]);

  const baseNetMonthly = baseIncome.monthly - baseExpense.monthly;

  /* ──────── Scenario totals ──────── */

  const scenarioTotals = useMemo(() => {
    let monthlyRevenue = 0, monthlyExpense = 0, oneTimeRevenue = 0, oneTimeExpense = 0;
    const allItems: { scenarioId: string; scenarioLabel: string; item: ScenarioLineItem }[] = [];
    for (const sc of scenarios) {
      for (const item of sc.items) {
        allItems.push({ scenarioId: sc.id, scenarioLabel: sc.label, item });
        if (item.type === "revenue") { if (item.frequency === "one-time") oneTimeRevenue += item.amount; else monthlyRevenue += item.amount; }
        else { if (item.frequency === "one-time") oneTimeExpense += item.amount; else monthlyExpense += item.amount; }
      }
    }
    return { monthlyRevenue, monthlyExpense, oneTimeRevenue, oneTimeExpense, allItems };
  }, [scenarios]);

  const combined = useMemo(() => {
    const tmi = baseIncome.monthly + scenarioTotals.monthlyRevenue;
    const tme = baseExpense.monthly + scenarioTotals.monthlyExpense;
    const netMonthly = tmi - tme;
    const netAnnual = netMonthly * 12;
    const cashFlow = netMonthly - (scenarioTotals.oneTimeExpense - scenarioTotals.oneTimeRevenue);
    const breakEvenMonths = netMonthly > 0 ? Math.ceil(tme / netMonthly) : 999;
    const tsc = scenarioTotals.monthlyExpense * 12 + scenarioTotals.oneTimeExpense;
    const tsr = scenarioTotals.monthlyRevenue * 12 + scenarioTotals.oneTimeRevenue;
    const roi = tsc > 0 ? ((tsr - tsc) / tsc) * 100 : 0;
    return {
      totalMonthlyIncome: tmi, totalMonthlyExpense: tme, netMonthly, netAnnual, cashFlow, breakEvenMonths, roi,
      revenueIncrease: scenarioTotals.monthlyRevenue,
      expenseIncrease: scenarioTotals.monthlyExpense + (scenarioTotals.oneTimeExpense > 0 ? scenarioTotals.oneTimeExpense / 12 : 0),
      profitDifference: netMonthly - baseNetMonthly,
    };
  }, [baseIncome, baseExpense, scenarioTotals, baseNetMonthly]);

  const verdict = useMemo(() => {
    if (scenarios.length === 0 && incomes.length === 0 && expenses.length === 0)
      return { label: "Set up your business", sub: "Add income and expenses above to see your financial picture", color: "text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" };
    const isProfitable = combined.netMonthly > 0;
    const highRisk = scenarioTotals.monthlyExpense > combined.totalMonthlyIncome * 0.5;
    const recommended = isProfitable && combined.roi > 50;
    if (isProfitable && recommended) return { label: "Recommended", sub: "Strong positive return with manageable risk", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
    if (isProfitable) return { label: "Profitable", sub: "Decision generates positive net income", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" };
    if (combined.netMonthly === 0) return { label: "Break-even", sub: "Revenue covers costs with no surplus", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" };
    if (highRisk) return { label: "High Risk", sub: "Expenses consume more than 50% of income", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };
    return { label: "Not Recommended", sub: "Decision results in a net loss", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };
  }, [scenarios, incomes, expenses, combined, scenarioTotals]);

  /* ──────── Render ──────── */

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" /> Scenarios
        </h1>
        <p className="text-zinc-500">Test business decisions and instantly see the financial impact.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:flex-1 space-y-8">
          {/* ════════ 1. MONEY COMING IN ════════ */}
          <SectionCard icon={TrendingUp} iconColor="text-emerald-500" title="Money Coming In" description="Add all your income sources — subscriptions, sales, consulting, etc.">
            {incomes.map((inc) => (
              <SourceRow key={inc.id} name={inc.name} amount={inc.amount} frequency={inc.frequency} growth={inc.growth} active={inc.active}
                unitPrice={inc.unitPrice} customers={inc.customers}
                onNameChange={(v) => updateIncome(inc.id, { name: v })}
                onAmountChange={(v) => updateIncome(inc.id, { amount: v })}
                onFrequencyChange={(v) => updateIncome(inc.id, { frequency: v })}
                onGrowthChange={(v) => updateIncome(inc.id, { growth: v })}
                onActiveChange={(v) => updateIncome(inc.id, { active: v })}
                onRemove={() => removeIncome(inc.id)}
                onUnitPriceChange={inc.unitPrice !== undefined ? (v) => updateIncome(inc.id, { unitPrice: v }) : undefined}
                onCustomersChange={inc.customers !== undefined ? (v) => updateIncome(inc.id, { customers: v }) : undefined} />
            ))}
            <button onClick={addIncome} className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Income Source
            </button>
          </SectionCard>

          {/* ════════ 2. MONEY GOING OUT ════════ */}
          <SectionCard icon={TrendingDown} iconColor="text-red-500" title="Money Going Out" description="Add all your expenses — salaries, marketing, hosting, rent, etc.">
            {expenses.map((exp) => (
              <SourceRow key={exp.id} name={exp.name} amount={exp.amount} frequency={exp.frequency} growth={exp.growth} active={exp.active}
                onNameChange={(v) => updateExpense(exp.id, { name: v })}
                onAmountChange={(v) => updateExpense(exp.id, { amount: v })}
                onFrequencyChange={(v) => updateExpense(exp.id, { frequency: v })}
                onGrowthChange={(v) => updateExpense(exp.id, { growth: v })}
                onActiveChange={(v) => updateExpense(exp.id, { active: v })}
                onRemove={() => removeExpense(exp.id)} />
            ))}
            <button onClick={addExpense} className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </SectionCard>

          {/* ════════ 3. BUSINESS DECISION ════════ */}
          <SectionCard icon={BarChart3} iconColor="text-blue-500" title="Business Decision" description="What business decision do you want to test?">
            {scenarios.length === 0 ? (
              /* Template grid (no scenarios yet) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIO_TPL.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <button key={tpl.type} onClick={() => addScenario(tpl.type)}
                      className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-zinc-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800/50 rounded-xl text-left transition-all group">
                      <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{tpl.title}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{tpl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {scenarios.map((sc) => (
                  <ScenarioCard
                    key={sc.id}
                    instance={sc}
                    onUpdateParams={(params) => updateParams(sc.id, params)}
                    onRemove={() => removeScenario(sc.id)}
                    onUpdateItem={(itemId, amount) => updateItem(sc.id, itemId, amount)}
                    onRemoveItem={(itemId) => removeItem(sc.id, itemId)}
                    onAddCustomItem={() => addCustomItem(sc.id)}
                  />
                ))}
                <div className="flex gap-3">
                  <AddScenarioButton onSelect={addScenario} />
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ──── Right Column: Results Panel ──── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 sticky top-6">
          <ResultsPanel
            verdict={verdict}
            baseIncome={baseIncome}
            baseExpense={baseExpense}
            combined={combined}
            scenarioItems={scenarioTotals.allItems}
            scenarioCount={scenarios.length}
            runway={runway}
          />
        </div>
      </div>
    </div>
  );
}

/* ──────── SectionCard ──────── */

function SectionCard({ icon: Icon, iconColor, title, description, children }: {
  icon: React.ComponentType<{ className?: string }>; iconColor: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${iconColor}`}><Icon className="w-5 h-5" /></div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ──────── Add Scenario button ──────── */

function AddScenarioButton({ onSelect }: { onSelect: (type: ScenarioType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
        <Plus className="w-4 h-4" /> Add Scenario
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 w-72 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2">
            {SCENARIO_TPL.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button key={tpl.type} onClick={() => { onSelect(tpl.type); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{tpl.title}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ──────── ScenarioCard (restored clean layout + items) ──────── */

function ScenarioCard({
  instance, onUpdateParams, onRemove, onUpdateItem, onRemoveItem, onAddCustomItem,
}: {
  instance: ScenarioInstance;
  onUpdateParams: (p: ScenarioParams) => void;
  onRemove: () => void;
  onUpdateItem: (itemId: string, amount: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddCustomItem: () => void;
}) {
  const [itemsOpen, setItemsOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{instance.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <ChangeScenarioButton currentType={getScenarioType(instance.params)} onSelect={(type) => {
            onUpdateParams(defaultParams(type));
          }} />
          <button onClick={onRemove} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Params form with inline calculated results (clean layout like before) */}
      <div className="px-6 py-5">
        <ScenarioParamsForm params={instance.params} onChange={onUpdateParams} />
      </div>

      {/* Line Items section (editable, transparent) */}
      <div className="px-6 pb-5">
        <button onClick={() => setItemsOpen(!itemsOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-3">
          {itemsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Line Items ({instance.items.length})
        </button>
        {itemsOpen && (
          <div className="space-y-1.5">
            {instance.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.type === "revenue" ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-[11px] text-zinc-400 w-10 shrink-0 font-mono">{item.frequency === "one-time" ? "once" : "mo"}</span>
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{item.name || "Unnamed item"}</span>
                <span className="text-[11px] text-zinc-400 w-14 text-right">{item.type === "revenue" ? "Revenue" : "Expense"}</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[11px]">₦</span>
                  <input type="number" value={item.amount || ""}
                    onChange={(e) => onUpdateItem(item.id, Number(e.target.value))}
                    className={`w-28 h-7 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-4 pr-2 text-xs font-semibold text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${item.type === "revenue" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} />
                </div>
                {!item.locked && (
                  <button onClick={() => onRemoveItem(item.id)} className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {item.locked && <div className="w-5" />}
              </div>
            ))}
            <button onClick={onAddCustomItem}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 mt-3">
              <Plus className="w-3.5 h-3.5" /> Add Custom Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────── Change Scenario button ──────── */

function ChangeScenarioButton({ currentType, onSelect }: { currentType: ScenarioType; onSelect: (t: ScenarioType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
        Change Scenario
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-20 w-56 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2">
            {SCENARIO_TPL.filter((t) => t.type !== currentType).map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button key={tpl.type} onClick={() => { onSelect(tpl.type); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{tpl.title}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function getScenarioType(params: ScenarioParams): ScenarioType {
  return params.type === "idle" ? "custom" : params.type;
}

/* ──────── Scenario params forms with inline results ──────── */

function ScenarioParamsForm({ params, onChange }: { params: ScenarioParams; onChange: (p: ScenarioParams) => void }) {
  switch (params.type) {
    case "idle": return null;
    case "hire-sales": return <HireSalesForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "hire-developer":
    case "hire-designer":
    case "hire-support":
      return <GenericHireForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "marketing": return <MarketingForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "change-pricing": return <PricingForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "new-product": return <NewProductForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "enterprise-project": return <EnterpriseForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "hardware": return <HardwareForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "tech-upgrade": return <TechUpgradeForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "office": return <OfficeForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
    case "custom": return <CustomScenarioForm params={params} onChange={onChange as (p: ScenarioParams) => void} />;
  }
}

/* ──────── Hire Sales ──────── */

function HireSalesForm({ params, onChange }: { params: ScenarioParams & { type: "hire-sales" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const silverCx = Math.round(params.target * (params.silverPct / 100));
  const goldCx = Math.round(params.target * (params.goldPct / 100));
  const platinumCx = Math.round(params.target * (params.platinumPct / 100));
  const enterpriseCx = Math.round(params.target * (params.enterprisePct / 100));
  const revenue = silverCx * 8000 + goldCx * 15000 + platinumCx * 30000 + enterpriseCx * 100000;
  const salaryCost = params.count * params.salary;
  const allowanceCost = params.count * params.allowance;
  let commission = 0;
  if (params.commission.type === "percentage") commission = revenue * (params.commission.rate / 100);
  else commission = params.commission.rate;
  const totalCost = salaryCost + allowanceCost + commission;
  const netProfit = revenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const breakEven = netProfit > 0 ? Math.ceil(totalCost / netProfit) : 999;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Number of Sales People" value={params.count} onChange={(v) => upd({ count: v })} min={1} />
        <Field label="Monthly Salary" value={params.salary} onChange={(v) => upd({ salary: v })} prefix="₦" />
        <Field label="Monthly Allowance" value={params.allowance} onChange={(v) => upd({ allowance: v })} prefix="₦" />
        <Field label="Monthly Target (Businesses)" value={params.target} onChange={(v) => upd({ target: v })} min={1} />
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Expected Subscription Mix</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PctField label="Silver" value={params.silverPct} onChange={(v) => upd({ silverPct: v })} />
          <PctField label="Gold" value={params.goldPct} onChange={(v) => upd({ goldPct: v })} />
          <PctField label="Platinum" value={params.platinumPct} onChange={(v) => upd({ platinumPct: v })} />
          <PctField label="Enterprise" value={params.enterprisePct} onChange={(v) => upd({ enterprisePct: v })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Commission Type</label>
          <select value={params.commission.type}
            onChange={(e) => upd({ commission: { ...params.commission, type: e.target.value as "fixed" | "percentage" } })}
            className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₦)</option>
          </select>
        </div>
        <Field label={params.commission.type === "percentage" ? "Commission Rate (%)" : "Fixed Commission (₦)"}
          value={params.commission.rate} onChange={(v) => upd({ commission: { ...params.commission, rate: v } })}
          suffix={params.commission.type === "percentage" ? "%" : ""} />
      </div>

      {/* Inline results */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Scenario Results</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <ResultItem label="Revenue Generated" value={FMT(revenue)} />
          <ResultItem label="Salary Cost" value={FMT(salaryCost)} color="text-red-500" />
          <ResultItem label="Commission" value={FMT(commission)} color="text-red-500" />
          <ResultItem label="Net Profit" value={FMT(netProfit)} color={netProfit >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="Break-even" value={breakEven < 999 ? `${breakEven} mo` : "N/A"} />
          <ResultItem label="Monthly Profit" value={FMT(netProfit)} color={netProfit >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="Annual Profit" value={FMT(netProfit * 12)} color={netProfit >= 0 ? "text-emerald-600" : "text-red-500"} />
        </div>
      </div>
    </div>
  );
}

/* ──────── Generic Hire ──────── */

function GenericHireForm({ params, onChange }: { params: ScenarioParams & { type: "hire-developer" | "hire-designer" | "hire-support" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const totalCost = params.count * params.salary;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Number of People" value={params.count} onChange={(v) => upd({ count: v })} min={1} />
        <Field label="Monthly Salary" value={params.salary} onChange={(v) => upd({ salary: v })} prefix="₦" />
      </div>
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cost Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ResultItem label="Monthly Cost" value={FMT(totalCost)} color="text-red-500" />
          <ResultItem label="Annual Cost" value={FMT(totalCost * 12)} color="text-red-500" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Marketing ──────── */

function MarketingForm({ params, onChange }: { params: ScenarioParams & { type: "marketing" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const avgRev = (8000 + 15000 + 30000) / 3;
  const cpl = params.leads > 0 ? params.budget / params.leads : 0;
  const cpc = params.businesses > 0 ? params.budget / params.businesses : 0;
  const expectedRev = params.businesses * avgRev;
  const expectedProfit = expectedRev - params.budget;
  const roi = params.budget > 0 ? (expectedProfit / params.budget) * 100 : 0;
  const breakEven = expectedRev > 0 ? Math.ceil(params.budget / expectedRev) : 999;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Marketing Budget (₦)" value={params.budget} onChange={(v) => upd({ budget: v })} prefix="₦" />
        <Field label="Campaign Duration (months)" value={params.duration} onChange={(v) => upd({ duration: v })} min={1} />
        <Field label="Expected Leads" value={params.leads} onChange={(v) => upd({ leads: v })} min={0} />
        <Field label="Conversion Rate (%)" value={params.conversionRate} onChange={(v) => upd({ conversionRate: v })} suffix="%" />
      </div>
      <Field label="Expected Businesses (Customers)" value={params.businesses} onChange={(v) => upd({ businesses: v })} min={0} />

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Results</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <ResultItem label="Cost Per Lead" value={FMT(cpl)} />
          <ResultItem label="Cost Per Customer" value={FMT(cpc)} />
          <ResultItem label="Expected Revenue" value={FMT(expectedRev)} color="text-emerald-600" />
          <ResultItem label="Expected Profit" value={FMT(expectedProfit)} color={expectedProfit >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="Break-even" value={breakEven < 999 ? `${breakEven} mo` : "N/A"} />
        </div>
      </div>
    </div>
  );
}

/* ──────── Change Pricing ──────── */

function PricingForm({ params, onChange }: { params: ScenarioParams & { type: "change-pricing" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const monthlyRevenue =
    params.pricing.silverCustomers * params.pricing.silverPrice +
    params.pricing.goldCustomers * params.pricing.goldPrice +
    params.pricing.platinumCustomers * params.pricing.platinumPrice +
    params.pricing.enterpriseCustomers * params.pricing.enterprisePrice;
  const annualRevenue = monthlyRevenue * 12;
  const oldRev = 200 * 8000 + 100 * 15000 + 42 * 30000 + 10 * 100000;
  const totalCustomers = params.pricing.silverCustomers + params.pricing.goldCustomers + params.pricing.platinumCustomers + params.pricing.enterpriseCustomers;
  const customerValue = totalCustomers > 0 ? monthlyRevenue / totalCustomers : 0;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subscription Prices</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Silver Price" value={params.pricing.silverPrice} onChange={(v) => upd({ pricing: { ...params.pricing, silverPrice: v } })} prefix="₦" />
        <Field label="Gold Price" value={params.pricing.goldPrice} onChange={(v) => upd({ pricing: { ...params.pricing, goldPrice: v } })} prefix="₦" />
        <Field label="Platinum Price" value={params.pricing.platinumPrice} onChange={(v) => upd({ pricing: { ...params.pricing, platinumPrice: v } })} prefix="₦" />
        <Field label="Enterprise Price" value={params.pricing.enterprisePrice} onChange={(v) => upd({ pricing: { ...params.pricing, enterprisePrice: v } })} prefix="₦" />
      </div>
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expected Customers</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Silver Customers" value={params.pricing.silverCustomers} onChange={(v) => upd({ pricing: { ...params.pricing, silverCustomers: v } })} min={0} />
        <Field label="Gold Customers" value={params.pricing.goldCustomers} onChange={(v) => upd({ pricing: { ...params.pricing, goldCustomers: v } })} min={0} />
        <Field label="Platinum Customers" value={params.pricing.platinumCustomers} onChange={(v) => upd({ pricing: { ...params.pricing, platinumCustomers: v } })} min={0} />
        <Field label="Enterprise Customers" value={params.pricing.enterpriseCustomers} onChange={(v) => upd({ pricing: { ...params.pricing, enterpriseCustomers: v } })} min={0} />
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Impact vs Current Pricing</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <ResultItem label="Monthly Revenue" value={FMT(monthlyRevenue)} color="text-emerald-600" />
          <ResultItem label="Annual Revenue" value={FMT(annualRevenue)} color="text-emerald-600" />
          <ResultItem label="Change vs Current" value={`${monthlyRevenue - oldRev >= 0 ? "+" : ""}${FMT(monthlyRevenue - oldRev)}`} color={monthlyRevenue >= oldRev ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="Avg Customer Value" value={FMT(customerValue)} />
        </div>
      </div>
    </div>
  );
}

/* ──────── New Product ──────── */

function NewProductForm({ params, onChange }: { params: ScenarioParams & { type: "new-product" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const totalInvestment = params.devCost + params.launchCost;
  const annualRev = params.expectedRevenue * 12;
  const roi = totalInvestment > 0 ? ((annualRev - totalInvestment) / totalInvestment) * 100 : 0;
  const breakEven = params.expectedRevenue > 0 ? Math.ceil(totalInvestment / params.expectedRevenue) : 999;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Development Cost" value={params.devCost} onChange={(v) => upd({ devCost: v })} prefix="₦" />
        <Field label="Launch Cost" value={params.launchCost} onChange={(v) => upd({ launchCost: v })} prefix="₦" />
        <Field label="Expected Monthly Revenue" value={params.expectedRevenue} onChange={(v) => upd({ expectedRevenue: v })} prefix="₦" />
      </div>
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Projection</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <ResultItem label="Total Investment" value={FMT(totalInvestment)} />
          <ResultItem label="Monthly Revenue" value={FMT(params.expectedRevenue)} color="text-emerald-600" />
          <ResultItem label="Annual Revenue" value={FMT(annualRev)} color="text-emerald-600" />
          <ResultItem label="ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="Break-even" value={breakEven < 999 ? `${breakEven} mo` : "N/A"} />
          <ResultItem label="Cash Impact" value={FMT(-totalInvestment)} color="text-red-500" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Enterprise Project ──────── */

function EnterpriseForm({ params, onChange }: { params: ScenarioParams & { type: "enterprise-project" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const monthlyRev = params.projectValue / params.duration;
  const monthlyCost = params.cost / params.duration;
  const monthlyProfit = monthlyRev - monthlyCost;
  const roi = params.cost > 0 ? ((params.projectValue - params.cost) / params.cost) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Project Value (₦)" value={params.projectValue} onChange={(v) => upd({ projectValue: v })} prefix="₦" />
        <Field label="Duration (months)" value={params.duration} onChange={(v) => upd({ duration: v })} min={1} />
        <Field label="Total Project Cost" value={params.cost} onChange={(v) => upd({ cost: v })} prefix="₦" />
      </div>
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Results</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <ResultItem label="Monthly Revenue" value={FMT(monthlyRev)} color="text-emerald-600" />
          <ResultItem label="Monthly Cost" value={FMT(monthlyCost)} color="text-red-500" />
          <ResultItem label="Monthly Profit" value={FMT(monthlyProfit)} color={monthlyProfit >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="ROI" value={`${roi.toFixed(0)}%`} color={roi >= 0 ? "text-emerald-600" : "text-red-500"} />
        </div>
      </div>
    </div>
  );
}

/* ──────── Hardware Purchase ──────── */

function HardwareForm({ params, onChange }: { params: ScenarioParams & { type: "hardware" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const totalCost = params.equipmentCost * params.quantity;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Equipment Cost (per unit)" value={params.equipmentCost} onChange={(v) => upd({ equipmentCost: v })} prefix="₦" />
        <Field label="Quantity" value={params.quantity} onChange={(v) => upd({ quantity: v })} min={1} />
      </div>
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cost Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ResultItem label="Total Cost" value={FMT(totalCost)} color="text-red-500" />
          <ResultItem label="Type" value="Capital Expenditure" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Technology Upgrade ──────── */

function TechUpgradeForm({ params, onChange }: { params: ScenarioParams & { type: "tech-upgrade" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const monthlyCosts = (params.developers * params.salary) + params.aiCosts + params.hostingCosts + params.softwareCosts;
  const annualCosts = monthlyCosts * 12;
  const totalCash = monthlyCosts * 12 + params.equipmentCost;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Developers to Hire" value={params.developers} onChange={(v) => upd({ developers: v })} min={0} />
        <Field label="Salary per Developer" value={params.salary} onChange={(v) => upd({ salary: v })} prefix="₦" />
        <Field label="AI Costs (monthly)" value={params.aiCosts} onChange={(v) => upd({ aiCosts: v })} prefix="₦" />
        <Field label="Hosting Costs (monthly)" value={params.hostingCosts} onChange={(v) => upd({ hostingCosts: v })} prefix="₦" />
        <Field label="Software Costs (monthly)" value={params.softwareCosts} onChange={(v) => upd({ softwareCosts: v })} prefix="₦" />
        <Field label="Equipment Purchase" value={params.equipmentCost} onChange={(v) => upd({ equipmentCost: v })} prefix="₦" />
      </div>
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cost Breakdown</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <ResultItem label="Monthly Cost" value={FMT(monthlyCosts)} color="text-red-500" />
          <ResultItem label="Annual Cost" value={FMT(annualCosts)} color="text-red-500" />
          <ResultItem label="Revenue Needed (2x)" value={FMT(monthlyCosts * 2)} />
          <ResultItem label="Cash Impact (Year 1)" value={FMT(totalCash)} color="text-red-500" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Office Expansion ──────── */

function OfficeForm({ params, onChange }: { params: ScenarioParams & { type: "office" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const monthlyCosts = params.rent + params.utilities;
  const annualCosts = monthlyCosts * 12 + params.setupCost;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Monthly Rent" value={params.rent} onChange={(v) => upd({ rent: v })} prefix="₦" />
        <Field label="Setup Cost (one-time)" value={params.setupCost} onChange={(v) => upd({ setupCost: v })} prefix="₦" />
        <Field label="Monthly Utilities" value={params.utilities} onChange={(v) => upd({ utilities: v })} prefix="₦" />
      </div>
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cost Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ResultItem label="Monthly Cost" value={FMT(monthlyCosts)} color="text-red-500" />
          <ResultItem label="Annual Cost" value={FMT(annualCosts)} color="text-red-500" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Custom Scenario ──────── */

function CustomScenarioForm({ params, onChange }: { params: ScenarioParams & { type: "custom" }; onChange: (p: ScenarioParams) => void }) {
  const upd = (p: Partial<typeof params>) => onChange({ ...params, ...p });
  const addItem = () => upd({ items: [...params.items, { id: uid(), type: "income" as const, name: "", amount: 0, frequency: "monthly" as const }] });
  const updateItem = (id: string, p2: Partial<CustomItem>) => upd({ items: params.items.map((i) => (i.id === id ? { ...i, ...p2 } : i)) });
  const removeItem = (id: string) => upd({ items: params.items.filter((i) => i.id !== id) });
  const totalMonthly = params.items.reduce((s, i) => {
    const amt = i.frequency === "monthly" ? i.amount : 0;
    const isRev = i.type === "income" || i.type === "revenue-increase";
    return s + (isRev ? amt : -amt);
  }, 0);
  const totalOneTime = params.items.reduce((s, i) => {
    const amt = i.frequency === "one-time" ? i.amount : 0;
    const isRev = i.type === "income" || i.type === "revenue-increase";
    return s + (isRev ? amt : -amt);
  }, 0);

  return (
    <div className="space-y-2">
      {params.items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <select value={item.type} onChange={(e) => updateItem(item.id, { type: e.target.value as CustomItem["type"] })}
            className="h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
            <option value="revenue-increase">Revenue ↑</option>
            <option value="revenue-reduction">Revenue ↓</option>
          </select>
          <input type="text" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })}
            placeholder="Item name" className="flex-1 min-w-[120px] h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          <input type="number" value={item.amount || ""} onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) })}
            placeholder="Amount" className="w-24 h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          <select value={item.frequency} onChange={(e) => updateItem(item.id, { frequency: e.target.value as "monthly" | "one-time" })}
            className="h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="monthly">Monthly</option>
            <option value="one-time">One-time</option>
          </select>
          <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex items-center justify-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add Item
      </button>
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Net Impact</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ResultItem label="Monthly Impact" value={FMT(totalMonthly)} color={totalMonthly >= 0 ? "text-emerald-600" : "text-red-500"} />
          <ResultItem label="One-time Impact" value={FMT(totalOneTime)} color={totalOneTime >= 0 ? "text-emerald-600" : "text-red-500"} />
        </div>
      </div>
    </div>
  );
}

/* ──────── Results Panel ──────── */

function ResultsPanel({
  verdict, baseIncome, baseExpense, combined, scenarioItems, scenarioCount, runway,
}: {
  verdict: { label: string; sub: string; color: string; bg: string };
  baseIncome: { monthly: number; annual: number };
  baseExpense: { monthly: number; annual: number };
  combined: { totalMonthlyIncome: number; totalMonthlyExpense: number; netMonthly: number; netAnnual: number; cashFlow: number; breakEvenMonths: number; roi: number; revenueIncrease: number; expenseIncrease: number; profitDifference: number };
  scenarioItems: { scenarioId: string; scenarioLabel: string; item: ScenarioLineItem }[];
  scenarioCount: number;
  runway: { runwayMonths?: number; closingCashBalance?: number } | null | undefined;
}) {
  const cashMonths = runway?.runwayMonths ?? 12;
  const cashBalance = runway?.closingCashBalance ?? 0;
  const byScenario = useMemo(() => {
    const map = new Map<string, { label: string; items: ScenarioLineItem[] }>();
    for (const si of scenarioItems) {
      if (!map.has(si.scenarioId)) map.set(si.scenarioId, { label: si.scenarioLabel, items: [] });
      map.get(si.scenarioId)!.items.push(si.item);
    }
    return Array.from(map.entries());
  }, [scenarioItems]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className={`p-5 ${verdict.bg} border-b border-zinc-200/50 dark:border-zinc-800/50`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`text-lg font-bold ${verdict.color}`}>{verdict.label}</div>
          {combined.netMonthly > 0 && <TrendingUp className={`w-4 h-4 ${verdict.color}`} />}
          {combined.netMonthly < 0 && <TrendingDown className={`w-4 h-4 ${verdict.color}`} />}
        </div>
        <p className="text-xs text-zinc-500">{verdict.sub}</p>
      </div>

      <div className="p-5 space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Net Profit</p>
          <p className={`text-4xl font-black tracking-tight ${combined.netMonthly >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {FMT(combined.netMonthly)}<span className="text-sm font-medium text-zinc-400 ml-1">/mo</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniCard label="Total Income" value={FMT(combined.totalMonthlyIncome)} color="text-emerald-600" />
          <MiniCard label="Total Expenses" value={FMT(combined.totalMonthlyExpense)} color="text-red-500" />
          <MiniCard label="Annual Profit" value={FMT(combined.netAnnual)} color={combined.netAnnual >= 0 ? "text-emerald-600" : "text-red-500"} />
          <MiniCard label="Cash Flow" value={FMT(combined.cashFlow)} color={combined.cashFlow >= 0 ? "text-emerald-600" : "text-red-500"} />
          <MiniCard label="Break-even" value={combined.breakEvenMonths < 999 ? `${combined.breakEvenMonths} mo` : "N/A"} />
          <MiniCard label="ROI" value={`${combined.roi.toFixed(0)}%`} color={combined.roi >= 0 ? "text-emerald-600" : "text-red-500"} />
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Cash Runway</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{cashMonths >= 24 ? "24+ months" : `${cashMonths} months`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Cash Balance</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{FMT(cashBalance)}</span>
          </div>
        </div>

        {scenarioCount > 0 && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3" /> Scenario Impact ({scenarioCount})
            </p>
            <div className="grid grid-cols-2 gap-2">
              <MiniCard label="Revenue ↑" value={FMT(combined.revenueIncrease)} color="text-emerald-600" />
              <MiniCard label="Expense ↑" value={FMT(combined.expenseIncrease)} color="text-red-500" />
              <MiniCard label="Profit Δ" value={`${combined.profitDifference >= 0 ? "+" : ""}${FMT(combined.profitDifference)}`} color={combined.profitDifference >= 0 ? "text-emerald-600" : "text-red-500"} />
            </div>
            {byScenario.map(([id, { label, items }]) => (
              <div key={id} className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <p className="text-[11px] font-semibold text-zinc-500">{label}</p>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.type === "revenue" ? "bg-emerald-400" : "bg-red-400"}`} />
                      {item.name || "Item"}
                    </span>
                    <span className={`font-semibold ${item.type === "revenue" ? "text-emerald-600" : "text-red-500"}`}>
                      {item.type === "revenue" ? "+" : "-"}{FMT(item.amount)}{item.frequency === "monthly" ? "/mo" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────── Utility Components ──────── */

function SourceRow({ name, amount, frequency, growth, active, unitPrice, customers, onNameChange, onAmountChange, onFrequencyChange, onGrowthChange, onActiveChange, onRemove, onUnitPriceChange, onCustomersChange }: {
  name: string; amount: number; frequency: Frequency; growth: number; active: boolean; unitPrice?: number; customers?: number;
  onNameChange: (v: string) => void; onAmountChange: (v: number) => void; onFrequencyChange: (v: Frequency) => void;
  onGrowthChange: (v: number) => void; onActiveChange: (v: boolean) => void; onRemove: () => void;
  onUnitPriceChange?: (v: number) => void; onCustomersChange?: (v: number) => void;
}) {
  const [open, setOpen] = useState(unitPrice !== undefined && customers !== undefined);
  const monthly = toMonthly(amount, frequency);
  const isSubscription = unitPrice !== undefined && customers !== undefined;
  return (
    <div className={`group rounded-xl border transition-colors ${active ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => onActiveChange(!active)}
          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${active ? "border-emerald-500 bg-emerald-500" : "border-zinc-300 dark:border-zinc-600"}`}>
          {active && <div className="w-2 h-2 rounded-full bg-white" />}
        </button>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Source name"
          className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600" />
        {isSubscription && onCustomersChange && (
          <span className="text-xs text-zinc-400 tabular-nums w-12 text-right">{customers} cx</span>
        )}
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 w-28 text-right tabular-nums">
          {FMT(monthly)}<span className="text-xs text-zinc-400 font-normal">/mo</span>
        </span>
        <span className="text-[11px] text-zinc-400 w-20 text-right capitalize">{frequency}</span>
        <button onClick={() => setOpen(!open)} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={onRemove} className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {isSubscription && onUnitPriceChange && onCustomersChange ? (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Price per Customer</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₦</span>
                    <input type="number" value={unitPrice || ""} onChange={(e) => onUnitPriceChange(Number(e.target.value))}
                      className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-7 pr-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Number of Customers</label>
                  <input type="number" value={customers || ""} onChange={(e) => onCustomersChange(Number(e.target.value))}
                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Total (auto)</label>
                  <div className="w-full h-9 flex items-center px-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {FMT((unitPrice || 0) * (customers || 0))}/mo
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Amount</label>
                <input type="number" value={amount || ""} onChange={(e) => onAmountChange(Number(e.target.value))} placeholder="0"
                  className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => onFrequencyChange(e.target.value as Frequency)}
                className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">Growth (%/mo)</label>
              <input type="number" value={growth || ""} onChange={(e) => onGrowthChange(Number(e.target.value))} placeholder="0"
                className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, min, prefix, suffix }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">{prefix}</span>}
        <input type="number" value={value || ""} onChange={(e) => onChange(min !== undefined ? Math.max(min, Number(e.target.value)) : Number(e.target.value))}
          className={`w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${prefix ? "pl-8" : "pl-3"} pr-3`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function PctField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-0.5">{label} (%)</label>
      <input type="number" value={value || ""} onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
    </div>
  );
}

function ResultItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className={`text-sm font-bold ${color ?? "text-zinc-900 dark:text-zinc-50"}`}>{value}</p>
    </div>
  );
}

function MiniCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
      <p className="text-[11px] font-medium text-zinc-500">{label}</p>
      <p className={`text-base font-bold ${color ?? "text-zinc-900 dark:text-zinc-50"}`}>{value}</p>
    </div>
  );
}
