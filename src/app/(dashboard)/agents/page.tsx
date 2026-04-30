"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Wallet,
  X,
  TrendingUp,
  Building2,
  ChevronRight,
  Settings2,
  Plus,
  Trash2,
  Gift,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const formatNaira = (value: number) => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

// --- RAW BASE DATA ---
const rawUsers = [
  { id: "MGR-01", name: "Chinedu Eze", role: "Manager", businesses: 0, rawRevenue: 0, conversion: 0, status: "Active" },
  { id: "MGR-02", name: "Fatima Bello", role: "Manager", businesses: 0, rawRevenue: 0, conversion: 0, status: "Active" },
  { id: "MGR-03", name: "Kwame Mensah", role: "Manager", businesses: 0, rawRevenue: 0, conversion: 0, status: "Active" },
  { id: "AGT-001", name: "Sarah Jenkins", role: "Agent", businesses: 145, rawRevenue: 4500000, conversion: 24.5, status: "Active", managerId: "MGR-01" },
  { id: "AGT-002", name: "David Chen", role: "Agent", businesses: 98, rawRevenue: 3200000, conversion: 18.2, status: "Active", managerId: "MGR-01" },
  { id: "AGT-003", name: "Amaka Okafor", role: "Agent", businesses: 112, rawRevenue: 3800000, conversion: 21.0, status: "Active", managerId: "MGR-02" },
  { id: "AGT-004", name: "Michael Ross", role: "Agent", businesses: 12, rawRevenue: 450000, conversion: 8.5, status: "Inactive", managerId: "MGR-01" },
  { id: "AGT-005", name: "Jessica Wong", role: "Agent", businesses: 64, rawRevenue: 1900000, conversion: 15.4, status: "Active", managerId: "MGR-02" },
  { id: "AGT-006", name: "Tunde Bakare", role: "Agent", businesses: 8, rawRevenue: 200000, conversion: 5.2, status: "Inactive", managerId: "MGR-03" },
  { id: "AGT-007", name: "Elena Rodriguez", role: "Agent", businesses: 87, rawRevenue: 2750000, conversion: 19.1, status: "Active", managerId: "MGR-03" },
];

