"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wallet, TrendingUp, Target,
  Plus, Trash2, Check, Edit3, BarChart3, Info,
} from "lucide-react";

/* ================================================================== */
/*  Constants & helpers                                                */
/* ================================================================== */

const COMMA = (v: number) => v.toLocaleString("en-US");
const uid = () => Math.random().toString(36).slice(2, 10);
// eslint-disable-next-line no-unused-vars
const LS = <T,>(key: string, fallback: T): [T, (_v: T) => void] => {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try { return JSON.parse(localStorage.getItem(`plan_${key}`) || "null") ?? fallback; }
    catch { return fallback; }
  });
  useEffect(() => { localStorage.setItem(`plan_${key}`, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
};

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="group relative inline-flex items-center" title={text}>
    {children}
    <Info className="w-3 h-3 ml-1 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-help shrink-0" />
  </span>
);

/* ================================================================== */
/*  Reusable inputs                                                    */
/* ================================================================== */

// eslint-disable-next-line no-unused-vars
type NumOnChange = (_v: number) => void;

function NumInput({ label, value, onChange, prefix, suffix, tip, className }: {
  label: string; value: number; onChange: NumOnChange; prefix?: string; suffix?: string; tip?: string; className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const display = focused ? String(value) : value.toLocaleString("en-US");
  return (
    <div className={className}>
      <label className="text-xs text-zinc-500 block mb-1">
        {tip ? <Tooltip text={tip}>{label}</Tooltip> : label}
      </label>
      <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2">
        {prefix && <span className="text-xs text-zinc-400 mr-1">{prefix}</span>}
        <input type="text" inputMode="numeric" value={display}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[,₦\s]/g, "");
            const n = raw === "" ? 0 : Number(raw);
            if (!isNaN(n)) onChange(n);
          }}
          className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none" />
        {suffix && <span className="text-xs text-zinc-400 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step, suffix, color, tip }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string; color?: string; tip?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-zinc-500">{tip ? <Tooltip text={tip}>{label}</Tooltip> : label}</label>
        <span className={`text-xs font-bold ${color ?? "text-zinc-700 dark:text-zinc-300"}`}>
          {step && step < 1 ? value.toFixed(1) : value.toLocaleString("en-US")}{suffix ?? ""}
        </span>
      </div>
      <input type="range" className="w-full accent-blue-500" min={min} max={max} step={step ?? 1}
        value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function SelectInput({ label, value, onChange, options, tip }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; tip?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{tip ? <Tooltip text={tip}>{label}</Tooltip> : label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function EditableCell({ value, onChange, prefix }: { value: number; onChange: (v: number) => void; prefix?: string }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(COMMA(value));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);
  const commit = () => {
    const raw = text.replace(/[,₦\s]/g, "");
    const n = raw === "" ? 0 : Number(raw);
    if (!isNaN(n)) onChange(n);
    setText(COMMA(n));
    setEditing(false);
  };
  return editing ? (
    <input ref={inputRef} type="text" value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setText(COMMA(value)); setEditing(false); } }}
      className="w-full bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-zinc-50 text-xs text-right px-1.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
  ) : (
    <span className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-1.5 py-1 rounded block text-right text-xs"
      onClick={() => { setText(COMMA(value)); setEditing(true); }}>
      {prefix}{COMMA(value)}
    </span>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

type Tab = "budget" | "forecast" | "goals";

export default function PlanningPage() {
  const [tab, setTab] = useState<Tab>("budget");
  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; tip: string }[] = [
    { id: "budget", label: "Budget", icon: Wallet, tip: "Create and manage your budget with line items, categories, planned vs actual tracking" },
    { id: "forecast", label: "Forecast", icon: TrendingUp, tip: "Project future revenue, costs and profit across multiple business aspects" },
    { id: "goals", label: "Goals", icon: Target, tip: "Set and track financial goals with progress monitoring" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Planning</h1>
        <p className="text-zinc-500 text-sm">Budget planning, multi-aspect forecasting, scenario modeling, and goal tracking.</p>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              title={t.tip}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "budget" && <BudgetTab />}
      {tab === "forecast" && <ForecastTab />}
      {tab === "goals" && <GoalsTab />}
    </div>
  );
}

/* ================================================================== */
/*  BUDGET TAB — Custom categories, comma-formatted, tooltips          */
/* ================================================================== */

const DEFAULT_CATS = ["Revenue", "Salaries & Wages", "Commissions", "Marketing", "Operations", "Technology", "Office & Admin", "Other"];

interface BudgetItem { id: string; category: string; item: string; planned: number; actual: number; notes: string; }

function BudgetTab() {
  const [customCats, setCustomCats] = LS<string[]>("budget_cats", DEFAULT_CATS);
  const allCategories = [...new Set([...customCats])];
  const [items, setItems] = LS<BudgetItem[]>("budget_items", [
    { id: uid(), category: "Revenue", item: "Subscription Revenue", planned: 2_800_000, actual: 0, notes: "" },
    { id: uid(), category: "Revenue", item: "SMS Revenue", planned: 950_000, actual: 0, notes: "" },
    { id: uid(), category: "Salaries & Wages", item: "Staff Salaries", planned: 1_200_000, actual: 0, notes: "" },
    { id: uid(), category: "Commissions", item: "Agent Commissions", planned: 420_000, actual: 0, notes: "" },
    { id: uid(), category: "Marketing", item: "Digital Ads", planned: 175_000, actual: 0, notes: "" },
    { id: uid(), category: "Operations", item: "Termii SMS Gateway", planned: 420_000, actual: 0, notes: "" },
    { id: uid(), category: "Technology", item: "Server & Hosting", planned: 85_000, actual: 0, notes: "" },
    { id: uid(), category: "Office & Admin", item: "Office Rent", planned: 350_000, actual: 0, notes: "" },
  ]);
  const [newCat, setNewCat] = useState("");

  const addCategory = () => {
    const c = newCat.trim();
    if (c && !allCategories.includes(c)) { setCustomCats([...customCats, c]); setNewCat(""); }
  };
  const deleteCategory = (c: string) => {
    if (DEFAULT_CATS.includes(c)) return;
    setCustomCats(customCats.filter((x) => x !== c));
  };

  const addItem = () => setItems([...items, { id: uid(), category: allCategories[0] || "Other", item: "", planned: 0, actual: 0, notes: "" }]);
  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => setItems(items.map((i) => i.id === id ? { ...i, [field]: value } : i));
  const deleteItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);
  const variance = totalActual - totalPlanned;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Planned</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">₦{COMMA(totalPlanned)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Actual</p>
          <h3 className="text-xl font-bold text-blue-500 mt-1">₦{COMMA(totalActual)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Variance</p>
          <h3 className={`text-xl font-bold mt-1 ${variance >= 0 ? "text-green-500" : "text-red-500"}`}>
            {variance >= 0 ? "+" : ""}₦{COMMA(Math.abs(variance))}
          </h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Line Items</p>
          <h3 className="text-xl font-bold text-purple-500 mt-1">{items.length}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-500" /> Budget Spreadsheet
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)}
                placeholder="New category..."
                title="Type a custom category name and click Add to create it"
                className="w-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400"
                onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }} />
              <button onClick={addCategory}
                title="Add a new custom category to the category dropdown list"
                className="px-2 py-1.5 text-xs font-medium text-white bg-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button onClick={addItem}
              title="Add a new empty line item to the budget spreadsheet"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left py-3 pl-5 pr-3 font-medium w-36" title="Revenue category for this budget line">Category</th>
                <th className="text-left px-3 py-3 font-medium" title="Name or description of the budget item">Item</th>
                <th className="text-right px-3 py-3 font-medium w-32" title="Budgeted amount for this line item">Planned (₦)</th>
                <th className="text-right px-3 py-3 font-medium w-32" title="Actual amount spent or received for this line item">Actual (₦)</th>
                <th className="text-right px-3 py-3 font-medium w-28" title="Difference between actual and planned (Actual − Planned)">Variance (₦)</th>
                <th className="text-left px-3 py-3 font-medium" title="Optional notes or comments about this budget line">Notes</th>
                <th className="w-12" title="Delete this line item"> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const rowVar = row.actual - row.planned;
                return (
                  <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2 pl-5 pr-3">
                      <select value={row.category} onChange={(e) => updateItem(row.id, "category", e.target.value)}
                        title="Assign this item to a category. Add new categories using the field above the spreadsheet."
                        className="w-full bg-transparent text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none">
                        {allCategories.map((c) => (
                          <option key={c} value={c}>{c}
                            {customCats.includes(c) && !DEFAULT_CATS.includes(c) ? " ★" : ""}</option>
                        ))}
                      </select>
                      {customCats.includes(row.category) && !DEFAULT_CATS.includes(row.category) && (
                        <button onClick={() => deleteCategory(row.category)}
                          title='Remove this custom category. Items using it will keep the category name but it will no longer appear in the dropdown for new items.'
                          className="text-[10px] text-red-400 hover:text-red-600 mt-0.5 block">Remove category</button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.item} onChange={(e) => updateItem(row.id, "item", e.target.value)}
                        placeholder="Enter item name..."
                        title="Describe what this budget item is for"
                        className="w-full bg-transparent text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none placeholder:text-zinc-400" />
                    </td>
                    <td className="px-3 py-2">
                      <EditableCell value={row.planned} onChange={(v) => updateItem(row.id, "planned", v)} />
                    </td>
                    <td className="px-3 py-2">
                      <EditableCell value={row.actual} onChange={(v) => updateItem(row.id, "actual", v)} />
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${rowVar >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {rowVar >= 0 ? "+" : ""}{COMMA(rowVar)}
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={row.notes} onChange={(e) => updateItem(row.id, "notes", e.target.value)}
                        placeholder="—" title="Optional note about this budget item"
                        className="w-full bg-transparent text-zinc-500 text-xs focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600" />
                    </td>
                    <td className="py-2 pr-3">
                      <button onClick={() => deleteItem(row.id)}
                        title="Delete this budget line item permanently"
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 font-medium">
                <td className="py-3 pl-5 pr-3 text-zinc-900 dark:text-zinc-50">Total</td>
                <td className="px-3 py-3 text-zinc-500">{items.length} items</td>
                <td className="px-3 py-3 text-right text-zinc-900 dark:text-zinc-50">₦{COMMA(totalPlanned)}</td>
                <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400">₦{COMMA(totalActual)}</td>
                <td className={`px-3 py-3 text-right ${variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {variance >= 0 ? "+" : ""}{COMMA(variance)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Budget by Category</h3>
        <div className="space-y-2">
          {allCategories.filter((c) => items.some((i) => i.category === c)).map((cat) => {
            const planned = items.filter((i) => i.category === cat).reduce((s, i) => s + i.planned, 0);
            const actual = items.filter((i) => i.category === cat).reduce((s, i) => s + i.actual, 0);
            const pct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-700 dark:text-zinc-300">{cat}
                    {customCats.includes(cat) && !DEFAULT_CATS.includes(cat) && <span className="text-[10px] text-zinc-400 ml-1">(custom)</span>}
                  </span>
                  <span className="text-zinc-500">₦{COMMA(actual)} / ₦{COMMA(planned)}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FORECAST TAB — Multi-aspect forecasting                           */
/* ================================================================== */

interface AspectForecast {
  id: string;
  label: string;
  baseValue: number;
  growthRate: number;
  color: string;
}

const DEFAULT_ASPECTS: AspectForecast[] = [
  { id: "sales", label: "Sales Revenue", baseValue: 2_847_500, growthRate: 12, color: "blue" },
  { id: "commission", label: "Commission Cost", baseValue: 425_600, growthRate: 10, color: "amber" },
  { id: "salaries", label: "Salaries & Benefits", baseValue: 1_200_000, growthRate: 5, color: "red" },
  { id: "operations", label: "Operations", baseValue: 855_000, growthRate: 4, color: "purple" },
  { id: "marketing", label: "Marketing", baseValue: 175_000, growthRate: 8, color: "pink" },
  { id: "other", label: "Other Costs", baseValue: 230_000, growthRate: 3, color: "zinc" },
];

function ForecastTab() {
  const [aspects, setAspects] = LS<AspectForecast[]>("fc_aspects", DEFAULT_ASPECTS);
  const [period, setPeriod] = useState(12);

  const toggleAspect = (id: string) => {
    if (aspects.some((a) => a.id === id)) {
      setAspects(aspects.filter((a) => a.id !== id));
    } else {
      const def = DEFAULT_ASPECTS.find((a) => a.id === id);
      if (def) setAspects([...aspects, def]);
    }
  };

  const updateAspect = (id: string, field: keyof AspectForecast, value: number) =>
    setAspects(aspects.map((a) => a.id === id ? { ...a, [field]: value } : a));

  const allRows: { month: string; m: number; netProfit: number; [key: string]: number | string }[] = Array.from({ length: period }, (_, i) => {
    const m = i + 1;
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const aspectVals: Record<string, number> = {};
    aspects.forEach((a) => {
      const factor = 1 + (a.growthRate / 100) * (m / 12);
      aspectVals[a.id] = Math.round(a.baseValue * factor);
    });
    const revenue = aspectVals["sales"] || 0;
    const totalCosts = ["commission", "salaries", "operations", "marketing", "other"]
      .reduce((s, id) => s + (aspectVals[id] || 0), 0);
    return { month: label, m, ...aspectVals, netProfit: revenue - totalCosts } as { month: string; m: number; netProfit: number; [key: string]: number | string };
  });

  const totals = {
    revenue: allRows.reduce((s, r) => s + Number(r["sales"] || 0), 0),
    costs: allRows.reduce((s, r) => s + (["commission", "salaries", "operations", "marketing", "other"].reduce((s2, id) => s2 + Number(r[id] || 0), 0)), 0),
    profit: allRows.reduce((s, r) => s + Number(r["netProfit"] || 0), 0),
  };

  const maxVal = Math.max(...allRows.map((r) => Math.max(Number(r["sales"] || 0), (Number(r["commission"] || 0)) + (Number(r["salaries"] || 0)) + (Number(r["operations"] || 0)) + (Number(r["marketing"] || 0)) + (Number(r["other"] || 0)), Number(r["netProfit"] || 0))), 1);

  const ASPECT_OPTIONS = [...DEFAULT_ASPECTS];
  const enabledIds = aspects.map((a) => a.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500" title="Projected total sales revenue over the forecast period">Total Revenue</p>
          <h3 className="text-xl font-bold text-blue-500 mt-1">₦{COMMA(totals.revenue)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500" title="Projected total costs (commission + salaries + operations + marketing + other)">Total Costs</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">₦{COMMA(totals.costs)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500" title="Projected net profit (revenue minus all costs)">Net Profit</p>
          <h3 className={`text-xl font-bold mt-1 ${totals.profit >= 0 ? "text-green-500" : "text-red-500"}`}>₦{COMMA(totals.profit)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500" title="Projected profit margin percentage">Margin</p>
          <h3 className="text-xl font-bold text-purple-500 mt-1">{totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Forecast Aspects
          </h3>
          <div className="mb-4">
            <SliderInput label="Forecast Period" value={period} onChange={(v) => { if (v >= 1) setPeriod(v); }}
              min={1} max={60} suffix=" months" tip="How many months into the future to project. Any number from 1 to 60." />
          </div>
          <div className="space-y-2">
            {ASPECT_OPTIONS.map((a) => {
              const on = enabledIds.includes(a.id);
              return (
                <label key={a.id} className="flex items-center gap-2 cursor-pointer"
                  title={`${on ? "Disable" : "Enable"} forecasting for ${a.label}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleAspect(a.id)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">{a.label}</span>
                </label>
              );
            })}
          </div>
          {aspects.map((a) => (
            <div key={a.id} className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{a.label}</p>
              <NumInput label="Monthly Value" value={a.baseValue} onChange={(v) => updateAspect(a.id, "baseValue", v)}
                prefix="₦" tip={`Current monthly ${a.label.toLowerCase()} amount`} />
              <SliderInput label="Growth Rate" value={a.growthRate} onChange={(v) => updateAspect(a.id, "growthRate", v)}
                min={-20} max={50} suffix="%" tip={`Monthly growth rate for ${a.label.toLowerCase()}. Negative values mean decline.`} />
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Projection Chart</h3>
            <div className="flex items-end gap-[2px]" style={{ height: 180 }}>
              {allRows.map((r, i) => {
                const rev = Number(r["sales"]) || 0;
                const h = (rev / maxVal) * 170;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full bg-blue-500/30 dark:bg-blue-400/20 rounded-t transition-all"
                      style={{ height: `${Math.max(h, 1)}px` }} title={`${r.month}: ₦${COMMA(rev)}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-zinc-400">
              {allRows.filter((_, i) => i % Math.max(1, Math.floor(period / 6)) === 0).map((r) => (
                <span key={r.m}>{r.month}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500/30" /> Sales Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/30" /> Commissions</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/30" /> Salaries</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500/30" /> Operations</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-500/30" /> Marketing</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500/30" /> Net Profit</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Monthly Detail</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left py-2 pl-5 pr-3 font-medium" title="Forecast month">Month</th>
                    {aspects.map((a) => (
                      <th key={a.id} className="text-right px-2 py-2 font-medium capitalize" title={`Projected ${a.label.toLowerCase()} for this month`}>
                        {a.label.split(" ")[0]}
                      </th>
                    ))}
                    <th className="text-right pr-5 pl-2 py-2 font-medium" title="Revenue minus all costs for this month">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((r, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50">
                      <td className="py-1.5 pl-5 pr-3 text-zinc-900 dark:text-zinc-50 font-medium">{r.month}</td>
                      {aspects.map((a) => {
                        const val = Number(r[a.id]) || 0;
                        const isCost = a.id !== "sales";
                        return (
                          <td key={a.id} className={`text-right px-2 py-1.5 ${isCost ? "text-red-500" : "text-blue-600 dark:text-blue-400"}`}>
                            ₦{COMMA(val)}
                          </td>
                        );
                      })}
                      <td className={`text-right pr-5 pl-2 py-1.5 font-medium ${Number(r.netProfit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        ₦{COMMA(Number(r.netProfit))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GOALS TAB — Tooltips added                                         */
/* ================================================================== */

interface Goal { id: string; category: string; title: string; target: number; current: number; deadline: string; notes: string; }

const GOAL_CATEGORIES = [
  { value: "sales", label: "Sales" },
  { value: "commissions", label: "Commissions" },
  { value: "salaries", label: "Salaries" },
  { value: "profit", label: "Profit" },
  { value: "businesses", label: "Businesses" },
  { value: "agents", label: "Agents" },
  { value: "other", label: "Other" },
];

function GoalsTab() {
  const [goals, setGoals] = LS<Goal[]>("goals_v2", [
    { id: uid(), category: "sales", title: "Monthly Sales Target", target: 3_500_000, current: 2_847_500, deadline: "", notes: "Based on Q3 growth projections" },
    { id: uid(), category: "profit", title: "Net Profit Target", target: 1_500_000, current: 1_423_750, deadline: "", notes: "Minimum 40% margin" },
    { id: uid(), category: "businesses", title: "Reach 400 Businesses", target: 400, current: 342, deadline: "", notes: "Target end of Q3" },
    { id: uid(), category: "agents", title: "Grow Agent Network to 35", target: 35, current: 28, deadline: "", notes: "" },
  ]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Goal>({ id: "", category: "other", title: "", target: 0, current: 0, deadline: "", notes: "" });
  const [showNew, setShowNew] = useState(false);

  const openEdit = (g: Goal) => { setEditForm({ ...g }); setEditing(g.id); };
  const closeEdit = () => { setEditing(null); setShowNew(false); };
  const saveEdit = () => {
    if (!editForm.title.trim()) return;
    if (editing) setGoals(goals.map((g) => g.id === editing ? editForm : g));
    else setGoals([{ ...editForm, id: uid() }, ...goals]);
    closeEdit();
  };
  const deleteGoal = (id: string) => { if (confirm("Delete this goal?")) setGoals(goals.filter((g) => g.id !== id)); };
  const startNew = () => {
    setEditForm({ id: "", category: "other", title: "", target: 0, current: 0, deadline: "", notes: "" });
    setEditing("new"); setShowNew(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500" title="Goals you've created to track financial targets">{goals.length} goals</p>
        {!showNew && <button onClick={startNew}
          title="Create a new goal to track a financial or business target"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Goal
        </button>}
      </div>

      {showNew && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">New Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1" title="A short descriptive name for your goal">Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Goal title..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder:text-zinc-400" />
            </div>
            <SelectInput label="Category" value={editForm.category}
              onChange={(v) => setEditForm({ ...editForm, category: v })}
              options={GOAL_CATEGORIES.map((c) => c.value)}
              tip="What area this goal belongs to — Sales, Commissions, Salaries, Profit, etc." />
            <NumInput label="Target" value={editForm.target} onChange={(v) => setEditForm({ ...editForm, target: v })}
              prefix="₦" tip="The target value you want to achieve" />
            <NumInput label="Current" value={editForm.current} onChange={(v) => setEditForm({ ...editForm, current: v })}
              prefix="₦" tip="Where you currently stand against this target" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit}
              title="Save this goal to your list. All goals persist in your browser."
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Check className="w-3.5 h-3.5" /> Save Goal
            </button>
            <button onClick={closeEdit}
              className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {goals.length === 0 && !showNew ? (
        <div className="p-12 text-center text-sm text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          No goals set yet. Click <span className="font-medium text-green-500">New Goal</span> to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
            const cat = GOAL_CATEGORIES.find((c) => c.value === g.category);
            const statusColor = pct >= 80 ? "text-green-500" : pct >= 40 ? "text-amber-500" : "text-red-500";
            const barColor = pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={g.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                {editing === g.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <NumInput label="Target" value={editForm.target} onChange={(v) => setEditForm({ ...editForm, target: v })} prefix="₦" />
                      <NumInput label="Current" value={editForm.current} onChange={(v) => setEditForm({ ...editForm, current: v })} prefix="₦" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} title="Save changes to this goal"
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded"><Check className="w-3 h-3" /> Save</button>
                      <button onClick={closeEdit} className="px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          g.category === "sales" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                          g.category === "profit" ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                          g.category === "businesses" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" :
                          g.category === "agents" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" :
                          g.category === "commissions" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                          g.category === "salaries" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                          "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`} title={`Category: ${cat?.label || g.category}`}>{cat?.label || g.category}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(g)} title="Edit this goal's target, current value, and other settings" className="p-1 text-zinc-400 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteGoal(g.id)} title="Permanently delete this goal" className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1" title={g.notes || g.title}>{g.title}</h4>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500" title="Current progress">₦{COMMA(g.current)}</span>
                      <span className="text-zinc-400" title="Target value">₦{COMMA(g.target)}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1"
                      title={`${pct}% complete — ${pct >= 80 ? "On track" : pct >= 40 ? "At risk" : "Behind schedule"}`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className={`font-medium ${statusColor}`}>{pct}% complete</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
