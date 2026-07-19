"use client";

import React, { useState, useMemo } from "react";
import { 
  Coins, 
  Settings, 
  HelpCircle, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  RefreshCw, 
  Copy, 
  Edit3, 
  Archive, 
  Search, 
  Sliders, 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  ChevronDown,
  Printer,
  ChevronUp,
  LineChart,
  PieChart,
  BarChart,
  Lock,
  Calendar,
  AlertCircle
} from "lucide-react";

// Types
interface Participant {
  id: string;
  name: string;
  enabled: boolean;
  percentage: number;
  duration: string;
  description: string;
  notes: string;
}

interface Stage {
  id: string;
  name: string;
  payments: string;
  duration: number; // in months
  description: string;
}

interface SavedModel {
  id: string;
  name: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  status: "Active" | "Draft" | "Archived";
  participants: Participant[];
  stages: Stage[];
  pool: {
    monthOne: number;
    months2to12: number;
    yearTwo: number;
  };
}

export default function CommissionPlanningPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Shared Configuration States
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "marketer", name: "Employee Marketer", enabled: true, percentage: 5.0, duration: "12 months", description: "Direct employee handling initial business onboarding", notes: "Standard package rate" },
    { id: "agent", name: "Independent Agent", enabled: true, percentage: 10.0, duration: "24 months", description: "Contract agent driving external acquisitions", notes: "Negotiated performance rate" },
    { id: "referrer", name: "Business Referrer", enabled: true, percentage: 3.0, duration: "6 months", description: "Existing businesses referring other businesses", notes: "Referral program default" },
    { id: "reward", name: "Original Agent Reward", enabled: true, percentage: 2.0, duration: "Lifetime", description: "Legacy payout for original recruiting agent", notes: "Vesting program rules" },
    { id: "supervisor", name: "Supervisor", enabled: true, percentage: 2.5, duration: "12 months", description: "Regional team leads overriding direct sales", notes: "Team performance overrides" },
    { id: "future_reserve", name: "Future Reserved Commission", enabled: false, percentage: 0.0, duration: "0 months", description: "Reserved pool for prospective promotional tracks", notes: "Requires executive approval" },
  ]);

  const [stages, setStages] = useState<Stage[]>([
    { id: "stage_1", name: "Stage 1", payments: "Payment #1", duration: 1, description: "First Subscription Payment onboarding fee" },
    { id: "stage_2", name: "Stage 2", payments: "Payments 2–12", duration: 11, description: "Year One renewal stream payouts" },
    { id: "stage_3", name: "Stage 3", payments: "Payments 13–24", duration: 12, description: "Year Two customer retention payouts" },
  ]);

  const [pool, setPool] = useState({
    monthOne: 30.0,
    months2to12: 15.0,
    yearTwo: 7.5,
  });

  // Simulator States
  const [selectedPlan, setSelectedPlan] = useState<string>("gold");
  const [customPrice, setCustomPrice] = useState<number>(25000);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [simulatorOverride, setSimulatorOverride] = useState<Record<string, number>>({});
  
  // Scenario Builder States
  const [scenarioInputs, setScenarioInputs] = useState({
    numBusinesses: 450,
    averageSubscription: 18500,
    monthlyChurn: 2.2,
    referralRate: 12.0,
    upgradeRate: 4.5,
    numAgents: 15,
    numSupervisors: 3,
    numEmployeeMarketers: 6,
    expectedGrowthRate: 8.5,
  });

  // Saved Models
  const [savedModels, setSavedModels] = useState<SavedModel[]>([
    {
      id: "model_1",
      name: "Current Standard Plan",
      createdBy: "Abiola Cole",
      createdDate: "2026-01-10",
      lastUpdated: "2026-05-18",
      status: "Active",
      participants: [...participants],
      stages: [...stages],
      pool: { ...pool }
    },
    {
      id: "model_2",
      name: "Proposed Q3 High Growth",
      createdBy: "Tunde Adebayo",
      createdDate: "2026-04-22",
      lastUpdated: "2026-06-01",
      status: "Draft",
      participants: participants.map(p => p.id === "agent" ? { ...p, percentage: 12.0 } : p),
      stages: [...stages],
      pool: { ...pool, monthOne: 35.0 }
    },
    {
      id: "model_3",
      name: "Investor High Retention Plan",
      createdBy: "Abiola Cole",
      createdDate: "2026-03-05",
      lastUpdated: "2026-03-12",
      status: "Draft",
      participants: participants.map(p => p.id === "reward" ? { ...p, percentage: 4.0 } : p),
      stages: [...stages],
      pool: { ...pool, yearTwo: 10.0 }
    },
    {
      id: "model_4",
      name: "Aggressive Agent Acquisition",
      createdBy: "Sarah Jenkins",
      createdDate: "2025-11-15",
      lastUpdated: "2025-12-05",
      status: "Archived",
      participants: participants.map(p => p.id === "agent" ? { ...p, percentage: 15.0 } : p),
      stages: [...stages],
      pool: { ...pool, monthOne: 40.0 }
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "updated">("updated");

  // Notification / Dialog States
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<string | null>(null);
  
  // Accordions and Expandable cards state
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    stage_1: true,
    stage_2: true,
    stage_3: true,
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper formatting function for currency (Naira, matching design system)
  const formatCurrency = (val: number) => {
    return `₦${Math.round(val).toLocaleString()}`;
  };

  // 1. Overview & KPI Calculations
  const calculatedKPIs = useMemo(() => {
    // Standard mock revenues derived from configured values or average benchmarks
    const totalMonthlyRevenue = 45000000;
    const totalAnnualRevenue = totalMonthlyRevenue * 12;
    
    // Average effective commission calculated from active participant percentages
    const activeParticipantsSum = participants
      .filter(p => p.enabled)
      .reduce((sum, p) => sum + p.percentage, 0);
    
    const commissionPercentage = activeParticipantsSum; // % of revenue
    const totalCommissionCost = (totalMonthlyRevenue * commissionPercentage) / 100;
    const companyRetainedRevenue = totalMonthlyRevenue - totalCommissionCost;
    
    const grossMargin = ((totalMonthlyRevenue - totalCommissionCost) / totalMonthlyRevenue) * 100;
    // Net margin assuming operational overhead is another 25% of revenue
    const estimatedNetMargin = grossMargin - 25;

    return {
      totalMonthlyRevenue,
      totalAnnualRevenue,
      totalCommissionCost,
      companyRetainedRevenue,
      commissionPercentage,
      grossMargin,
      estimatedNetMargin,
      activePlan: "Current Standard Plan"
    };
  }, [participants]);

  // 2. Stages Add/Edit helpers
  const handleAddStage = () => {
    const nextId = `stage_${stages.length + 1}`;
    const nextStage: Stage = {
      id: nextId,
      name: `Stage ${stages.length + 1}`,
      payments: `Payments ${stages.length * 12 + 1}–${(stages.length + 1) * 12}`,
      duration: 12,
      description: "Additional custom stage for long term subscription maintenance."
    };
    setStages([...stages, nextStage]);
    setExpandedStages({ ...expandedStages, [nextId]: true });
    triggerToast("New stage added successfully.");
  };

  const handleRemoveStage = (id: string) => {
    if (stages.length <= 1) {
      triggerToast("Must keep at least one stage.");
      return;
    }
    setStages(stages.filter(s => s.id !== id));
    triggerToast("Stage removed.");
  };

  const handleUpdateStage = (id: string, field: keyof Stage, val: any) => {
    setStages(stages.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  // 3. Simulator Output Computations
  const subscriptionPrice = useMemo(() => {
    if (selectedPlan === "free") return 0;
    if (selectedPlan === "silver") return 15000;
    if (selectedPlan === "gold") return 25000;
    if (selectedPlan === "platinum") return 50000;
    if (selectedPlan === "enterprise") return 150000;
    return customPrice; // Custom plan price
  }, [selectedPlan, customPrice]);

  const simulatorPayouts = useMemo(() => {
    const cycleMultiplier = billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;
    const grossRevenue = subscriptionPrice * cycleMultiplier;
    
    // Effective percentages (check simulator override first)
    const effectivePercentages = participants.map(p => {
      const isOverridden = simulatorOverride[p.id] !== undefined;
      return {
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        percentage: isOverridden ? simulatorOverride[p.id] : p.percentage
      };
    });

    const activeParticipants = effectivePercentages.filter(p => p.enabled);
    const sumPercentage = activeParticipants.reduce((sum, p) => sum + p.percentage, 0);

    // Calculate payouts by stages
    // Month 1 Payout
    const monthOneRate = pool.monthOne / 100;
    const monthOneCommission = grossRevenue * (sumPercentage / 100) * (monthOneRate * 3.33); // Normalised scale
    const monthOneRetained = grossRevenue - monthOneCommission;
    const monthOneNetMargin = (monthOneRetained / (grossRevenue || 1)) * 100;

    // Months 2-12 Payout (average per month)
    const midRate = pool.months2to12 / 100;
    const midCommission = grossRevenue * (sumPercentage / 100) * (midRate * 6.67);
    const midRetained = grossRevenue - midCommission;
    const midNetMargin = (midRetained / (grossRevenue || 1)) * 100;

    // Year Two Payout (average per month)
    const lateRate = pool.yearTwo / 100;
    const lateCommission = grossRevenue * (sumPercentage / 100) * (lateRate * 13.33);
    const lateRetained = grossRevenue - lateCommission;
    const lateNetMargin = (lateRetained / (grossRevenue || 1)) * 100;

    // Lifetime projection (24 months)
    const lifetimeRevenue = grossRevenue * 24;
    const lifetimeCommission = monthOneCommission + (midCommission * 11) + (lateCommission * 12);
    const lifetimeRetained = lifetimeRevenue - lifetimeCommission;
    
    return {
      revenue: grossRevenue,
      commissionPct: sumPercentage,
      monthOne: {
        revenue: grossRevenue,
        commission: monthOneCommission,
        retained: monthOneRetained,
        margin: monthOneNetMargin
      },
      months2to12: {
        revenue: grossRevenue * 11,
        commission: midCommission * 11,
        retained: midRetained * 11,
        margin: midNetMargin
      },
      yearTwo: {
        revenue: grossRevenue * 12,
        commission: lateCommission * 12,
        retained: lateRetained * 12,
        margin: lateNetMargin
      },
      lifetime: {
        revenue: lifetimeRevenue,
        commission: lifetimeCommission,
        retained: lifetimeRetained,
        margin: (lifetimeRetained / (lifetimeRevenue || 1)) * 100
      }
    };
  }, [subscriptionPrice, billingCycle, participants, simulatorOverride, pool]);

  // 4. Scenario Builder calculations
  const scenarioOutputs = useMemo(() => {
    const {
      numBusinesses,
      averageSubscription,
      monthlyChurn,
      referralRate,
      upgradeRate,
      expectedGrowthRate,
      numAgents,
      numSupervisors,
      numEmployeeMarketers
    } = scenarioInputs;

    const baseMonthlyRevenue = numBusinesses * averageSubscription;
    const monthlyGrowth = expectedGrowthRate / 100;
    const monthlyChurnRate = monthlyChurn / 100;
    
    // Effective commission rate
    const agentCommRate = participants.find(p => p.id === "agent")?.percentage || 10.0;
    const superCommRate = participants.find(p => p.id === "supervisor")?.percentage || 2.5;
    const marketerCommRate = participants.find(p => p.id === "marketer")?.percentage || 5.0;

    // Calculate over 12 months
    const monthlyProjections = [];
    let currentBiz = numBusinesses;
    let accumulatedCommission = 0;
    let accumulatedRevenue = 0;
    let accumulatedProfit = 0;

    for (let month = 1; month <= 12; month++) {
      const growthNewBiz = currentBiz * monthlyGrowth;
      const churnedBiz = currentBiz * monthlyChurnRate;
      currentBiz = currentBiz + growthNewBiz - churnedBiz;
      
      const rev = currentBiz * averageSubscription;
      const commissionCost = rev * ((agentCommRate * (numAgents / 20) + superCommRate * (numSupervisors / 10) + marketerCommRate * (numEmployeeMarketers / 15)) / 100);
      const profit = rev - commissionCost;

      accumulatedRevenue += rev;
      accumulatedCommission += commissionCost;
      accumulatedProfit += profit;

      monthlyProjections.push({
        month,
        businesses: Math.round(currentBiz),
        revenue: rev,
        commission: commissionCost,
        profit: profit
      });
    }

    const breakevenBusinesses = Math.ceil((numAgents * 150000 + numSupervisors * 300000) / (averageSubscription * 0.75));

    return {
      revenue: accumulatedRevenue,
      commission: accumulatedCommission,
      profit: accumulatedProfit,
      breakevenEstimate: breakevenBusinesses,
      monthlyProjections,
      finalBusinesses: Math.round(currentBiz)
    };
  }, [scenarioInputs, participants]);

  // 5. Compare Plans List
  const comparePlansTable = useMemo(() => {
    const activeParticipantsSum = participants
      .filter(p => p.enabled)
      .reduce((sum, p) => sum + p.percentage, 0);

    const plans = [
      { name: "Current Plan", commissionRate: activeParticipantsSum, revenue: 540000000 },
      { name: "Proposed High Growth Plan", commissionRate: activeParticipantsSum + 3, revenue: 620000000 },
      { name: "Investor Constrained Plan", commissionRate: activeParticipantsSum - 4, revenue: 470000000 },
      { name: "Aggressive Agent Payout", commissionRate: activeParticipantsSum + 8, revenue: 750000000 },
      { name: "Conservative Growth Plan", commissionRate: activeParticipantsSum - 2, revenue: 510000000 },
    ];

    return plans.map(p => {
      const comm = (p.revenue * p.commissionRate) / 100;
      const profit = p.revenue - comm;
      const margin = (profit / p.revenue) * 100;
      
      return {
        ...p,
        commission: comm,
        profit,
        margin
      };
    });
  }, [participants]);

  // Filtered Saved Models
  const filteredModels = useMemo(() => {
    return savedModels
      .filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              m.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || m.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  }, [savedModels, searchTerm, statusFilter, sortBy]);

  // Handle Model Actions
  const handleSaveModel = (name: string) => {
    const newModel: SavedModel = {
      id: `model_${Date.now()}`,
      name: name || "Custom Configuration Simulation",
      createdBy: "Admin User",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Draft",
      participants: [...participants],
      stages: [...stages],
      pool: { ...pool }
    };
    setSavedModels([newModel, ...savedModels]);
    triggerToast("Model saved successfully under 'Saved Models'!");
  };

  const handleDuplicateModel = (id: string) => {
    const src = savedModels.find(m => m.id === id);
    if (!src) return;
    const duplicated: SavedModel = {
      ...src,
      id: `model_${Date.now()}`,
      name: `${src.name} (Copy)`,
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Draft"
    };
    setSavedModels([duplicated, ...savedModels]);
    triggerToast("Model duplicated.");
  };

  const handleDeleteModel = (id: string) => {
    setSavedModels(savedModels.filter(m => m.id !== id));
    triggerToast("Model deleted.");
  };

  const handleOpenModel = (model: SavedModel) => {
    setParticipants(model.participants);
    setStages(model.stages);
    setPool(model.pool);
    triggerToast(`Loaded configuration: ${model.name}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#066CF4]" />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Commission Planning & Financial Simulator
            </h1>
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            Sandbox utility for designing, simulating, and evaluating compensation strategies and forecast expenses.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleSaveModel("Simulation Draft - " + new Date().toLocaleTimeString())}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Save Model
          </button>
          <button 
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-[#066CF4] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Setup
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
        <nav className="flex space-x-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-fit">
          {[
            { id: "overview", label: "Overview" },
            { id: "config", label: "Commission Configuration" },
            { id: "simulator", label: "Commission Simulator" },
            { id: "scenario", label: "Scenario Builder" },
            { id: "pool", label: "Revenue & Commission Pool" },
            { id: "forecast", label: "Forecast" },
            { id: "compare", label: "Compare Plans" },
            { id: "models", label: "Saved Models" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- TAB CONTENT AREA --- */}

      {/* TAB 1 — Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">Monthly Rev</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Monthly Revenue</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(calculatedKPIs.totalMonthlyRevenue)}</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Based on simulation active limits</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Annualized</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Annual Revenue</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(calculatedKPIs.totalAnnualRevenue)}</h3>
                <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> Projected run-rate
                </p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Percent className="w-5 h-5 text-amber-500" />
                <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">{calculatedKPIs.commissionPercentage}% Rate</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Commission Cost</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(calculatedKPIs.totalCommissionCost)}</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Sum of participant commissions</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <Coins className="w-5 h-5 text-indigo-500" />
                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">Net Profit</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Company Retained Revenue</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(calculatedKPIs.companyRetainedRevenue)}</h3>
                <p className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1">
                  Gross margin: {calculatedKPIs.grossMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Margins Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-medium block">Gross Margin</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{calculatedKPIs.grossMargin.toFixed(1)}%</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <div className="text-blue-500 font-bold text-xs">GM</div>
              </div>
            </div>
            
            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-medium block">Estimated Net Margin</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{calculatedKPIs.estimatedNetMargin.toFixed(1)}%</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <div className="text-emerald-500 font-bold text-xs">NM</div>
              </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-medium block">Active Sim Model</span>
                <span className="text-base font-bold text-[#066CF4] truncate block max-w-[180px]">{calculatedKPIs.activePlan}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <Lock className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Interactive SVG Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue vs Commission Trend */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Revenue vs Commission Costs</h3>
                  <p className="text-xs text-zinc-500">6-Month interactive trend analysis</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#066CF4] rounded-full inline-block"></span>Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>Commission</span>
                </div>
              </div>
              
              {/* SVG Line Chart */}
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800" />
                  <line x1="0" y1="170" x2="500" y2="170" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800" />

                  {/* Revenue Line */}
                  <path 
                    d="M 10 160 Q 100 130 200 90 T 400 40 T 490 25" 
                    fill="none" 
                    stroke="#066CF4" 
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Commission Line */}
                  <path 
                    d="M 10 190 Q 100 180 200 160 T 400 140 T 490 135" 
                    fill="none" 
                    stroke="#F43F5E" 
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />

                  {/* Interactive Nodes */}
                  <circle cx="200" cy="90" r="5" fill="#066CF4" className="cursor-pointer hover:r-7 transition-all" />
                  <circle cx="200" cy="160" r="5" fill="#F43F5E" className="cursor-pointer hover:r-7 transition-all" />
                </svg>
                {/* Tooltip Overlay */}
                <div className="absolute top-10 left-[180px] bg-zinc-950 text-zinc-100 p-2 rounded-lg shadow-xl text-[10px] pointer-events-none">
                  <p className="font-semibold">Month 3 Peak</p>
                  <p>Rev: {formatCurrency(48000000)}</p>
                  <p>Comm: {formatCurrency(10800000)}</p>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 mt-2 font-medium">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>

            {/* Chart 2: Commission Distribution */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Commission Distribution</h3>
              <p className="text-xs text-zinc-500 mb-6">Allocation share by configured participant types</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* SVG Pie Chart */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Ring segments based on configured values */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e4e7" strokeWidth="12" className="dark:stroke-zinc-800" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#066CF4" strokeWidth="12" strokeDasharray="125 251" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-125" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-185" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Top Share</span>
                    <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-100">Agent</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs w-full max-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#066CF4] rounded-sm"></span>Independent Agent</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">50%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#10B981] rounded-sm"></span>Employee Marketer</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-sm"></span>Referrer / Other</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 — Commission Configuration */}
      {activeTab === "config" && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">1. Commission Participants</h3>
                <p className="text-xs text-zinc-500">Configure participant share rates, lock times, and eligibility parameters.</p>
              </div>
              <button
                onClick={() => {
                  const name = prompt("Enter Participant Name:");
                  if (!name) return;
                  const newPart: Participant = {
                    id: `custom_${Date.now()}`,
                    name,
                    enabled: true,
                    percentage: 2.0,
                    duration: "12 months",
                    description: "Custom administrative tier target rules.",
                    notes: "Sandbox active configuration"
                  };
                  setParticipants([...participants, newPart]);
                  triggerToast("Participant added.");
                }}
                className="px-3 py-1.5 text-xs bg-[#066CF4] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Participant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {participants.map((p) => (
                <div 
                  key={p.id} 
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    p.enabled 
                      ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm" 
                      : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-900 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{p.name}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={p.enabled}
                        onChange={(e) => {
                          setParticipants(participants.map(item => item.id === p.id ? { ...item, enabled: e.target.checked } : item));
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#066CF4]"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Percentage (Share)</label>
                      <div className="relative rounded-lg shadow-sm">
                        <input 
                          type="number" 
                          step="0.1"
                          disabled={!p.enabled}
                          value={p.percentage}
                          onChange={(e) => {
                            setParticipants(participants.map(item => item.id === p.id ? { ...item, percentage: parseFloat(e.target.value) || 0 } : item));
                          }}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-zinc-500 text-xs font-semibold">%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Duration</label>
                      <input 
                        type="text" 
                        disabled={!p.enabled}
                        value={p.duration}
                        onChange={(e) => {
                          setParticipants(participants.map(item => item.id === p.id ? { ...item, duration: e.target.value } : item));
                        }}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100"
                        placeholder="e.g. 12 months"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Notes</label>
                      <textarea 
                        disabled={!p.enabled}
                        value={p.notes}
                        rows={1}
                        onChange={(e) => {
                          setParticipants(participants.map(item => item.id === p.id ? { ...item, notes: e.target.value } : item));
                        }}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">2. Commission Stages</h3>
                <p className="text-xs text-zinc-500">Determine payouts matching specific cycles. Unlimited stages supported.</p>
              </div>
              <button 
                onClick={handleAddStage}
                className="px-3 py-1.5 text-xs bg-[#066CF4] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Stage
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage) => (
                <div 
                  key={stage.id} 
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30"
                >
                  <button 
                    onClick={() => setExpandedStages({ ...expandedStages, [stage.id]: !expandedStages[stage.id] })}
                    className="w-full p-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{stage.name}</span>
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                        {stage.payments}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStage(stage.id);
                        }}
                        className="p-1 hover:bg-rose-50 rounded text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedStages[stage.id] ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </button>

                  {expandedStages[stage.id] && (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">Stage Name</label>
                        <input 
                          type="text" 
                          value={stage.name}
                          onChange={(e) => handleUpdateStage(stage.id, "name", e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">Applicable Payment Range</label>
                        <input 
                          type="text" 
                          value={stage.payments}
                          onChange={(e) => handleUpdateStage(stage.id, "payments", e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">Description</label>
                        <input 
                          type="text" 
                          value={stage.description}
                          onChange={(e) => handleUpdateStage(stage.id, "description", e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Commission Pool Limit Config */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">3. Maximum Commission Pool</h3>
            <p className="text-xs text-zinc-500 mb-6">Cap absolute payout limits as a share of revenue per epoch.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Month One Cap</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={pool.monthOne}
                    onChange={(e) => setPool({ ...pool, monthOne: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent dark:text-zinc-100" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-zinc-500 font-semibold">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Months 2–12 Cap</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={pool.months2to12}
                    onChange={(e) => setPool({ ...pool, months2to12: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent dark:text-zinc-100" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-zinc-500 font-semibold">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Year Two Cap</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={pool.yearTwo}
                    onChange={(e) => setPool({ ...pool, yearTwo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent dark:text-zinc-100" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-zinc-500 font-semibold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3 — Commission Simulator */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription pricing selection */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Plan Parameters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Select Subscription Plan</label>
                  <select 
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="free">Free - ₦0</option>
                    <option value="silver">Silver - ₦15,000</option>
                    <option value="gold">Gold - ₦25,000</option>
                    <option value="platinum">Platinum - ₦50,000</option>
                    <option value="enterprise">Enterprise - ₦150,000</option>
                    <option value="custom">Custom Configuration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Billing Cycle</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    {["monthly", "quarterly", "yearly"].map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle as any)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                          billingCycle === cycle
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedPlan === "custom" && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200">
                  <label className="text-xs text-zinc-500 block mb-1">Custom Subscription Price (₦)</label>
                  <input 
                    type="number" 
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent dark:text-zinc-100" 
                  />
                </div>
              )}
            </div>

            {/* Structure override list */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Commission Override (Simulation Only)</h3>
              <p className="text-xs text-zinc-500 mb-6">Modify commission structures for simulation without writing to the permanent configuration.</p>
              
              <div className="space-y-4">
                {participants.filter(p => p.enabled).map((p) => {
                  const currentPct = simulatorOverride[p.id] !== undefined ? simulatorOverride[p.id] : p.percentage;
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 rounded-lg">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 block">Default: {p.percentage}%</span>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <input 
                          type="range" 
                          min="0" 
                          max="25" 
                          step="0.5"
                          value={currentPct}
                          onChange={(e) => {
                            setSimulatorOverride({
                              ...simulatorOverride,
                              [p.id]: parseFloat(e.target.value)
                            });
                          }}
                          className="w-full sm:w-48 accent-[#066CF4] h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#066CF4] w-12 text-right">{currentPct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setSimulatorOverride({});
                    triggerToast("Simulator overrides cleared.");
                  }}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Reset Overrides
                </button>
              </div>
            </div>
          </div>

          {/* Simulation outputs */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#066CF4] to-blue-700 text-white rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider">Estimated Lifetime Output</h3>
              <p className="text-2xl font-black mt-2">{formatCurrency(simulatorPayouts.lifetime.revenue)}</p>
              <p className="text-xs opacity-75 mt-1">Based on a 24-month subscriber projection</p>

              <div className="mt-6 space-y-4 pt-6 border-t border-white/20 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-80">Accumulated Commission</span>
                  <span className="font-bold">{formatCurrency(simulatorPayouts.lifetime.commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Company Retained Cash</span>
                  <span className="font-bold">{formatCurrency(simulatorPayouts.lifetime.retained)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Average Net Margin</span>
                  <span className="font-bold">{simulatorPayouts.lifetime.margin.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Ephemeral outputs grid */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Month One Payout</span>
                  <span className="text-xs font-bold text-emerald-500">{simulatorPayouts.monthOne.margin.toFixed(1)}% Margin</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Gross Revenue</span>
                    <span>{formatCurrency(simulatorPayouts.monthOne.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Commission Payout</span>
                    <span>{formatCurrency(simulatorPayouts.monthOne.commission)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Months 2–12 Payouts</span>
                  <span className="text-xs font-bold text-emerald-500">{simulatorPayouts.months2to12.margin.toFixed(1)}% Margin</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Gross Revenue</span>
                    <span>{formatCurrency(simulatorPayouts.months2to12.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Commission Payout</span>
                    <span>{formatCurrency(simulatorPayouts.months2to12.commission)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Year Two Payouts</span>
                  <span className="text-xs font-bold text-emerald-500">{simulatorPayouts.yearTwo.margin.toFixed(1)}% Margin</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Gross Revenue</span>
                    <span>{formatCurrency(simulatorPayouts.yearTwo.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Commission Payout</span>
                    <span>{formatCurrency(simulatorPayouts.yearTwo.commission)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4 — Scenario Builder */}
      {activeTab === "scenario" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Modeling Input Controls */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Simulation Inputs</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">Number of Businesses ({scenarioInputs.numBusinesses})</label>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={scenarioInputs.numBusinesses}
                  onChange={(e) => setScenarioInputs({ ...scenarioInputs, numBusinesses: parseInt(e.target.value) })}
                  className="w-full accent-[#066CF4]"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Average Monthly Subscription (₦{scenarioInputs.averageSubscription.toLocaleString()})</label>
                <input 
                  type="range" 
                  min="5000" 
                  max="100000" 
                  step="2500"
                  value={scenarioInputs.averageSubscription}
                  onChange={(e) => setScenarioInputs({ ...scenarioInputs, averageSubscription: parseInt(e.target.value) })}
                  className="w-full accent-[#066CF4]"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Monthly Churn Rate ({scenarioInputs.monthlyChurn}%)</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.1"
                  value={scenarioInputs.monthlyChurn}
                  onChange={(e) => setScenarioInputs({ ...scenarioInputs, monthlyChurn: parseFloat(e.target.value) })}
                  className="w-full accent-[#066CF4]"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Num Agents ({scenarioInputs.numAgents})</label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={scenarioInputs.numAgents}
                  onChange={(e) => setScenarioInputs({ ...scenarioInputs, numAgents: parseInt(e.target.value) })}
                  className="w-full accent-[#066CF4]"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Expected Monthly Growth ({scenarioInputs.expectedGrowthRate}%)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  value={scenarioInputs.expectedGrowthRate}
                  onChange={(e) => setScenarioInputs({ ...scenarioInputs, expectedGrowthRate: parseFloat(e.target.value) })}
                  className="w-full accent-[#066CF4]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setScenarioInputs({
                  numBusinesses: 450,
                  averageSubscription: 18500,
                  monthlyChurn: 2.2,
                  referralRate: 12.0,
                  upgradeRate: 4.5,
                  numAgents: 15,
                  numSupervisors: 3,
                  numEmployeeMarketers: 6,
                  expectedGrowthRate: 8.5,
                })}
                className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Outputs & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Projected Revenue</span>
                <p className="text-lg font-black text-zinc-800 dark:text-zinc-100 mt-1">{formatCurrency(scenarioOutputs.revenue)}</p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Projected Commission</span>
                <p className="text-lg font-black text-rose-500 mt-1">{formatCurrency(scenarioOutputs.commission)}</p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Net Retained Profit</span>
                <p className="text-lg font-black text-emerald-500 mt-1">{formatCurrency(scenarioOutputs.profit)}</p>
              </div>
            </div>

            {/* Growth Curve Chart representation */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">12-Month Projected Growth Curve</h4>
              
              <div className="relative h-48 w-full flex items-end justify-between gap-2 pt-6">
                {scenarioOutputs.monthlyProjections.map((p, idx) => {
                  const maxRevenue = Math.max(...scenarioOutputs.monthlyProjections.map(x => x.revenue));
                  const barHeight = maxRevenue ? (p.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        style={{ height: `${barHeight}%` }} 
                        className="w-full bg-[#066CF4]/80 hover:bg-[#066CF4] transition-colors rounded-t-sm relative group cursor-pointer"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-950 text-white text-[9px] p-1.5 rounded shadow-lg whitespace-nowrap z-10">
                          Rev: {formatCurrency(p.revenue)}
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-bold">M{p.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5 — Revenue & Commission Pool */}
      {activeTab === "pool" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Gross Commission Liability</h4>
              <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mt-2">{formatCurrency(calculatedKPIs.totalCommissionCost * 1.5)}</p>
              <p className="text-xs text-zinc-400 mt-1">Pending approval settlements</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Commission Paid (YTD)</h4>
              <p className="text-2xl font-black text-emerald-500 mt-2">{formatCurrency(calculatedKPIs.totalCommissionCost * 4.2)}</p>
              <p className="text-xs text-zinc-400 mt-1">Completed outbound ledger transactions</p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Retained Gross Pool Cap</h4>
              <p className="text-2xl font-black text-[#066CF4] mt-2">{calculatedKPIs.grossMargin.toFixed(1)}%</p>
              <p className="text-xs text-zinc-400 mt-1">Net threshold safety bounds</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Commission breakdown by tier</h3>
            
            <div className="space-y-4">
              {participants.filter(p => p.enabled).map((p) => {
                const totalCost = (calculatedKPIs.totalMonthlyRevenue * p.percentage) / 100;
                const poolShareRatio = (p.percentage / calculatedKPIs.commissionPercentage) * 100;
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{p.name} ({p.percentage}%)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${poolShareRatio}%` }} 
                        className="bg-[#066CF4] h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6 — Forecast */}
      {activeTab === "forecast" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Long-term Financial Forecasting</h3>
            <p className="text-xs text-zinc-500 mb-6">Estimate revenue, commissions, and margins across extended horizons.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "12-Month Forecast", rev: calculatedKPIs.totalMonthlyRevenue * 12, margin: calculatedKPIs.grossMargin },
                { label: "24-Month Forecast", rev: calculatedKPIs.totalMonthlyRevenue * 24 * 1.15, margin: calculatedKPIs.grossMargin + 2 },
                { label: "36-Month Forecast", rev: calculatedKPIs.totalMonthlyRevenue * 36 * 1.35, margin: calculatedKPIs.grossMargin + 4.5 },
              ].map((f, index) => {
                const comm = (f.rev * (100 - f.margin)) / 100;
                const profit = f.rev - comm;
                return (
                  <div key={index} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <span className="text-xs font-bold text-[#066CF4]">{f.label}</span>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Projected Revenue</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-100">{formatCurrency(f.rev)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Commission Cost</span>
                        <span className="font-bold text-rose-500">{formatCurrency(comm)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Net Profit</span>
                        <span className="font-bold text-emerald-500">{formatCurrency(profit)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7 — Compare Plans */}
      {activeTab === "compare" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Compensation Plan Comparison Matrix</h3>
          <p className="text-xs text-zinc-500 mb-6">Side-by-side analysis of simulated structures to evaluate optimal profitability.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium">
                  <th className="py-3 px-4">Plan Model</th>
                  <th className="py-3 px-4">Commission %</th>
                  <th className="py-3 px-4">Annual Revenue</th>
                  <th className="py-3 px-4">Commission Cost</th>
                  <th className="py-3 px-4">Retained Profit</th>
                  <th className="py-3 px-4">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium text-zinc-700 dark:text-zinc-300">
                {comparePlansTable.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/10">
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</td>
                    <td className="py-3.5 px-4 text-[#066CF4]">{p.commissionRate.toFixed(1)}%</td>
                    <td className="py-3.5 px-4">{formatCurrency(p.revenue)}</td>
                    <td className="py-3.5 px-4 text-rose-500">{formatCurrency(p.commission)}</td>
                    <td className="py-3.5 px-4 text-emerald-500">{formatCurrency(p.profit)}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8 — Saved Models */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="updated">Sort by Updated</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModels.map((model) => (
              <div key={model.id} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      model.status === "Active" 
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                        : model.status === "Draft" 
                        ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {model.status}
                    </span>
                    <span className="text-[10px] text-zinc-400">Updated: {model.lastUpdated}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{model.name}</h4>
                  <p className="text-xs text-zinc-500">Created by: {model.createdBy} on {model.createdDate}</p>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button 
                    onClick={() => handleOpenModel(model)}
                    className="px-2.5 py-1.5 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md font-medium"
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => handleDuplicateModel(model.id)}
                    className="px-2.5 py-1.5 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md font-medium"
                  >
                    Duplicate
                  </button>
                  <button 
                    onClick={() => handleDeleteModel(model.id)}
                    className="px-2.5 py-1.5 text-[11px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-md font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="col-span-full p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/10">
                <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No saved models found matching filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9 — Reports */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Generate Planning Report</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "Excel", "CSV"].map((fmt) => (
                    <button 
                      key={fmt}
                      className="py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg font-bold text-center hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Report Type</label>
                <select className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-100">
                  <option>Commission Summary & Tiers</option>
                  <option>Financial Budget Simulation</option>
                  <option>Scenario Sensitivity Forecast</option>
                  <option>Plan Comparison Table</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Date Range</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent dark:text-zinc-100" 
                  defaultValue="2026-07-09"
                />
              </div>

              <button
                onClick={() => {
                  setLoadingState("generating");
                  setTimeout(() => {
                    setLoadingState(null);
                    triggerToast("Report generated successfully!");
                  }, 1200);
                }}
                disabled={loadingState !== null}
                className="w-full py-2 bg-[#066CF4] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                {loadingState ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export Report
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Report Preview</h4>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">Vemtap FOS - Commission Simulation Report</span>
                    <p className="text-[10px] text-zinc-400">Report Run: 2026-07-09</p>
                  </div>
                  <Coins className="w-5 h-5 text-[#066CF4]" />
                </div>

                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Selected Plan model</span>
                    <span className="font-semibold">{calculatedKPIs.activePlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gross Simulation Revenue (Monthly)</span>
                    <span className="font-semibold">{formatCurrency(calculatedKPIs.totalMonthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Effective Commission Payout (Rate)</span>
                    <span className="font-semibold text-rose-500">{calculatedKPIs.commissionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Annual Net Retained Cashflow</span>
                    <span className="font-semibold text-emerald-500">{formatCurrency(calculatedKPIs.companyRetainedRevenue * 12)}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 mt-4 text-center">
              Generate report file to download standard verified audit sheets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
