"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  AlertCircle, 
  Activity,
  LineChart as LineChartIcon,
  CalendarDays,
  Wallet,
  Download,
  Info
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { exportToCSV } from "@/lib/export";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Currency formatter
const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

export default function ForecastingPage() {
  const [period, setPeriod] = useState<number>(6);
  const [growthRate, setGrowthRate] = useState(15);
  const [churnRate, setChurnRate] = useState(5);
  const [conversionRate, setConversionRate] = useState(12);

  // Base assumptions
  const baseBusinesses = 1250;
  const arpu = 15000;
  const qrThriveLeadsPerMonth = 5000;
  const fixedCosts = 2500000;
  const variableCostMargin = 0.6; // 60% margin after commission/hosting

  const forecastData = useMemo(() => {
    const data = [];
    let currentBiz = baseBusinesses;
    let currentCash = 15000000; // Starting cash

    for (let i = 1; i <= period; i++) {
      // Calculate new QRThrive conversions
      const newConversions = Math.round(qrThriveLeadsPerMonth * (conversionRate / 100));
      
      // Calculate organic growth and churn
      const organicNew = Math.round(currentBiz * (growthRate / 100));
      const churned = Math.round(currentBiz * (churnRate / 100));
      
      currentBiz = currentBiz + organicNew + newConversions - churned;
      
      const mrr = currentBiz * arpu;
      const profit = (mrr * variableCostMargin) - fixedCosts;
      
      // Cash flow components
      const inflow = mrr;
      const outflow = (mrr * (1 - variableCostMargin)) + fixedCosts;
      currentCash = currentCash + profit;

      data.push({
        month: `Month ${i}`,
        businesses: currentBiz,
        mrr: mrr,
        profit: profit,
        inflow: inflow,
        outflow: outflow,
        cashBalance: currentCash
      });
    }
    return data;
  }, [period, growthRate, churnRate, conversionRate]);

  const endData = forecastData[forecastData.length - 1];
  const initialMrr = baseBusinesses * arpu;
  const mrrGrowth = endData ? ((endData.mrr - initialMrr) / initialMrr) * 100 : 0;
  
  const isDeclining = churnRate > growthRate;

  // Custom tooltip formatter
  const TooltipFormatter = (value: any, name: any) => {
    if (name === "Businesses") return [value.toLocaleString(), "Active Businesses"];
    return [formatNaira(value), name.charAt(0).toUpperCase() + name.slice(1)];
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            Forecasting Engine
            <InfoTooltip content="This engine simulates future business performance based on your current inputs." />
          </h1>
          <p className="text-zinc-500">Project future revenue, profit, and cash flow based on growth and churn trends.</p>
        </div>
        <button 
          onClick={() => exportToCSV(forecastData, "forecasting_data")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* CONTROLS & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Variables Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Variables
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                  Forecast Period
                  <InfoTooltip content="How many months into the future to project." />
                </label>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{period} Months</span>
              </div>
              <input 
                type="range" 
                className="w-full accent-zinc-500" 
                min="1" max="36" step="1"
                value={period} 
                onChange={(e) => setPeriod(Number(e.target.value))} 
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>1 mo</span>
                <span>36 mo</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                  Growth Rate
                  <InfoTooltip content="Percentage of organic new businesses joining each month." />
                </label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{growthRate}%</span>
              </div>
              <input 
                type="range" className="w-full accent-blue-500" 
                min="0" max="50" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} 
              />
              <p className="text-xs text-zinc-500 mt-1">Monthly organic growth</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                  Churn Rate
                  <InfoTooltip content="Percentage of active businesses leaving each month." />
                </label>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{churnRate}%</span>
              </div>
              <input 
                type="range" className="w-full accent-red-500" 
                min="0" max="30" value={churnRate} onChange={(e) => setChurnRate(Number(e.target.value))} 
              />
              <p className="text-xs text-zinc-500 mt-1">Monthly customer drop-off</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                  QRThrive Conversion
                  <InfoTooltip content="Percentage of leads successfully converting to paying users." />
                </label>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{conversionRate}%</span>
              </div>
              <input 
                type="range" className="w-full accent-green-500" 
                min="0" max="100" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} 
              />
              <p className="text-xs text-zinc-500 mt-1">% of 5k monthly QRThrive leads</p>
            </div>
          </div>
        </div>

        {/* Summary Outputs */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Projected MRR (Month {period})
            </h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {endData ? formatNaira(endData.mrr) : "₦0"}
            </div>
            <div className={`text-sm font-medium ${mrrGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}% vs current
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Total Projected Profit
            </h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {formatNaira(forecastData.reduce((acc, curr) => acc + curr.profit, 0))}
            </div>
            <div className="text-sm text-zinc-500">
              Cumulative over {period} months
            </div>
          </div>

          <div className={`md:col-span-2 rounded-xl border shadow-sm p-5 flex items-start gap-4 ${
            isDeclining 
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50' 
              : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50'
          }`}>
            <AlertCircle className={`w-6 h-6 shrink-0 mt-0.5 ${isDeclining ? 'text-red-600' : 'text-green-600'}`} />
            <div>
              <h3 className={`font-semibold ${isDeclining ? 'text-red-900 dark:text-red-400' : 'text-green-900 dark:text-green-400'}`}>
                {isDeclining ? "High Risk Alert: Revenue Decline Projected" : "Healthy Trajectory Projected"}
              </h3>
              <p className={`text-sm mt-1 ${isDeclining ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                {isDeclining 
                  ? "Your churn rate is currently outpacing your growth and conversion rates. At this trajectory, you will experience a net loss of active businesses and declining MRR. Focus on retention immediately." 
                  : "Your growth strategy is outpacing churn. If these variables hold, your recurring revenue and profit margins will compound positively over the forecast period."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Revenue Forecast */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-blue-500" /> Revenue & Business Growth Forecast
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v/1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={TooltipFormatter}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="mrr" name="MRR" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                <Line yAxisId="right" type="monotone" dataKey="businesses" name="Businesses" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Profit Forecast */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Profit Forecast
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v/1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={TooltipFormatter}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                />
                <Legend />
                <Bar dataKey="profit" name="Net Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Forecast */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" /> Cash Flow Forecast
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₦${(v/1000000).toFixed(0)}M`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={TooltipFormatter}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                />
                <Legend />
                <Line type="monotone" dataKey="inflow" name="Inflows" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outflow" name="Outflows" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cashBalance" name="Net Cash Balance" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
