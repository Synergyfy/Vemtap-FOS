"use client";

import { useState, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  Filter,
  Search,
  PieChart as PieChartIcon,
  X,
  Loader2,
  Repeat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/lib/hooks/use-expenses";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#64748b"];

export default function ExpensesPage() {
  const { data: expensesData, isLoading } = useExpenses({ perPage: 100 });
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [outerTab, setOuterTab] = useState<"expenses" | "payables">("expenses");
  const [activeTab, setActiveTab] = useState<"all" | "recurring">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFrequency, setNewFrequency] = useState("ONE_TIME");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const expenses = useMemo(() => expensesData?.expenses ?? [], [expensesData]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.category)));
  }, [expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newCategory) return;
    try {
      if (editingExpenseId) {
        await updateExpense.mutateAsync({
          id: editingExpenseId,
          data: { category: newCategory, amount: Number(newAmount), frequency: newFrequency },
        });
      } else {
        await createExpense.mutateAsync({
          category: newCategory,
          amount: Number(newAmount),
          frequency: newFrequency,
        });
      }
      setNewAmount(""); setNewCategory(""); setNewDescription(""); setNewFrequency("ONE_TIME");
      setEditingExpenseId(null);
      setIsFormOpen(false);
    } catch {
      // submission failed silently
    }
  };

  const handleEditExpense = (exp: { id: string; category: string; amount: number; frequency: string; description?: string }) => {
    setEditingExpenseId(exp.id);
    setNewAmount(String(exp.amount));
    setNewCategory(exp.category);
    setNewDescription(exp.description ?? "");
    setNewFrequency(exp.frequency);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
    } catch {
      // deletion failed silently
    }
  };

  const { summaryStats, pieData, barData, filteredExpenses } = useMemo(() => {
    let filtered = expenses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const recurringExpenses = expenses.filter((e) => e.frequency === "RECURRING");
    const fixedTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
    const variableTotal = totalExpenses - fixedTotal;

    const categoryMap = new Map<string, number>();
    expenses.forEach((e) => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });
    const pie = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const topCategory = pie.length > 0 ? pie[0].name : "None";

    const bar = expenses.reduce((acc, e) => {
      const month = new Date(e.date).toLocaleString("default", { month: "short" });
      const existing = acc.find((a) => a.month === month);
      if (existing) existing.amount += e.amount;
      else acc.push({ month, amount: e.amount });
      return acc;
    }, [] as { month: string; amount: number }[]);

    const stats = [
      { label: "Total Expenses", value: formatNaira(totalExpenses), icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
      { label: "Fixed Expenses", value: formatNaira(fixedTotal), icon: Repeat, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "Variable Expenses", value: formatNaira(variableTotal), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
      { label: "Recurring", value: recurringExpenses.length.toString(), icon: Clock, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
      { label: "Top Category", value: topCategory, icon: PieChartIcon, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
      { label: "Categories", value: uniqueCategories.length.toString(), icon: Filter, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
    ];

    return { summaryStats: stats, pieData: pie, barData: bar, filteredExpenses: filtered };
  }, [expenses, searchQuery, categoryFilter, uniqueCategories]);

  const recurringExpenses = useMemo(() => {
    return expenses.filter((e) => e.frequency === "RECURRING");
  }, [expenses]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["expenses", "payables"] as const).map((tab) => (
          <button key={tab} onClick={() => setOuterTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              outerTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {tab === "expenses" ? "All Expenses" : "Payables"}
          </button>
        ))}
      </div>

      {outerTab === "expenses" ? (
        <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Expense Overview</h1>
          <p className="text-zinc-500">Monitor outbound cash flow, fixed costs, and operational expenses.</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); if (isFormOpen) { setEditingExpenseId(null); setNewAmount(""); setNewCategory(""); setNewDescription(""); setNewFrequency("ONE_TIME"); } }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors">
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-zinc-500" /> {editingExpenseId ? "Edit Expense" : "Record an Expense"}
          </h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount (₦)</label>
              <input type="number" required min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="50000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <input type="text" required list="categories" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Marketing" />
              <datalist id="categories">
                {uniqueCategories.map((c) => (<option key={c} value={c} />))}
              </datalist>
            </div>
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
              <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What was this for?" />
            </div>
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Frequency</label>
                <select value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ONE_TIME">One Time</option>
                  <option value="RECURRING">Recurring</option>
                </select>
              </div>
              <button type="submit" disabled={createExpense.isPending || updateExpense.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors mt-5 h-[38px]">
                {createExpense.isPending || updateExpense.isPending ? "Saving..." : editingExpenseId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3 transition-all">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["all", "recurring"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {tab === "all" ? "All Expenses" : "Recurring Expenses"}
          </button>
        ))}
      </div>

      {activeTab === "recurring" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-500" /> Recurring Expenses
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Expenses that repeat automatically — salaries, hosting, subscriptions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Frequency</th>
                  <th className="px-6 py-4 font-medium">Next Due</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recurringExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{exp.category}</td>
                    <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-500">-{formatNaira(exp.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        Monthly
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {new Date(exp.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditExpense(exp)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recurringExpenses.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No recurring expenses recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-red-500" /> By Category
            </h2>
            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_: unknown, i: number) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <RechartsTooltip formatter={(value: unknown) => [formatNaira(Number(value)), "Amount"]}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5", fontSize: "12px" }} />
                    <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (<p className="text-sm text-zinc-500">No expenses recorded yet.</p>)}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" /> Monthly Trend
              </h2>
              <div className="h-48 w-full">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v / 1000}k`} tickLine={false} axisLine={false} />
                      <RechartsTooltip formatter={(value: unknown) => [formatNaira(Number(value)), "Amount"]} />
                      <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<div className="w-full h-full flex items-center justify-center text-zinc-500">No data</div>)}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">All Expenses</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none sm:w-48">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer">
                    <option value="All">All Categories</option>
                    {uniqueCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Frequency</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium text-right">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500 text-xs">
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">{exp.category}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                            {exp.frequency}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-red-600 dark:text-red-500">
                          -{formatNaira(exp.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Paid
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditExpense(exp)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No expenses found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-blue-500" /> Payables
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Track and manage what you owe to vendors, suppliers, and service providers.
        </p>
        <a href="/payables"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          Manage Payables <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )}
    </div>
  );
}
