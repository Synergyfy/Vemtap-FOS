"use client";

import { useState, useMemo } from "react";
import { 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Smartphone
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- MOCK DATA ---
const generateTransactions = () => {
  const types = ["Subscription", "SMS", "Email", "Enterprise"];
  const platforms = ["Vemtap", "QRThrive"];
  const plans = ["Free", "Silver", "Gold", "Platinum", "Enterprise"];
  const data = [];
  
  // Generate 100 random transactions over the last 6 months
  const now = new Date();
  for (let i = 0; i < 100; i++) {
    const date = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
    const type = types[Math.floor(Math.random() * types.length)];
    const platform = (type === "SMS" || type === "Email") ? "Vemtap" : platforms[Math.floor(Math.random() * platforms.length)];
    let amount = 0;
    let plan = "N/A";
    
    if (type === "Subscription") {
      plan = plans[Math.floor(Math.random() * (plans.length - 1)) + 1]; // Skip Free for revenue
      amount = plan === "Silver" ? 5000 : plan === "Gold" ? 15000 : 35000;
    } else if (type === "Enterprise") {
      plan = "Enterprise";
      amount = 150000 + Math.random() * 50000;
    } else if (type === "SMS") {
      amount = 1000 + Math.random() * 9000;
    } else if (type === "Email") {
      amount = 2500 + Math.random() * 7500;
    }

    data.push({
      id: `TRX-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      date: date.toISOString(),
      type,
      platform,
      plan,
      amount: Math.round(amount),
      monthStr: date.toLocaleString('default', { month: 'short', year: '2-digit' })
    });
  }
  // Sort descending by date
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const allTransactions = generateTransactions();
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function RevenueAnalyticsPage() {
  // --- FILTERS STATE ---
  const [dateRange, setDateRange] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    let filtered = allTransactions;

    // Platform Filter
    if (platformFilter !== "All") {
      filtered = filtered.filter(t => t.platform === platformFilter);
    }

    // Type Filter
    if (typeFilter !== "All") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Date Filter (simple mock implementation)
    const now = new Date().getTime();
    if (dateRange === "30days") {
      filtered = filtered.filter(t => (now - new Date(t.date).getTime()) <= 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "90days") {
      filtered = filtered.filter(t => (now - new Date(t.date).getTime()) <= 90 * 24 * 60 * 60 * 1000);
    }

    return filtered;
  }, [dateRange, platformFilter, typeFilter]);

  // --- AGGREGATION FOR CHARTS ---
  const monthlyData = useMemo(() => {
    const map = new Map();
    filteredData.forEach(t => {
      if (!map.has(t.monthStr)) {
        map.set(t.monthStr, { month: t.monthStr, total: 0, vemtap: 0, qrthrive: 0 });
      }
      const entry = map.get(t.monthStr);
      entry.total += t.amount;
      if (t.platform === "Vemtap") entry.vemtap += t.amount;
      else if (t.platform === "QRThrive") entry.qrthrive += t.amount;
    });
    // Sort by actual date (chronological) - simplified by assuming monthStr sorts naturally enough for our 6 month window if we reverse it from the descending original array
    return Array.from(map.values()).reverse();
  }, [filteredData]);

  const planData = useMemo(() => {
    const map = new Map();
    filteredData.forEach(t => {
      // Include SMS/Email as slices if user hasn't filtered to just Subscriptions
      const key = (t.type === "SMS" || t.type === "Email") ? `${t.type} Traffic` : t.plan;
      if (key === "N/A" || key === "Free") return;
      
      if (!map.has(key)) map.set(key, 0);
      map.set(key, map.get(key) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredData]);

  // Tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
          <p className="text-zinc-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {formatNaira(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Revenue Analytics</h1>
          <p className="text-zinc-500">Deep dive into revenue streams across platforms and plans.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Platforms</option>
              <option value="Vemtap">Vemtap</option>
              <option value="QRThrive">QRThrive</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Subscription">Subscriptions</option>
              <option value="SMS">SMS Revenue</option>
              <option value="Email">Email Revenue</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Growth Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-500" /> Revenue Growth
            </h2>
            <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-72 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No data for selected filters</div>
            )}
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Vemtap vs QRThrive
          </h2>
          <div className="h-64 w-full">
             {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Bar dataKey="vemtap" name="Vemtap" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qrthrive" name="QRThrive" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">No data</div>
            )}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-500" /> Revenue by Plan
          </h2>
          <div className="h-64 w-full flex items-center justify-center">
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatNaira(Number(value))} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-500">No plan data</div>
            )}
          </div>
        </div>

      </div>

      {/* REVENUE TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Transaction History</h2>
          <span className="text-sm text-zinc-500">Showing {filteredData.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Revenue Type</th>
                <th className="px-6 py-4 font-medium">Platform</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredData.slice(0, 10).map((trx) => (
                <tr key={trx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                    {new Date(trx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-50">
                    {trx.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${trx.type === 'Subscription' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                        trx.type === 'Enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {trx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                    {trx.platform}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNaira(trx.amount)}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 10 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              View all {filteredData.length} transactions
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
