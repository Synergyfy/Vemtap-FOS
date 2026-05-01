"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  TrendingUp, 
  Award, 
  DollarSign,
  ChevronRight,
  Settings2,
  ArrowRight,
  QrCode,
  Calendar,
  Download,
  Info
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const BASE_FUNNEL_RAW = {
  free: 45000,
  pro: 3200,
  business: 850
};

// Generate some mock recent conversions
const generateRecentConversions = (multiplier: number) => {
  const plans = ["Pro", "Business"];
  const firstNames = ["James", "Sarah", "Michael", "Emma", "David", "Jessica", "Daniel", "Amaka", "Chidi", "Fatima"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Okafor", "Adeyemi", "Mensah", "Chen"];
  const conversions = [];
  
  const numConversions = Math.max(5, Math.floor(15 * multiplier));
  for (let i = 1; i <= numConversions; i++) {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    conversions.push({
      id: `USR-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      name: `${fname} ${lname}`,
      plan,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return conversions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const COLORS = ['#94a3b8', '#8b5cf6', '#3b82f6']; // Free, Pro, Business

export default function QRThriveFunnelPage() {
  
  // --- DYNAMIC PRICING STATE ---
  const [proPrice, setProPrice] = useState<number>(3500);
  const [bizPrice, setBizPrice] = useState<number>(5000);
  const [timeRange, setTimeRange] = useState("30days");

  const multiplier = useMemo(() => {
    switch (timeRange) {
      case "7days": return 0.25;
      case "30days": return 1;
      case "90days": return 3;
      case "year": return 12;
      default: return 1;
    }
  }, [timeRange]);

  // Calculate dynamic metrics
  const { BASE_FUNNEL, funnelData, summaryStats, tableData } = useMemo(() => {
    const scaledFunnel = {
      free: Math.floor(BASE_FUNNEL_RAW.free * multiplier),
      pro: Math.floor(BASE_FUNNEL_RAW.pro * multiplier),
      business: Math.floor(BASE_FUNNEL_RAW.business * multiplier)
    };
    
    // Revenue calculations
    const proRevenue = scaledFunnel.pro * proPrice;
    const bizRevenue = scaledFunnel.business * bizPrice;
    const totalRevenue = proRevenue + bizRevenue;

    // Funnel Chart Data
    const funnel = [
      { name: "Free Tier Signups", users: scaledFunnel.free, fill: COLORS[0] },
      { name: "Pro Upgrades", users: scaledFunnel.pro, fill: COLORS[1] },
      { name: "Business / Vemtap", users: scaledFunnel.business, fill: COLORS[2] },
    ];

    // Summary Cards
    const stats = [
      { label: "Total Signups (Leads)", value: scaledFunnel.free.toLocaleString(), tooltip: "Total number of free users generated through QRThrive.", icon: Users, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900/30" },
      { label: "Active Pro Users", value: scaledFunnel.pro.toLocaleString(), tooltip: "Users who upgraded to the QRThrive Pro plan.", icon: QrCode, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
      { label: "Active Business Users", value: scaledFunnel.business.toLocaleString(), tooltip: "Users who fully converted to the Vemtap Business system.", icon: Award, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "Total QRThrive Revenue", value: formatNaira(totalRevenue), tooltip: "Total revenue calculated from your pricing configuration.", icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
    ];

    // Map table data to dynamic prices
    const table = generateRecentConversions(multiplier).map(c => ({
      ...c,
      revenue: c.plan === "Pro" ? proPrice : bizPrice
    }));

    return { BASE_FUNNEL: scaledFunnel, funnelData: funnel, summaryStats: stats, tableData: table };
  }, [proPrice, bizPrice, multiplier]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            QRThrive Funnel Tracker
            <InfoTooltip content="Track how effectively free QRThrive leads convert into paying users." />
          </h1>
          <p className="text-zinc-500">Monitor lead generation, plan upgrades, and dynamic pricing revenue from QRThrive.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button 
            onClick={() => exportToCSV(funnelData, "qrthrive_funnel_data")}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* DYNAMIC PRICING ENGINE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
            QRThrive Pricing Engine
            <InfoTooltip content="Adjust the pricing below to instantly see how it would affect your overall revenue." />
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pro Plan Pricing (₦)</label>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">₦{proPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range" className="w-full accent-purple-500" 
              min="1000" max="15000" step="500" value={proPrice} onChange={(e) => setProPrice(Number(e.target.value))} 
            />
            <p className="text-xs text-zinc-500 mt-2">Currently generating {formatNaira(BASE_FUNNEL.pro * proPrice)} MRR from {BASE_FUNNEL.pro} users.</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Business Plan Pricing (₦)</label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₦{bizPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range" className="w-full accent-blue-500" 
              min="2000" max="25000" step="500" value={bizPrice} onChange={(e) => setBizPrice(Number(e.target.value))} 
            />
            <p className="text-xs text-zinc-500 mt-2">Currently generating {formatNaira(BASE_FUNNEL.business * bizPrice)} MRR from {BASE_FUNNEL.business} users.</p>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 flex items-center">
                {stat.label}
                <InfoTooltip content={stat.tooltip} />
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FUNNEL VISUALIZATION */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Conversion Funnel
            <InfoTooltip content="Visual representation of user drop-off at each stage of the funnel." />
          </h2>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={120} />
                <RechartsTooltip 
                  formatter={(value: any) => [Number(value).toLocaleString(), "Users"]}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                />
                <Bar dataKey="users" radius={[0, 4, 4, 0]} barSize={40}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Free to Pro Conversion</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {((BASE_FUNNEL.pro / BASE_FUNNEL.free) * 100).toFixed(1)}%
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Pro to Business Conversion</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {((BASE_FUNNEL.business / BASE_FUNNEL.pro) * 100).toFixed(1)}%
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </div>

        {/* RECENT CONVERSIONS TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center">
              Recent Upgrades
              <InfoTooltip content="Log of recent users who upgraded to a paid plan." />
            </h2>
            <button 
              onClick={() => exportToCSV(tableData, "recent_upgrades")}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              title="Export Upgrades Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tableData.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{conversion.name}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(conversion.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                        ${conversion.plan === 'Pro' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {conversion.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatNaira(conversion.revenue)}
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
