"use client";

import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Award,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- MOCK DATA ---
const generateSmsData = () => {
  const data = [];
  let currentVol = 10000;
  for (let i = 0; i < 6; i++) {
    currentVol += Math.random() * 5000 + 2000;
    data.push({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
      volume: Math.floor(currentVol),
      revenue: Math.floor(currentVol * 3.5) // Assume ₦3.5 average cost per SMS
    });
  }
  return data;
};

const chartData = generateSmsData();

const generatePurchases = () => {
  const businesses = ["Retail Business 4", "Tech Hub Inc", "Lagos Logistics", "ShopRite", "Local Supermarket"];
  const purchases = [];
  
  for (let i = 1; i <= 20; i++) {
    const credits = Math.floor(Math.random() * 50000) + 5000;
    purchases.push({
      id: `TRX-SMS-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      business: businesses[Math.floor(Math.random() * businesses.length)],
      credits,
      amount: credits * 3.5, // ₦3.5 per SMS
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const recentPurchases = generatePurchases();

export default function SmsTrackerPage() {
  
  const { summaryStats } = useMemo(() => {
    const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

    const stats = [
      { label: "Total SMS Revenue", value: formatNaira(totalRevenue), icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Total SMS Sold", value: totalVolume.toLocaleString(), icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
      { label: "Avg Profit Margin", value: "45%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
      { label: "Top Consumer", value: "Retail Business 4", icon: Award, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
    ];

    return { summaryStats: stats };
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">SMS Revenue Tracker</h1>
        <p className="text-zinc-500">Monitor SMS credit sales, consumption volumes, and profit margins.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
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
        
        {/* CHART */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> SMS Volume & Revenue Trends
          </h2>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v/1000}k`} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${v/1000}k`} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₦)" stroke="#10b981" strokeWidth={2} fill="url(#colorRev)" />
                <Area yAxisId="right" type="monotone" dataKey="volume" name="Volume (SMS)" stroke="#6366f1" strokeWidth={2} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT PURCHASES TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Credit Sales</h2>
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium text-right">Credits</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{purchase.business}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(purchase.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                        +{purchase.credits.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-500">
                      {formatNaira(purchase.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
