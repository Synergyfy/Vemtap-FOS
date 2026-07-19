"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  List,
  Search,
  Trash2,
} from "lucide-react";
import { useRevenueTransactions } from "@/lib/hooks/use-revenue";
import { useExpenses } from "@/lib/hooks/use-expenses";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarEntry {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
}

type ViewMode = "calendar" | "ledger";

export default function RecordsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formType, setFormType] = useState<"Income" | "Expense">("Expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [customEntries, setCustomEntries] = useState<CalendarEntry[]>([]);
  const [ledgerTab, setLedgerTab] = useState<"all" | "income" | "expenses">("all");

  const { data: revenueData, isLoading: revLoading } = useRevenueTransactions({ perPage: 200 });
  const { data: expensesData, isLoading: expLoading } = useExpenses({ perPage: 200 });

  const apiEntries = useMemo(() => {
    const items: CalendarEntry[] = [];

    (revenueData?.transactions ?? []).forEach((t) => {
      items.push({ id: `rev-${t.id}`, date: t.date, type: "Income", category: t.type, description: t.businessName || "Revenue", amount: t.amount });
    });

    (expensesData?.expenses ?? []).forEach((e) => {
      items.push({ id: `exp-${e.id}`, date: e.date, type: "Expense", category: e.category, description: e.category, amount: e.amount });
    });

    return items;
  }, [revenueData, expensesData]);

  const allEntries = useMemo(() => [...apiEntries, ...customEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [apiEntries, customEntries]);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    allEntries.forEach((entry) => {
      const existing = map.get(entry.date) ?? [];
      existing.push(entry);
      map.set(entry.date, existing);
    });
    return map;
  }, [allEntries]);

  const dailySummary = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    allEntries.forEach((entry) => {
      const summary = map.get(entry.date) ?? { income: 0, expense: 0 };
      if (entry.type === "Income") summary.income += entry.amount;
      else summary.expense += entry.amount;
      map.set(entry.date, summary);
    });
    return map;
  }, [allEntries]);

  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formCategory) return;
    const entry: CalendarEntry = {
      id: `custom-${Date.now()}`,
      date: formDate,
      type: formType,
      category: formCategory,
      description: formDescription || formCategory,
      amount: Number(formAmount),
    };
    setCustomEntries((prev) => [...prev, entry]);
    setFormAmount("");
    setFormCategory("");
    setFormDescription("");
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    setCustomEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const filteredEntries = useMemo(() => {
    let items = allEntries;
    if (ledgerTab === "income") items = items.filter((e) => e.type === "Income");
    if (ledgerTab === "expenses") items = items.filter((e) => e.type === "Expense");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((e) => e.category.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return items;
  }, [allEntries, ledgerTab, searchQuery]);

  const totalIncome = allEntries.filter((e) => e.type === "Income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = allEntries.filter((e) => e.type === "Expense").reduce((s, e) => s + e.amount, 0);

  const today = new Date().toISOString().split("T")[0];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 sm:h-28" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const summary = dailySummary.get(dateStr);
      const income = summary?.income ?? 0;
      const expense = summary?.expense ?? 0;
      const net = income - expense;
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;

      let bgClass = "hover:bg-zinc-50 dark:hover:bg-zinc-800/50";
      if (isSelected) bgClass = "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500";
      else if (net > 0 && income > 0) bgClass = "bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20";
      else if (expense > 0 && income === 0) bgClass = "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20";

      cells.push(
        <button
          key={dateStr}
          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
          className={`h-24 sm:h-28 p-1.5 border border-zinc-100 dark:border-zinc-800 text-left transition-colors cursor-pointer flex flex-col ${bgClass}`}
        >
          <span className={`text-xs font-medium mb-0.5 ${isToday ? "bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center" : "text-zinc-500"}`}>
            {day}
          </span>
          {income > 0 && (
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 leading-tight">
              +{formatNaira(income)}
            </span>
          )}
          {expense > 0 && (
            <span className="text-[10px] font-semibold text-red-500 leading-tight">
              -{formatNaira(expense)}
            </span>
          )}
          {income > 0 && expense > 0 && (
            <span className="text-[10px] font-medium text-zinc-400 leading-tight">
              ={formatNaira(net)}
            </span>
          )}
        </button>,
      );
    }

    return cells;
  };

  const isLoading = revLoading || expLoading;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" /> Financial Records
          </h1>
          <p className="text-sm text-zinc-500">Track income, expenses, and daily cash flow.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddForm(true); setFormDate(today); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button onClick={() => setViewMode("calendar")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${viewMode === "calendar" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("ledger")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${viewMode === "ledger" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Income</p>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatNaira(totalIncome)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Expenses</p>
          <h3 className="text-xl font-bold text-red-500 mt-1">{formatNaira(totalExpenses)}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Net Balance</p>
          <h3 className={`text-xl font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {formatNaira(totalIncome - totalExpenses)}
          </h3>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">New Record</h2>
            <button onClick={() => setShowAddForm(false)} className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormType("Expense")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${formType === "Expense" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  Expense
                </button>
                <button type="button" onClick={() => setFormType("Income")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${formType === "Income" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  Income
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Amount (₦)</label>
              <input type="number" required value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Category</label>
              <input type="text" required value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g. Salary, Food, Transport" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Description</label>
              <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional note" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Date</label>
              <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 lg:col-span-5 flex gap-2 pt-2">
              <button type="submit" disabled={!formAmount || !formCategory} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Add Record
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === "calendar" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <button onClick={handlePrevMonth} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={handleNextMonth} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
            {DAYS.map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Ledger Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              {(["all", "income", "expenses"] as const).map((tab) => (
                <button key={tab} onClick={() => setLedgerTab(tab)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${ledgerTab === tab ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search records..." className="w-full sm:w-64 pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredEntries.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No records found. Start by adding an income or expense.</td></tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-3 text-zinc-500 font-mono text-xs">{entry.date}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${entry.type === "Income" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {entry.type === "Income" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-50">{entry.category}</td>
                      <td className="px-6 py-3 text-zinc-500 text-xs">{entry.description}</td>
                      <td className={`px-6 py-3 text-right font-semibold ${entry.type === "Income" ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        {entry.type === "Income" ? "+" : "-"}{formatNaira(entry.amount)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {entry.id.startsWith("custom-") && (
                          <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Day Panel */}
      {selectedDate && viewMode === "calendar" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowAddForm(true); setFormDate(selectedDate); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button onClick={() => setSelectedDate(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No records for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${entry.type === "Income" ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-500"}`}>
                      {entry.type === "Income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{entry.category}</p>
                      <p className="text-xs text-zinc-500">{entry.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${entry.type === "Income" ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {entry.type === "Income" ? "+" : "-"}{formatNaira(entry.amount)}
                    </span>
                    {entry.id.startsWith("custom-") && (
                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
