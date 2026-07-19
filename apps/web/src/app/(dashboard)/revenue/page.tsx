"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Receipt, Percent, Building2, GitBranch,
  ArrowRight, BarChart3,
} from "lucide-react";

type Tab = "analytics" | "receivables" | "commission" | "businesses";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "receivables", label: "Receivables", icon: Receipt },
  { id: "commission", label: "Commission", icon: Percent },
  { id: "businesses", label: "Businesses", icon: Building2 },
];

const PAGES: Record<Tab, { href: string; desc: string; metrics: { label: string; value: string }[] }> = {
  analytics: {
    href: "/revenue-analytics",
    desc: "Track revenue trends, MRR, ARR, and growth metrics across all revenue streams.",
    metrics: [
      { label: "Monthly Revenue", value: "—" },
      { label: "Annual Revenue", value: "—" },
      { label: "Growth Rate", value: "—" },
    ],
  },
  receivables: {
    href: "/receivables",
    desc: "Manage money owed to you — track invoices, payment status, and collection efforts.",
    metrics: [
      { label: "Total Receivables", value: "—" },
      { label: "Overdue", value: "—" },
      { label: "Collection Rate", value: "—" },
    ],
  },
  commission: {
    href: "/commission-planning",
    desc: "Set commission structures, model payouts, and track sales performance.",
    metrics: [
      { label: "Total Commission", value: "—" },
      { label: "Active Plans", value: "—" },
      { label: "Avg Commission Rate", value: "—" },
    ],
  },
  businesses: {
    href: "/businesses",
    desc: "View and manage your business clients, their plans, and subscription status.",
    metrics: [
      { label: "Total Businesses", value: "—" },
      { label: "Active Subscriptions", value: "—" },
      { label: "MRR per Business", value: "—" },
    ],
  },
};

export default function RevenuePage() {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" /> Revenue
        </h1>
        <p className="text-zinc-500">Everything about money coming into your business.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === t.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{TABS.find((t) => t.id === tab)?.label}</h2>
            <p className="text-sm text-zinc-500 mt-1">{PAGES[tab].desc}</p>
          </div>
          <Link href={PAGES[tab].href}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors">
            Open Full Page <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PAGES[tab].metrics.map((m) => (
            <div key={m.label} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-500">{m.label}</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
