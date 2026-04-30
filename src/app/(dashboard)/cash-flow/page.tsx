"use client";

import { useMemo } from "react";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Clock,
  Download,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- MOCK DATA ---
const generateCashFlowData = () => {
  const data = [];
  const startObj = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startObj.getTime() + i * 24 * 60 * 60 * 1000);
    const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate daily cash movement
    const inflow = Math.floor(Math.random() * 500000 + 200000);
    const outflow = Math.floor(Math.random() * 400000 + 100000);
    
    // Create specific spike days (e.g., payroll or commission payouts)
    const finalOutflow = (i === 15 || i === 28) ? outflow + 1500000 : outflow;
    
    data.push({
      date: dayName,
      inflow,
      outflow: finalOutflow,
      net: inflow - finalOutflow
    });
  }
  return data;
};

const chartData = generateCashFlowData();

const generateLedger = () => {
  const ledger = [];
  const inboundCategories = ["Stripe Settlement", "Paystack Settlement", "Manual Wire"];
  const outboundCategories = ["Agent Commission Payout", "AWS Invoice", "Salary Run", "Meta Ads Billing"];
  
  for (let i = 1; i <= 25; i++) {
    const isOutbound = Math.random() > 0.6;
    const amount = isOutbound ? Math.floor(Math.random() * 500000 + 50000) : Math.floor(Math.random() * 800000 + 100000);
    const category = isOutbound ? outboundCategories[Math.floor(Math.random() * outboundCategories.length)] : inboundCategories[Math.floor(Math.random() * inboundCategories.length)];
    
    ledger.push({
      id: `TRX-CF-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      type: isOutbound ? "Outflow" : "Inflow",
      description: category,
      amount: amount,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ledgerData = generateLedger();

export default function CashFlowPage() {
  
  const { summaryStats } = useMemo(() => {
    const totalInflow = chartData.reduce((sum, d) => sum + d.inflow, 0);
    const totalOutflow = chartData.reduce((sum, d) => sum + d.outflow, 0);
    const netCash = totalInflow - totalOutflow;

    const stats = [
      { label: "Total Cash Inflow (30d)", value: formatNaira(totalInflow), icon: ArrowUpRight, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Total Cash Outflow (30d)", value: formatNaira(totalOutflow), icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
      { label: "Net Cash Position", value: formatNaira(netCash), icon: Wallet, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "Est. Runway", value: "14.2 Months", icon: Clock, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
    ];

    return { summaryStats: stats };
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Cash Flow Monitor</h1>
          <p className="text-zinc-500">Track liquid cash movements, bank settlements, and runway.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
        </div>
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

      {/* CASH FLOW CHART */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" /> Cash Movement Trend (Daily)
        </h2>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v/1000}k`} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                formatter={(value: any, name: any) => [formatNaira(Number(value)), name === "inflow" ? "Cash Inflow" : "Cash Outflow"]}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Area type="monotone" dataKey="inflow" name="Cash Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="outflow" name="Cash Outflow" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CASH LEDGER TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Cash Movements</h2>
        </div>
        
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {ledgerData.map((trx) => (
                <tr key={trx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{trx.description}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(trx.date).toLocaleString()} • {trx.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium
                      ${trx.type === 'Inflow' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {trx.type === 'Inflow' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {trx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${trx.type === 'Inflow' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {trx.type === 'Inflow' ? '+' : '-'}{formatNaira(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
