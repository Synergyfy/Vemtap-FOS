"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Copy, TrendingUp, TrendingDown, Equal,
  Percent, Target, Wallet, Zap, Sparkles,
} from "lucide-react";
import type { SimpleScenario, ScenarioItem, ItemComponent, ScenarioResult, ScenarioTemplate, Operator } from "./types";
import { projectScenario, computeComponents } from "./engine";

const COMMA = (v: number) => v.toLocaleString("en-US");
const FMT = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` :
  v >= 1_000 ? `₦${(v / 1_000).toFixed(1)}k` :
  `₦${COMMA(v)}`;
const uid = () => Math.random().toString(36).slice(2, 10);

const LS = <T,>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try { return JSON.parse(localStorage.getItem(`plan_${key}`) || "null") ?? fallback; }
    catch { return fallback; }
  });
  useEffect(() => { localStorage.setItem(`plan_${key}`, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
};

function newComponent(): ItemComponent {
  return { id: uid(), name: "", value: 0, isPercent: false, operator: "×" };
}

function newItem(): ScenarioItem {
  return {
    id: uid(), name: "", components: [newComponent(), newComponent()],
    type: "expense", itemPeriod: null, growthRate: 0,
  };
}

function newScenario(name: string): SimpleScenario {
  return {
    id: uid(), name, period: 1, items: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

const TEMPLATES: ScenarioTemplate[] = [
  {
    name: "Hire Sales Team",
    description: "3 reps × ₦200k salary each + ₦3M expected revenue",
    items: [
      { name: "Sales Rep Salaries", components: [{ name: "People", value: 3, isPercent: false, operator: "×" }, { name: "Salary p/person", value: 200_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Expected Revenue", components: [{ name: "Monthly Revenue", value: 3_000_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 0 },
    ],
  },
  {
    name: "Commission Plan",
    description: "₦2M revenue with 5% commission cost",
    items: [
      { name: "Monthly Revenue", components: [{ name: "Revenue", value: 2_000_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 0 },
      { name: "Commission (5%)", components: [{ name: "Revenue Base", value: 2_000_000, isPercent: false, operator: "×" }, { name: "Rate", value: 5, isPercent: true, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
    ],
  },
  {
    name: "Marketing Campaign",
    description: "₦500k ads + ₦800k lead revenue growing 5%/mo",
    items: [
      { name: "Ad Spend", components: [{ name: "Monthly Budget", value: 500_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Lead Revenue", components: [{ name: "Revenue", value: 800_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 5 },
    ],
  },
  {
    name: "Subscription Tiers",
    description: "Silver/Gold/Platinum — change prices, staff & ads",
    items: [
      { name: "Silver (200 × ₦8k)", components: [{ name: "Customers", value: 200, isPercent: false, operator: "×" }, { name: "Price p/m", value: 8_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 2 },
      { name: "Gold (100 × ₦15k)", components: [{ name: "Customers", value: 100, isPercent: false, operator: "×" }, { name: "Price p/m", value: 15_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 3 },
      { name: "Platinum (42 × ₦30k)", components: [{ name: "Customers", value: 42, isPercent: false, operator: "×" }, { name: "Price p/m", value: 30_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 4 },
      { name: "Support Staff", components: [{ name: "Staff", value: 3, isPercent: false, operator: "×" }, { name: "Salary p/person", value: 250_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Marketing Ads", components: [{ name: "Monthly Spend", value: 500_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Infrastructure", components: [{ name: "Monthly Cost", value: 350_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
    ],
  },
  {
    name: "Commission Restructuring",
    description: "Current 15% vs new 20% on ₦2.8M with 12% sales boost",
    items: [
      { name: "Revenue Base", components: [{ name: "Monthly Revenue", value: 2_800_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 5 },
      { name: "Current Commission (15%)", components: [{ name: "Revenue", value: 2_800_000, isPercent: false, operator: "×" }, { name: "Rate", value: 15, isPercent: true, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "New Commission (20%)", components: [{ name: "Revenue", value: 2_800_000, isPercent: false, operator: "×" }, { name: "Rate", value: 20, isPercent: true, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Sales Boost (12%)", components: [{ name: "Revenue", value: 2_800_000, isPercent: false, operator: "×" }, { name: "Boost", value: 12, isPercent: true, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 0 },
    ],
  },
  {
    name: "Break-even Analysis",
    description: "₦1.2M fixed + variable unit costs vs unit revenue",
    items: [
      { name: "Fixed Costs", components: [{ name: "Monthly", value: 1_200_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Variable Costs", components: [{ name: "Units", value: 500, isPercent: false, operator: "×" }, { name: "Cost per Unit", value: 100, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Product Revenue", components: [{ name: "Units Sold", value: 500, isPercent: false, operator: "×" }, { name: "Price per Unit", value: 8_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 0 },
    ],
  },
  {
    name: "New Office Setup",
    description: "₦500k rent + ₦200k utilities + ₦1.5M one-time setup",
    items: [
      { name: "Office Rent", components: [{ name: "Monthly", value: 500_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Utilities", components: [{ name: "Monthly", value: 200_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: null, growthRate: 0 },
      { name: "Setup Cost", components: [{ name: "One-time", value: 1_500_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: 1, growthRate: 0 },
    ],
  },
  {
    name: "Product Launch",
    description: "₦1M R&D (3mo) + ₦500k launch (2mo) + ₦2M revenue growing 8%/mo",
    items: [
      { name: "R&D Cost", components: [{ name: "Monthly", value: 1_000_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: 3, growthRate: 0 },
      { name: "Launch Marketing", components: [{ name: "Monthly", value: 500_000, isPercent: false, operator: "×" }], type: "expense", itemPeriod: 2, growthRate: 0 },
      { name: "Product Revenue", components: [{ name: "Monthly", value: 2_000_000, isPercent: false, operator: "×" }], type: "revenue", itemPeriod: null, growthRate: 8 },
    ],
  },
];

export default function DecisionSimulator() {
  const [scenarios, setScenarios] = LS<SimpleScenario[]>("scenarios", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const active = scenarios.find((s) => s.id === activeId) ?? null;
  const result: ScenarioResult | null = active ? projectScenario(active) : null;

  const setActive = (updates: Partial<SimpleScenario>) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
  };

  const addScenario = () => {
    const sc = newScenario(`Scenario ${scenarios.length + 1}`);
    setScenarios((prev) => [sc, ...prev]);
    setActiveId(sc.id);
  };

  const loadTemplate = (template: ScenarioTemplate) => {
    const items: ScenarioItem[] = template.items.map((item) => ({
      ...item,
      id: uid(),
      components: item.components.map((c) => ({ ...c, id: uid() })),
    }));
    const sc: SimpleScenario = {
      id: uid(), name: template.name, period: 1, items,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setScenarios((prev) => [sc, ...prev]);
    setActiveId(sc.id);
  };

  const deleteScenario = (id: string) => {
    if (!confirm("Delete this scenario?")) return;
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next.length > 0 ? next[0].id : null);
      return next;
    });
  };

  const duplicateScenario = (sc: SimpleScenario) => {
    const dup: SimpleScenario = {
      ...sc, id: uid(), name: `${sc.name} (Copy)`,
      items: sc.items.map((i) => ({ ...i, id: uid(), components: i.components.map((c) => ({ ...c, id: uid() })) })),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setScenarios((prev) => [dup, ...prev]);
    setActiveId(dup.id);
  };

  const addItem = () => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? { ...s, items: [...s.items, newItem()], updatedAt: new Date().toISOString() } : s));
  };

  const updateItem = (itemId: string, updates: Partial<ScenarioItem>) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? {
      ...s, items: s.items.map((i) => i.id === itemId ? { ...i, ...updates } : i), updatedAt: new Date().toISOString(),
    } : s));
  };

  const removeItem = (itemId: string) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? {
      ...s, items: s.items.filter((i) => i.id !== itemId), updatedAt: new Date().toISOString(),
    } : s));
  };

  const addComponent = (itemId: string) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? {
      ...s, items: s.items.map((i) => i.id === itemId ? { ...i, components: [...i.components, newComponent()] } : i), updatedAt: new Date().toISOString(),
    } : s));
  };

  const updateComponent = (itemId: string, compId: string, updates: Partial<ItemComponent>) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? {
      ...s, items: s.items.map((i) => i.id === itemId ? { ...i, components: i.components.map((c) => c.id === compId ? { ...c, ...updates } : c) } : i), updatedAt: new Date().toISOString(),
    } : s));
  };

  const removeComponent = (itemId: string, compId: string) => {
    if (!activeId) return;
    setScenarios((prev) => prev.map((s) => s.id === activeId ? {
      ...s, items: s.items.map((i) => i.id === itemId ? { ...i, components: i.components.filter((c) => c.id !== compId) } : i), updatedAt: new Date().toISOString(),
    } : s));
  };

  const applyToBudget = () => {
    if (!result || !active) return;
    const budgetItems = active.items.map((item) => {
      const ir = result.itemResults.find((r) => r.id === item.id);
      return {
        id: uid(),
        category: item.type === "revenue" ? "Revenue" : "Other",
        item: item.name || "From Scenario",
        planned: ir?.totalAmount ?? 0,
        actual: 0,
        notes: `From scenario: ${active.name}`,
      };
    });
    const existing = JSON.parse(localStorage.getItem("plan_budget_items") || "[]");
    localStorage.setItem("plan_budget_items", JSON.stringify([...budgetItems, ...existing]));
    const cats = JSON.parse(localStorage.getItem("plan_budget_cats") || "[]");
    const newCats = [...new Set([...cats, ...budgetItems.map((i) => i.category)])];
    localStorage.setItem("plan_budget_cats", JSON.stringify(newCats));
    alert(`Added ${budgetItems.length} item(s) to Budget. Open the Budget tab to view.`);
  };

  const applyToGoal = () => {
    if (!result || !active) return;
    const label = result.net >= 0 ? "Profit" : "Loss";
    const goal = {
      id: uid(),
      category: result.net >= 0 ? "profit" : "other",
      title: `${active.name} — Net ${label}`,
      target: Math.abs(result.net),
      current: 0,
      deadline: "",
      notes: `Created from scenario: ${active.name}`,
    };
    const existing = JSON.parse(localStorage.getItem("plan_goals_v2") || "[]");
    localStorage.setItem("plan_goals_v2", JSON.stringify([goal, ...existing]));
    alert(`Goal "${goal.title}" added. Open the Goals tab to view.`);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Scenarios</h3>
              <span className="text-[10px] text-zinc-400">{scenarios.length}</span>
            </div>
          </div>
          <div className="p-2 space-y-0.5 max-h-[40vh] overflow-y-auto">
            <button onClick={addScenario}
              title="Create a blank scenario to start modelling from scratch"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mb-2">
              <Plus className="w-3.5 h-3.5" /> New Scenario
            </button>
            {scenarios.length === 0 ? (
              <p className="text-[11px] text-zinc-400 text-center py-4">No scenarios yet</p>
            ) : (
              scenarios.map((sc) => (
                <div key={sc.id}
                  className={`group flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeId === sc.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent"
                  }`}
                  onClick={() => setActiveId(sc.id)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">{sc.name}</p>
                    <p className="text-[10px] text-zinc-400">{sc.items.length} items · {sc.period}mo</p>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); duplicateScenario(sc); }}
                      title="Duplicate this scenario"
                      className="p-1 text-zinc-400 hover:text-blue-500 rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteScenario(sc.id); }}
                      title="Delete this scenario permanently"
                      className="p-1 text-zinc-400 hover:text-red-500 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Templates
            </h3>
          </div>
          <div className="p-2 space-y-0.5 max-h-[30vh] overflow-y-auto">
            {TEMPLATES.map((t) => (
              <button key={t.name} onClick={() => loadTemplate(t)}
                title={`Load template: ${t.description}`}
                className="w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 min-w-0 space-y-4">
        {!active ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Equal className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm mb-2">No scenario selected</p>
            <p className="text-xs mb-4">Create a new scenario or load a template from the sidebar</p>
            <button onClick={addScenario}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> New Scenario
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <input type="text" value={active.name}
                    onChange={(e) => setActive({ name: e.target.value })}
                    className="text-lg font-bold text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full"
                    title="Scenario name — click to edit" />
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-zinc-500" title="Set how many months this scenario runs for">Period:</label>
                      <input type="number" min={1} max={120} value={active.period}
                        onChange={(e) => setActive({ period: Math.max(1, Math.min(120, Number(e.target.value) || 1)) })}
                        title="Duration of this scenario in months"
                        className="w-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center" />
                      <span className="text-[10px] text-zinc-400">month{active.period !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{active.items.length} item{active.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => duplicateScenario(active)}
                    title="Duplicate this scenario"
                    className="p-1.5 text-zinc-400 hover:text-blue-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteScenario(active.id)}
                    title="Delete this scenario permanently"
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Line Items</h3>
              </div>

              {active.items.length === 0 ? (
                <div className="text-center py-8 text-sm text-zinc-400">
                  <p className="mb-3">No items yet. Add items to calculate revenue and expenses for this scenario.</p>
                  <button onClick={addItem}
                    title="Add your first line item"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {active.items.map((item) => (
                    <ItemRow key={item.id} item={item} scenarioPeriod={active.period}
                      onChange={(updates) => updateItem(item.id, updates)}
                      onRemove={() => removeItem(item.id)}
                      onAddComponent={() => addComponent(item.id)}
                      onUpdateComponent={(compId, updates) => updateComponent(item.id, compId, updates)}
                      onRemoveComponent={(compId) => removeComponent(item.id, compId)} />
                  ))}
                  <button onClick={addItem}
                    title="Add another line item to this scenario"
                    className="w-full py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-400 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    + Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            {result && active.items.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Results ({active.period} month{active.period !== 1 ? "s" : ""})
                  </h3>
                  {active.items.some((i) => i.growthRate !== 0 || i.itemPeriod !== null) && (
                    <button onClick={() => setShowBreakdown(!showBreakdown)}
                      title={showBreakdown ? "Hide the month-by-month breakdown table" : "Show a month-by-month breakdown of how totals are calculated"}
                      className="text-[10px] text-blue-500 hover:text-blue-600">
                      {showBreakdown ? "Hide breakdown" : "Monthly breakdown"}
                    </button>
                  )}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Revenue</p>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{FMT(result.totalRevenue)}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">Total Expenses</p>
                    </div>
                    <p className="text-lg font-bold text-red-500">{FMT(result.totalExpenses)}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${
                    result.net >= 0
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Equal className={`w-4 h-4 ${result.net >= 0 ? "text-green-500" : "text-red-500"}`} />
                      <p className={`text-xs font-medium ${result.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.net >= 0 ? "Net Profit" : "Net Loss"}
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${result.net >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {result.net >= 0 ? "" : "-"}{FMT(Math.abs(result.net))}
                    </p>
                  </div>
                </div>

                {/* Item breakdown table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="text-left py-2 pr-2 font-medium">Item</th>
                        <th className="text-right px-2 py-2 font-medium">Monthly</th>
                        <th className="text-right px-2 py-2 font-medium">Period</th>
                        <th className="text-right px-2 py-2 font-medium">Total</th>
                        <th className="text-right pl-2 py-2 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.itemResults.map((ir) => {
                        const item = active.items.find((i) => i.id === ir.id);
                        const displayPeriod = item?.itemPeriod ?? active.period;
                        return (
                          <tr key={ir.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                            <td className="py-2 pr-2 text-zinc-900 dark:text-zinc-50 font-medium">{ir.name || "Unnamed"}</td>
                            <td className={`text-right px-2 py-2 ${ir.type === "revenue" ? "text-blue-500" : "text-red-500"}`}>{FMT(ir.monthlyAmount)}</td>
                            <td className="text-right px-2 py-2 text-zinc-400">{displayPeriod}mo{item?.growthRate ? ` · +${item.growthRate}%/mo` : ""}</td>
                            <td className={`text-right px-2 py-2 font-medium ${ir.type === "revenue" ? "text-blue-500" : "text-red-500"}`}>{FMT(ir.totalAmount)}</td>
                            <td className={`text-right pl-2 py-2 capitalize ${ir.type === "revenue" ? "text-blue-500" : "text-red-500"}`}>{ir.type}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-200 dark:border-zinc-700 font-bold">
                        <td className="py-2 pr-2 text-zinc-900 dark:text-zinc-50">Net</td>
                        <td className="text-right px-2 py-2 text-zinc-900 dark:text-zinc-50">{FMT(result.itemResults.reduce((s, i) => s + (i.type === "revenue" ? i.monthlyAmount : -i.monthlyAmount), 0))}</td>
                        <td className="text-right px-2 py-2"></td>
                        <td className={`text-right px-2 py-2 ${result.net >= 0 ? "text-green-500" : "text-red-500"}`}>{FMT(result.net)}</td>
                        <td className="text-right pl-2 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Apply To dropdown */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-medium">Apply to:</span>
                  <button onClick={applyToBudget}
                    title="Send revenue items to Budget and expenses to Other category in the Budget tab"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                    <Wallet className="w-3.5 h-3.5" /> Budget
                  </button>
                  <button onClick={applyToGoal}
                    title="Create a new goal from this scenario's net profit/loss result"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                    <Target className="w-3.5 h-3.5" /> Goal
                  </button>
                </div>

                {/* Monthly detail breakdown */}
                {showBreakdown && result.itemResults.some((ir) => ir.breakdown.length > 0) && (
                  <div className="mt-4 overflow-x-auto">
                    <p className="text-[10px] font-medium text-zinc-500 mb-2">Monthly Detail</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                          <th className="text-left py-1.5 pr-2 font-medium">Month</th>
                          {result.itemResults.map((ir) => (
                            <th key={ir.id} className={`text-right px-1.5 py-1.5 font-medium ${ir.type === "revenue" ? "text-blue-400" : "text-red-400"}`}>{ir.name || "Item"}</th>
                          ))}
                          <th className="text-right pl-1.5 py-1.5 font-medium text-zinc-500">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: active.period }, (_, mi) => mi + 1).map((m) => {
                          const rowTotal = result.itemResults.reduce((s, ir) => {
                            const b = ir.breakdown.find((b) => b.month === m);
                            const amt = b?.amount ?? ir.monthlyAmount;
                            return s + (ir.type === "revenue" ? amt : -amt);
                          }, 0);
                          return (
                            <tr key={m} className="border-b border-zinc-100 dark:border-zinc-800/50">
                              <td className="py-1 pr-2 text-zinc-500">Month {m}</td>
                              {result.itemResults.map((ir) => {
                                const b = ir.breakdown.find((b) => b.month === m);
                                const amt = b?.amount ?? ir.monthlyAmount;
                                return (
                                  <td key={ir.id} className={`text-right px-1.5 py-1 ${ir.type === "revenue" ? "text-blue-500" : "text-red-500"}`}>
                                    {b ? FMT(amt) : "—"}
                                  </td>
                                );
                              })}
                              <td className={`text-right pl-1.5 py-1 font-medium ${rowTotal >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {FMT(rowTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Item Card — professional calculator / questionnaire style          */
/* ================================================================== */

interface ItemRowProps {
  item: ScenarioItem;
  scenarioPeriod: number;
  // eslint-disable-next-line no-unused-vars
  onChange(updates: Partial<ScenarioItem>): void;
  onRemove(): void;
  onAddComponent(): void;
  // eslint-disable-next-line no-unused-vars
  onUpdateComponent(compId: string, updates: Partial<ItemComponent>): void;
  // eslint-disable-next-line no-unused-vars
  onRemoveComponent(compId: string): void;
}

function ItemRow({ item, scenarioPeriod, onChange, onRemove, onAddComponent, onUpdateComponent, onRemoveComponent }: ItemRowProps) {
  const parsed = (raw: string) => {
    const clean = raw.replace(/[,₦\s]/g, "");
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  };

  const monthlyAmount = computeComponents(item.components);

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden relative">
      <button onClick={onRemove}
        title="Remove this item"
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 bg-white/80 dark:bg-zinc-900/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg w-max shrink-0">
              <button onClick={() => onChange({ type: "revenue" })}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  item.type === "revenue"
                    ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}>
                Revenue
              </button>
              <button onClick={() => onChange({ type: "expense" })}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  item.type === "expense"
                    ? "bg-white dark:bg-zinc-700 text-red-500 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}>
                Expense
              </button>
            </div>
            <input type="text" value={item.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Event Name (e.g. Sales Team Salary)"
              className="flex-1 bg-transparent border-none text-xl font-bold text-zinc-900 dark:text-zinc-50 focus:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 px-0" />
          </div>

           <div className="space-y-2">
            {item.components.map((comp, idx) => (
              <div key={comp.id} className="flex items-center gap-2 group/factor">
                {idx > 0 && (
                  <select value={comp.operator || "×"} onChange={(e) => onUpdateComponent(comp.id, { operator: e.target.value as Operator })} 
                    className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold px-1.5 py-1 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center w-8"
                    title="Calculation operator">
                    <option value="+">+</option>
                    <option value="-">−</option>
                    <option value="×">×</option>
                    <option value="÷">÷</option>
                  </select>
                )}
                {idx === 0 && <span className="w-8 shrink-0" />}
                <input type="text" value={comp.name}
                  onChange={(e) => onUpdateComponent(comp.id, { name: e.target.value })}
                  placeholder={idx === 0 ? "Quantity" : "Rate"}
                  title="Label this factor — what does this number represent?"
                  className="w-24 shrink-0 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400 placeholder:normal-case placeholder:tracking-normal placeholder:font-medium" />
                <span className="text-zinc-300 dark:text-zinc-600 text-xs font-mono shrink-0">=</span>
                <input type="text" inputMode="numeric" value={COMMA(comp.value)}
                  onChange={(e) => onUpdateComponent(comp.id, { value: parsed(e.target.value) })}
                  title="Enter the value for this factor"
                  className="w-28 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" />
                <button onClick={() => onUpdateComponent(comp.id, { isPercent: !comp.isPercent })}
                  title={comp.isPercent ? "Currently a Percentage. Click to switch to Number" : "Currently a Number. Click to switch to Percentage"}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                    comp.isPercent ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
                  }`}>
                  <Percent className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onRemoveComponent(comp.id)}
                  title="Remove this factor"
                  className="p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover/factor:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={onAddComponent}
              title="Add another factor to this calculation — all factors are multiplied (or combined) together"
              className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 hover:text-blue-600 pl-10 mt-1">
              <Plus className="w-3 h-3" /> Add Factor
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Duration</label>
                <input type="number" min={1} max={120} value={item.itemPeriod ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange({ itemPeriod: v === "" ? null : Math.max(1, Number(v)) });
                  }}
                  placeholder={String(scenarioPeriod)}
                  title={`Number of months this item applies. Leave blank to use the scenario's ${scenarioPeriod}-month period.`}
                  className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-50 font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400" />
                <span className="text-[11px] text-zinc-400">months</span>
                <span className="text-[10px] text-zinc-400">(blank = scenario period)</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Growth</label>
                <input type="text" inputMode="decimal" value={item.growthRate || ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    onChange({ growthRate: v === "" ? 0 : Number(v) });
                  }}
                  placeholder="0"
                  title="Monthly growth rate — e.g. 10 means the amount grows 10% larger each month (compounding). 0 = fixed amount every month."
                  className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-50 font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400" />
                <span className="text-[11px] text-zinc-400">% / month</span>
                <span className="text-[10px] text-zinc-400">(0 = fixed)</span>
              </div>
            </div>
        </div>

        <div className={`flex flex-col justify-center items-center p-6 md:w-64 shrink-0 transition-colors ${
            item.type === "revenue" ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-red-50/50 dark:bg-red-900/10"
        }`}>
          <div className="text-center w-full">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Monthly Impact</p>
            <div className={`text-3xl font-black tracking-tight break-all ${
              item.type === "revenue" ? "text-blue-600 dark:text-blue-400" : "text-red-500"
            }`}>
              {FMT(monthlyAmount)}
            </div>
            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              item.type === "revenue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }`}>
              {item.type === "revenue" ? "Revenue" : "Expense"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