const generateAgentHistory = () => [
  { month: "Jan", revenue: Math.random() * 500000 + 200000 },
  { month: "Feb", revenue: Math.random() * 500000 + 300000 },
  { month: "Mar", revenue: Math.random() * 500000 + 400000 },
  { month: "Apr", revenue: Math.random() * 500000 + 500000 },
  { month: "May", revenue: Math.random() * 500000 + 600000 },
  { month: "Jun", revenue: Math.random() * 500000 + 700000 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

type Bonus = { id: string; name: string; type: "percent" | "fixed"; value: number };

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  
  // --- COMPENSATION STATE ---
  const [agentRate, setAgentRate] = useState<number>(15);
  const [managerRate, setManagerRate] = useState<number>(5);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  
  // --- FILTER STATE ---
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Calculate dynamic metrics
  const { processedUsers, summaryStats } = useMemo(() => {
    let totalRevenue = 0;
    let totalAgentCommissions = 0;
    let totalManagerCommissions = 0;
    let totalBonusesPaid = 0;

    // 1. Process Agents
    const rawOnlyAgents = rawUsers.filter(u => u.role === "Agent");
    const agents = rawOnlyAgents.map(agent => {
      // Base Commission
      const agentBase = agent.rawRevenue * (agentRate / 100);
      const managerBase = agent.rawRevenue * (managerRate / 100);
      
      // Calculate specific bonuses for this agent
      let agentBonusAmount = 0;
      bonuses.forEach(b => {
        if (b.type === "percent") {
          agentBonusAmount += agent.rawRevenue * (b.value / 100);
        } else {
          agentBonusAmount += b.value;
        }
      });

      const agentTotalPayout = agentBase + agentBonusAmount;
      
      // Accumulate global totals
      totalRevenue += agent.rawRevenue;
      totalAgentCommissions += agentBase;
      totalManagerCommissions += managerBase;
      totalBonusesPaid += agentBonusAmount; 

      return {
        ...agent,
        revenue: agent.rawRevenue,
        agentBaseCommission: agentBase,
        agentTotalPayout: agentTotalPayout,
        managerCommission: managerBase,
        bonusBreakdown: bonuses.map(b => ({
          name: b.name,
          amount: b.type === "percent" ? agent.rawRevenue * (b.value / 100) : b.value
        }))
      };
    });

    // 2. Process Managers
    const managers = rawUsers.filter(u => u.role === "Manager").map(manager => {
      const recruits = agents.filter(a => a.managerId === manager.id);
      const totalRecruitRevenue = recruits.reduce((sum, a) => sum + a.revenue, 0);
      const totalAcquired = recruits.reduce((sum, a) => sum + a.businesses, 0);
      const totalManagerCutEarned = recruits.reduce((sum, a) => sum + a.managerCommission, 0);

      return {
        ...manager,
        businesses: totalAcquired,
        revenue: totalRecruitRevenue,
        agentBaseCommission: 0,
        agentTotalPayout: 0,
        managerCommission: totalManagerCutEarned,
        bonusBreakdown: [],
        recruitCount: recruits.length
      };
    });

    // Combine and apply filter
    let combined = [...managers, ...agents];
    if (roleFilter !== "All") {
      combined = combined.filter(u => u.role === roleFilter);
    }

    const stats = [
      { label: "Total Revenue Generated", value: formatNaira(totalRevenue), icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
      { label: "Agent Commissions", value: formatNaira(totalAgentCommissions), icon: Users, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
      { label: "Manager Commissions", value: formatNaira(totalManagerCommissions), icon: UserCheck, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
      { label: "Total Payout (Inc. Bonuses)", value: formatNaira(totalAgentCommissions + totalManagerCommissions + totalBonusesPaid), icon: Wallet, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
    ];

    return { processedUsers: combined, summaryStats: stats };
  }, [agentRate, managerRate, bonuses, roleFilter]);

  const addBonus = () => {
    setBonuses([...bonuses, { id: Math.random().toString(), name: "New Bonus", type: "fixed", value: 10000 }]);
  };

  const removeBonus = (id: string) => {
    setBonuses(bonuses.filter(b => b.id !== id));
  };

  const updateBonus = (id: string, field: keyof Bonus, value: any) => {
    setBonuses(bonuses.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // Generate pie chart data for drilldown dynamically
  const generatePieData = (agent: any) => {
    if (agent.role === "Manager") {
      return [{ name: `Manager Cut (${managerRate}%)`, value: agent.managerCommission }];
    }
    const data = [
      { name: `Base Commission (${agentRate}%)`, value: agent.agentBaseCommission }
    ];
    agent.bonusBreakdown.forEach((b: any) => {
      data.push({ name: b.name, value: b.amount });
    });
    return data;
  };

  // Close panel on escape key
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedAgent(null);
    };
  }

  return (
    <div className="space-y-8 pb-8 relative">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Agent Performance Dashboard</h1>
        <p className="text-zinc-500">Track performance and dynamically adjust compensation structures.</p>
      </div>

      {/* COMPENSATION ENGINE SETTINGS */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Compensation Structure Engine</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Base Rates */}
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Base Rates</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Agent Commission (%)</label>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{agentRate}%</span>
              </div>
              <input 
                type="range" className="w-full accent-green-500" 
                min="0" max="50" step="0.5" value={agentRate} onChange={(e) => setAgentRate(Number(e.target.value))} 
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recruit Manager Commission (%)</label>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{managerRate}%</span>
              </div>
              <input 
                type="range" className="w-full accent-purple-500" 
                min="0" max="25" step="0.5" value={managerRate} onChange={(e) => setManagerRate(Number(e.target.value))} 
              />
            </div>
            
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between border border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Subscription Split:</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{agentRate + managerRate}%</span>
            </div>
          </div>

          {/* Incentives Builder */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 pt-6 lg:pt-0">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Incentives & Bonuses</h3>
              <button 
                onClick={addBonus}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-900/50"
              >
                <Plus className="w-3 h-3" /> Add Bonus
              </button>
            </div>
            
            {bonuses.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 text-sm">
                No active bonuses. Click "Add Bonus" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <input 
                      type="text" 
                      value={bonus.name}
                      onChange={(e) => updateBonus(bonus.id, "name", e.target.value)}
                      className="flex-1 min-w-[120px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <select
                      value={bonus.type}
                      onChange={(e) => updateBonus(bonus.id, "type", e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="fixed">Fixed (₦)</option>
                      <option value="percent">Percent (%)</option>
                    </select>
                    <input 
                      type="number" 
                      value={bonus.value}
                      onChange={(e) => updateBonus(bonus.id, "value", Number(e.target.value))}
                      className="w-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button 
                      onClick={() => removeBonus(bonus.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* AGENTS TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team Roster</h2>
            <span className="text-sm text-zinc-500">{processedUsers.length} members total</span>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Manager">Managers Only</option>
              <option value="Agent">Agents Only</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name & Role</th>
                <th className="px-6 py-4 font-medium text-center">Network Size</th>
                <th className="px-6 py-4 font-medium text-right">Revenue Generated</th>
                <th className="px-6 py-4 font-medium text-right bg-green-50/50 dark:bg-green-900/10">Agent Payout</th>
                <th className="px-6 py-4 font-medium text-right bg-purple-50/50 dark:bg-purple-900/10">Manager Cut</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {processedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => setSelectedAgent(user)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                        ${user.role === 'Manager' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800'}`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{user.name}</div>
                        <div className="text-xs text-zinc-500">
                          {user.role === "Manager" ? "Recruit Manager" : `Agent (Mgr: ${user.managerId})`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-zinc-900 dark:text-zinc-50">
                    <div className="flex flex-col items-center">
                      <span>{user.businesses} <span className="text-xs font-normal text-zinc-500">biz</span></span>
                      {user.role === "Manager" && <span className="text-xs text-purple-500">{(user as any).recruitCount} recruits</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNaira(user.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-700 dark:text-green-400 bg-green-50/30 dark:bg-green-900/5">
                    {user.role === "Manager" ? "-" : formatNaira(user.agentTotalPayout)}
                    {user.role !== "Manager" && bonuses.length > 0 && <span title="Includes bonuses"><Gift className="w-3 h-3 inline-block ml-1 text-amber-500" /></span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/5">
                    {formatNaira(user.managerCommission)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    <ChevronRight className="w-5 h-5 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL-DOWN SIDE PANEL OVERLAY */}
      {selectedAgent && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity" 
            onClick={() => setSelectedAgent(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
            
            {/* Panel Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${selectedAgent.role === 'Manager' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {selectedAgent.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedAgent.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                      ${selectedAgent.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {selectedAgent.status} {selectedAgent.role}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedAgent.role === "Agent" && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-medium text-zinc-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Conversion</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selectedAgent.conversion}%</p>
                  </div>
                )}
                {selectedAgent.role === "Manager" && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-medium text-zinc-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Recruits</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selectedAgent.recruitCount}</p>
                  </div>
                )}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-medium text-zinc-500 mb-1 flex items-center gap-1"><Building2 className="w-3 h-3"/> Acquired</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selectedAgent.businesses}</p>
                </div>
                
                {selectedAgent.role === "Agent" ? (
                  <div className="col-span-2 bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3"/> Total Agent Earnings</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-500">{formatNaira(selectedAgent.agentTotalPayout)}</p>
                    {bonuses.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1 flex items-center gap-1">
                        <Gift className="w-3 h-3" /> Includes {bonuses.length} active bonus(es)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="col-span-2 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3"/> Total Manager Cut Earned</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-500">{formatNaira(selectedAgent.managerCommission)}</p>
                  </div>
                )}
              </div>

              {/* Monthly Performance Chart */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  {selectedAgent.role === "Manager" ? "Network Revenue Trend" : "Monthly Revenue Trend"}
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateAgentHistory()} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => `₦${v/1000}k`} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        formatter={(value: any) => [formatNaira(Number(value)), "Revenue"]}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                      />
                      <Bar dataKey="revenue" fill={selectedAgent.role === "Manager" ? "#a855f7" : "#3b82f6"} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Earnings Breakdown Pie Chart */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Earnings Breakdown</h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generatePieData(selectedAgent)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {generatePieData(selectedAgent).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any) => [formatNaira(Number(value)), "Amount"]}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                      />
                      <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
