import Link from "next/link";
import { BarChart3, TrendingUp, DollarSign, LineChart, ArrowRight, Receipt, Target, BookOpen } from "lucide-react";

const financialPages = [
  { title: "Financial Planning", href: "/financial-planning", desc: "Revenue targets, budgets, scenario simulations", icon: BarChart3 },
  { title: "Profit & Loss", href: "/profit-and-loss", desc: "Revenue, COGS, gross profit, OPEX, net profit", icon: TrendingUp },
  { title: "Cash Flow", href: "/cash-flow", desc: "Cash position, movement trends, runway tracking", icon: DollarSign },
  { title: "Forecasting", href: "/forecasting", desc: "Project MRR, expenses, profit, and cash balance", icon: LineChart },
  { title: "Transactions", href: "/transactions", desc: "Unified view of all financial movements", icon: Receipt },
  { title: "Records", href: "/records", desc: "Calendar and ledger-based daily tracking", icon: BookOpen },
  { title: "Goals", href: "/goals", desc: "Revenue targets, project budgets, progress tracking", icon: Target },
] as const;

export default function FinancialsPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Financials</h1>
        <p className="text-zinc-500">Comprehensive financial management and analysis tools.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {financialPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.href} href={page.href}
              className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{page.title}</h2>
              <p className="text-sm text-zinc-500">{page.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
