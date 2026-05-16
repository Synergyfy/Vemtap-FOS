"use client";

import { useState, useMemo } from "react";
import { 
  Receipt, 
  TrendingDown, 
  Clock, 
  CheckCircle2,
  Plus,
  Filter,
  Search,
  PieChart as PieChartIcon,
  X
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
  CartesianGrid
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- MOCK DATA ---
const initialExpenses = [
  { id: "EXP-001", amount: 450000, category: "Agent Commissions", description: "March payout cycle", status: "Paid", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "EXP-002", amount: 125000, category: "Software & API", description: "AWS Hosting", status: "Paid", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "EXP-003", amount: 350000, category: "Marketing", description: "Meta Ads Q2", status: "Pending", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "EXP-004", amount: 85000, category: "Software & API", description: "Twilio SMS API", status: "Paid", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "EXP-005", amount: 200000, category: "Office & Admin", description: "Internet & Power", status: "Paid", date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "EXP-006", amount: 150000, category: "Agent Commissions", description: "Bonus payouts", status: "Pending", date: new Date().toISOString() },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#64748b'];

export default function ExpensesPage() {
  
  // --- STATE ---
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Form State
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState("Paid");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Extract unique categories dynamically
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)));
  }, [expenses]);

  // Handle Form Submit
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newCategory || !newDescription) return;

    const newExpense = {
      id: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      amount: Number(newAmount),
      category: newCategory,
      description: newDescription,
      status: newStatus,
      date: new Date(newDate).toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    
    // Reset form
    setNewAmount("");
    setNewCategory("");
    setNewDescription("");
    setNewStatus("Paid");
    setIsFormOpen(false);
  };

  // Calculate dynamic metrics & data
  const { summaryStats, pieData, filteredExpenses } = useMemo(() => {
    let filtered = expenses;

    // Filters
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") filtered = filtered.filter(e => e.category === categoryFilter);
    if (statusFilter !== "All") filtered = filtered.filter(e => e.status === statusFilter);

    // Summary Calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPending = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = expenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + e.amount, 0);
    
    // Pie Chart Data (Category Breakdown)
    const categoryMap = new Map();
    expenses.forEach(e => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });
    
    const pie = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const topCategory = pie.length > 0 ? pie[0].name : "None";

    const stats = [
      { label: "Total Tracked Expenses", value: formatNaira(totalExpenses), icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
      { label: "Total Paid", value: formatNaira(totalPaid), icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Total Pending", value: formatNaira(totalPending), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
      { label: "Top Expense Category", value: topCategory, icon: PieChartIcon, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
    ];

    return { summaryStats: stats, pieData: pie, filteredExpenses: filtered };
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Expense Tracker</h1>
          <p className="text-zinc-500">Monitor outbound cash flow, agent commissions, and operational costs.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : "Log New Expense"}
        </button>
      </div>

      {/* DYNAMIC EXPENSE FORM */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-500" /> Record a Transaction
          </h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount (₦)</label>
              <input 
                type="number" required min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <input 
                type="text" required list="categories" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type or select..."
              />
              <datalist id="categories">
                {uniqueCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
              <input 
                type="text" required value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What was this for?"
              />
            </div>

            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select 
                  value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors mt-5 h-[38px]">
                Save
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EXPENSE BREAKDOWN CHART */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-red-500" /> Expense Breakdown
          </h2>
          
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => [formatNaira(Number(value)), "Amount"]}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500">No expenses recorded yet.</p>
            )}
          </div>
        </div>

        {/* EXPENSE LEDGER TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Expense Ledger</h2>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-48">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select 
                value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{expense.description}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(expense.date).toLocaleDateString()} • {expense.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                        ${expense.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-red-600 dark:text-red-500">
                      -{formatNaira(expense.amount)}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                      No expenses found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
}
