import { NextRequest, NextResponse } from "next/server";

// Inline mock data to avoid server-side import issues
const MOCK_DATA: Record<string, unknown> = {
  "/api/v1/auth/login": {
    access_token: "mock_jwt_token_dev_12345",
    user: {
      id: "usr_001",
      email: "admin@vemtap.com",
      firstName: "Admin",
      lastName: "User",
      role: "SUPER_ADMIN",
    },
  },

  "/api/v1/dashboard/stats": {
    totalRevenue: 2847500,
    netProfit: 1423750,
    totalBusinesses: 342,
    activeAgents: 28,
    churnRate: 2.3,
    conversionRate: 18.7,
    smsSent: 1245800,
    vemtapRevenue: 1993250,
    qrthriveRevenue: 854250,
    commissionsPaid: 425600,
    cashBalance: 892300,
  },

  "/api/v1/dashboard/snapshots": [
    { date: "2026-06-18", totalRevenue: 85000, totalProfit: 42000, totalBusinesses: 330, churnRate: 1.5, conversionRate: 15.0 },
    { date: "2026-06-19", totalRevenue: 92000, totalProfit: 48000, totalBusinesses: 331, churnRate: 1.8, conversionRate: 16.2 },
    { date: "2026-06-20", totalRevenue: 88000, totalProfit: 44000, totalBusinesses: 331, churnRate: 2.1, conversionRate: 17.5 },
    { date: "2026-06-21", totalRevenue: 95000, totalProfit: 51000, totalBusinesses: 332, churnRate: 1.9, conversionRate: 18.0 },
    { date: "2026-06-22", totalRevenue: 91000, totalProfit: 46000, totalBusinesses: 333, churnRate: 2.0, conversionRate: 16.8 },
    { date: "2026-06-23", totalRevenue: 98000, totalProfit: 53000, totalBusinesses: 334, churnRate: 1.7, conversionRate: 19.1 },
    { date: "2026-06-24", totalRevenue: 87000, totalProfit: 43000, totalBusinesses: 334, churnRate: 2.2, conversionRate: 15.5 },
    { date: "2026-06-25", totalRevenue: 94000, totalProfit: 50000, totalBusinesses: 335, churnRate: 1.6, conversionRate: 17.2 },
    { date: "2026-06-26", totalRevenue: 89000, totalProfit: 45000, totalBusinesses: 336, churnRate: 2.3, conversionRate: 18.3 },
    { date: "2026-06-27", totalRevenue: 96000, totalProfit: 52000, totalBusinesses: 336, churnRate: 1.8, conversionRate: 16.0 },
    { date: "2026-06-28", totalRevenue: 93000, totalProfit: 49000, totalBusinesses: 337, churnRate: 2.0, conversionRate: 17.8 },
    { date: "2026-06-29", totalRevenue: 90000, totalProfit: 47000, totalBusinesses: 338, churnRate: 1.9, conversionRate: 18.5 },
    { date: "2026-06-30", totalRevenue: 97000, totalProfit: 54000, totalBusinesses: 338, churnRate: 2.1, conversionRate: 16.7 },
    { date: "2026-07-01", totalRevenue: 101000, totalProfit: 55000, totalBusinesses: 339, churnRate: 1.5, conversionRate: 19.0 },
    { date: "2026-07-02", totalRevenue: 99000, totalProfit: 53000, totalBusinesses: 340, churnRate: 1.7, conversionRate: 18.2 },
    { date: "2026-07-03", totalRevenue: 104000, totalProfit: 58000, totalBusinesses: 340, churnRate: 1.4, conversionRate: 20.1 },
    { date: "2026-07-04", totalRevenue: 98000, totalProfit: 51000, totalBusinesses: 341, churnRate: 1.9, conversionRate: 17.4 },
    { date: "2026-07-05", totalRevenue: 106000, totalProfit: 59000, totalBusinesses: 341, churnRate: 1.6, conversionRate: 19.3 },
    { date: "2026-07-06", totalRevenue: 102000, totalProfit: 56000, totalBusinesses: 342, churnRate: 1.8, conversionRate: 18.0 },
    { date: "2026-07-07", totalRevenue: 108000, totalProfit: 61000, totalBusinesses: 342, churnRate: 1.3, conversionRate: 20.5 },
  ],

  "/api/v1/dashboard/insights": [
    { type: "revenue", title: "Revenue Surge", message: "Revenue is up 12.4% compared to last month. SMS revenue drove most of the growth.", severity: "SUCCESS" },
    { type: "churn", title: "Churn Watch", message: "3 businesses haven't logged in for 14+ days. Consider reaching out.", severity: "WARNING" },
    { type: "agent", title: "Top Performer", message: "Agent Chidinma Eze closed 8 new businesses this month — highest among all agents.", severity: "INFO" },
    { type: "sms", title: "SMS Cost Spike", message: "SMS costs increased 8.2% — review pricing tiers or renegotiate with Termii.", severity: "DANGER" },
  ],

  "/api/v1/revenue/transactions": {
    transactions: [
      { id: "txn_001", type: "SUBSCRIPTION", paymentMethod: "CARD", amount: 45000, cost: 0, profit: 45000, referenceId: "ref_001", date: "2026-07-06", businessId: "biz_001", businessName: "Lagos Pizza Co.", agentId: "agt_001", agentName: "Chidinma Eze" },
      { id: "txn_002", type: "SMS", paymentMethod: "WALLET", amount: 12500, cost: 4200, profit: 8300, referenceId: "ref_002", date: "2026-07-06", businessId: "biz_002", businessName: "QuickServe.ng", agentId: "agt_002", agentName: "Tunde Bakare" },
      { id: "txn_003", type: "SUBSCRIPTION", paymentMethod: "TRANSFER", amount: 75000, cost: 0, profit: 75000, referenceId: "ref_003", date: "2026-07-05", businessId: "biz_003", businessName: "NovaTech Solutions", agentId: "agt_001", agentName: "Chidinma Eze" },
      { id: "txn_004", type: "SMS", paymentMethod: "CARD", amount: 8300, cost: 2800, profit: 5500, referenceId: "ref_004", date: "2026-07-05", businessId: "biz_004", businessName: "GreenLeaf Farms", agentId: "agt_003", agentName: "Amina Yusuf" },
      { id: "txn_005", type: "COMMISSION", paymentMethod: "TRANSFER", amount: 15000, cost: 0, profit: -15000, referenceId: "ref_005", date: "2026-07-04", businessId: null, businessName: null, agentId: "agt_001", agentName: "Chidinma Eze" },
      { id: "txn_006", type: "SUBSCRIPTION", paymentMethod: "CARD", amount: 35000, cost: 0, profit: 35000, referenceId: "ref_006", date: "2026-07-04", businessId: "biz_005", businessName: "Fashion Hub Lagos", agentId: "agt_004", agentName: "Emeka Obi" },
      { id: "txn_007", type: "ENTERPRISE", paymentMethod: "TRANSFER", amount: 250000, cost: 0, profit: 250000, referenceId: "ref_007", date: "2026-07-03", businessId: "biz_006", businessName: "Zenith Logistics", agentId: "agt_002", agentName: "Tunde Bakare" },
      { id: "txn_008", type: "SMS", paymentMethod: "WALLET", amount: 6200, cost: 2100, profit: 4100, referenceId: "ref_008", date: "2026-07-03", businessId: "biz_007", businessName: "Academy Plus", agentId: "agt_005", agentName: "Ngozi Ade" },
      { id: "txn_009", type: "SUBSCRIPTION", paymentMethod: "CARD", amount: 55000, cost: 0, profit: 55000, referenceId: "ref_009", date: "2026-07-02", businessId: "biz_008", businessName: "HealthBridge Clinic", agentId: "agt_003", agentName: "Amina Yusuf" },
      { id: "txn_010", type: "SMS", paymentMethod: "TRANSFER", amount: 18700, cost: 6300, profit: 12400, referenceId: "ref_010", date: "2026-07-02", businessId: "biz_009", businessName: "Prime Logistics", agentId: "agt_001", agentName: "Chidinma Eze" },
    ],
    total: 247,
  },

  "/api/v1/revenue/aggregates": {
    totalRevenue: 2847500,
    subscriptionRevenue: 1890000,
    smsRevenue: 957500,
    totalProfit: 1423750,
    agentPayouts: 425600,
    totalTransactions: 2847,
  },

  "/api/v1/revenue/trends": [
    { date: "2026-01", revenue: 180000, profit: 90000 },
    { date: "2026-02", revenue: 195000, profit: 98000 },
    { date: "2026-03", revenue: 210000, profit: 105000 },
    { date: "2026-04", revenue: 228000, profit: 114000 },
    { date: "2026-05", revenue: 245000, profit: 122000 },
    { date: "2026-06", revenue: 262000, profit: 131000 },
    { date: "2026-07", revenue: 280000, profit: 140000 },
  ],

  "/api/v1/revenue/chart-data": {
    monthlyPlatformRevenue: [
      { month: "2026-02", total: 195000, vemtap: 130000, qrthrive: 65000 },
      { month: "2026-03", total: 210000, vemtap: 140000, qrthrive: 70000 },
      { month: "2026-04", total: 228000, vemtap: 152000, qrthrive: 76000 },
      { month: "2026-05", total: 245000, vemtap: 163000, qrthrive: 82000 },
      { month: "2026-06", total: 262000, vemtap: 175000, qrthrive: 87000 },
      { month: "2026-07", total: 280000, vemtap: 187000, qrthrive: 93000 },
    ],
    revenueByType: [
      { name: "Subscriptions", value: 1890000 },
      { name: "SMS", value: 957500 },
    ],
  },

  "/api/v1/expenses": {
    expenses: [
      { id: "exp_001", category: "Server & Hosting", amount: 85000, frequency: "RECURRING", date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "exp_002", category: "SMS Gateway (Termii)", amount: 420000, frequency: "RECURRING", date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "exp_003", category: "Staff Salaries", amount: 1200000, frequency: "RECURRING", date: "2026-07-05", createdAt: "2026-07-05T00:00:00.000Z" },
      { id: "exp_004", category: "Office Rent", amount: 350000, frequency: "RECURRING", date: "2026-06-18", createdAt: "2026-06-18T00:00:00.000Z" },
      { id: "exp_005", category: "Marketing & Ads", amount: 175000, frequency: "ONE_TIME", date: "2026-07-03", createdAt: "2026-07-03T00:00:00.000Z" },
      { id: "exp_006", category: "Software Licenses", amount: 45000, frequency: "RECURRING", date: "2026-06-26", createdAt: "2026-06-26T00:00:00.000Z" },
      { id: "exp_007", category: "Internet & Utilities", amount: 35000, frequency: "RECURRING", date: "2026-06-28", createdAt: "2026-06-28T00:00:00.000Z" },
      { id: "exp_008", category: "Miscellaneous", amount: 22000, frequency: "ONE_TIME", date: "2026-07-04", createdAt: "2026-07-04T00:00:00.000Z" },
    ],
    total: 8,
  },

  "/api/v1/pnl/statement": {
    grossRevenue: 2847500,
    gatewayCost: 85425,
    commissionPaid: 425600,
    opexPaid: 2310000,
    netProfit: 1423750,
    profitMarginPercentage: 50.0,
  },

  "/api/v1/pnl/cashflows": {
    cashflows: [
      { id: "cf_001", type: "INFLOW", category: "Subscriptions", amount: 1890000, date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "cf_002", type: "INFLOW", category: "SMS Revenue", amount: 957500, date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "cf_003", type: "OUTFLOW", category: "Staff Salaries", amount: 1200000, date: "2026-07-05", createdAt: "2026-07-05T00:00:00.000Z" },
      { id: "cf_004", type: "OUTFLOW", category: "Server & Hosting", amount: 85000, date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "cf_005", type: "OUTFLOW", category: "SMS Gateway Fees", amount: 420000, date: "2026-07-01", createdAt: "2026-07-01T00:00:00.000Z" },
      { id: "cf_006", type: "OUTFLOW", category: "Office Rent", amount: 350000, date: "2026-06-18", createdAt: "2026-06-18T00:00:00.000Z" },
      { id: "cf_007", type: "OUTFLOW", category: "Marketing", amount: 175000, date: "2026-07-03", createdAt: "2026-07-03T00:00:00.000Z" },
    ],
    total: 7,
  },

  "/api/v1/pnl/cashflow-runway": {
    openingCashBalance: 650000,
    closingCashBalance: 892300,
    monthlyNetCashFlow: 242300,
    monthlyBurnRate: 2230000,
    runwayMonths: 12,
  },

  "/api/v1/pnl/cost-break-even": {
    totalMonthlyCosts: 2310000,
    monthlyFixedCosts: 1635000,
    grossRevenue: 2847500,
    activeBusinesses: 342,
    arpu: 8324,
    breakEvenBusinesses: 196,
    breakEvenRevenue: 1635000,
    progressPercent: 210,
    remainingGap: 0,
    isProfitable: true,
  },

  "/api/v1/pnl/revenue-trends": [
    { month: "2026-01", revenue: 180000, costs: 140000, profit: 40000 },
    { month: "2026-02", revenue: 195000, costs: 145000, profit: 50000 },
    { month: "2026-03", revenue: 210000, costs: 150000, profit: 60000 },
    { month: "2026-04", revenue: 228000, costs: 155000, profit: 73000 },
    { month: "2026-05", revenue: 245000, costs: 160000, profit: 85000 },
    { month: "2026-06", revenue: 262000, costs: 165000, profit: 97000 },
    { month: "2026-07", revenue: 280000, costs: 170000, profit: 110000 },
  ],

  "/api/v1/budgets": [
    { id: "bud_001", periodType: "MONTHLY", targetRevenue: 3000000, targetBusinesses: 350, targetSmsUsage: 1500000, targetProfit: 1500000, startDate: "2026-06-18", endDate: "2026-07-18", achievedRevenuePercentage: 94.9, achievedProfitPercentage: 94.9 },
  ],

  "/api/v1/budgets/forecasts": [
    { id: "fc_001", forecastType: "REVENUE", projectedValue: 3200000, growthRate: 12.3, churnRate: 2.1, conversionRate: 18.5, period: "2026-07", scenario: "EXPECTED" },
    { id: "fc_002", forecastType: "PROFIT", projectedValue: 1600000, growthRate: 12.5, churnRate: 2.0, conversionRate: 19.0, period: "2026-07", scenario: "EXPECTED" },
  ],

  "/api/v1/goals": {
    goals: [
      { id: "goal_001", name: "Reach 400 Businesses", target: 400, current: 342, deadline: "2026-10-18", category: "Growth" },
      { id: "goal_002", name: "Monthly Revenue 3.5M", target: 3500000, current: 2847500, deadline: "2026-09-18", category: "Revenue" },
      { id: "goal_003", name: "Reduce Churn to 1.5%", target: 1.5, current: 2.3, deadline: "2026-08-18", category: "Retention" },
      { id: "goal_004", name: "Agent Network 35", target: 35, current: 28, deadline: "2026-11-18", category: "Growth" },
    ],
    projects: [
      { id: "proj_001", name: "QRThrive V2 Launch", budget: 500000, spent: 320000, revenue: 850000, status: "IN_PROGRESS", deadline: "2026-08-18" },
      { id: "proj_002", name: "Mobile App MVP", budget: 800000, spent: 150000, revenue: 0, status: "IN_PROGRESS", deadline: "2026-10-18" },
      { id: "proj_003", name: "Enterprise Dashboard", budget: 350000, spent: 350000, revenue: 1200000, status: "COMPLETED", deadline: "2026-07-28" },
    ],
  },

  "/api/v1/receivables": {
    invoices: [
      { customer: "Zenith Logistics", amount: 250000, dueDate: "2026-07-23", status: "OVERDUE" },
      { customer: "Lagos Pizza Co.", amount: 45000, dueDate: "2026-07-13", status: "PENDING" },
      { customer: "QuickServe.ng", amount: 35000, dueDate: "2026-07-08", status: "PENDING" },
      { customer: "NovaTech Solutions", amount: 75000, dueDate: "2026-07-03", status: "PENDING" },
      { customer: "GreenLeaf Farms", amount: 12000, dueDate: "2026-06-28", status: "PAID" },
      { customer: "Fashion Hub Lagos", amount: 35000, dueDate: "2026-06-23", status: "PAID" },
    ],
    totalOutstanding: 395000,
    totalOverdue: 250000,
    collectedThisMonth: 450000,
  },

  "/api/v1/payables": {
    monthlySalary: 1200000,
    totalBills: 2310000,
    totalPayables: 890000,
    dueThisWeek: 420000,
    dueThisMonth: 890000,
    overdue: 85000,
    bills: [
      { description: "Termii SMS Gateway", amount: 420000, dueDate: "2026-07-15", status: "PENDING", category: "Gateway" },
      { description: "AWS Hosting", amount: 85000, dueDate: "2026-07-11", status: "PENDING", category: "Infrastructure" },
      { description: "Office Rent", amount: 350000, dueDate: "2026-07-03", status: "PENDING", category: "Office" },
      { description: "Internet (Spectranet)", amount: 35000, dueDate: "2026-06-28", status: "PAID", category: "Utilities" },
      { description: "Software Licenses", amount: 45000, dueDate: "2026-07-08", status: "PAID", category: "Software" },
    ],
    paymentSchedule: [
      { description: "Staff Salaries", amount: 1200000, dueDate: "2026-06-20", status: "PENDING", category: "Payroll" },
      { description: "Termii SMS Gateway", amount: 420000, dueDate: "2026-07-15", status: "PENDING", category: "Gateway" },
      { description: "AWS Hosting", amount: 85000, dueDate: "2026-07-11", status: "PENDING", category: "Infrastructure" },
    ],
  },

  "/api/v1/businesses/admin": {
    data: [
      { id: "biz_001", name: "Lagos Pizza Co.", owner: "Chukwuemeka Obi", plan: "PRO", mrr: 45000, status: "ACTIVE", joinDate: "2026-01-18", renewalDate: "2026-06-18", lastPaymentDate: "2026-07-13", agentId: "agt_001", agentName: "Chidinma Eze", smsUsed: 12500, emailUsed: 3200 },
      { id: "biz_002", name: "QuickServe.ng", owner: "Tunde Bakare", plan: "ENTERPRISE", mrr: 75000, status: "ACTIVE", joinDate: "2026-03-18", renewalDate: "2026-07-03", lastPaymentDate: "2026-07-16", agentId: "agt_002", agentName: "Tunde Bakare", smsUsed: 45000, emailUsed: 8700 },
      { id: "biz_003", name: "NovaTech Solutions", owner: "Amina Yusuf", plan: "GOLD", mrr: 55000, status: "ACTIVE", joinDate: "2026-04-18", renewalDate: "2026-06-03", lastPaymentDate: "2026-07-17", agentId: "agt_003", agentName: "Amina Yusuf", smsUsed: 22000, emailUsed: 5100 },
      { id: "biz_004", name: "GreenLeaf Farms", owner: "Emeka Obi", plan: "BASIC", mrr: 25000, status: "ACTIVE", joinDate: "2025-12-28", renewalDate: "2026-05-18", lastPaymentDate: "2026-07-08", agentId: "agt_004", agentName: "Emeka Obi", smsUsed: 8000, emailUsed: 1200 },
      { id: "biz_005", name: "Fashion Hub Lagos", owner: "Ngozi Ade", plan: "SILVER", mrr: 35000, status: "TRIAL", joinDate: "2026-07-03", renewalDate: null, lastPaymentDate: null, agentId: "agt_005", agentName: "Ngozi Ade", smsUsed: 2500, emailUsed: 400 },
      { id: "biz_006", name: "Zenith Logistics", owner: "Adebayo Johnson", plan: "ENTERPRISE", mrr: 120000, status: "ACTIVE", joinDate: "2025-07-18", renewalDate: "2026-07-08", lastPaymentDate: "2026-07-15", agentId: "agt_002", agentName: "Tunde Bakare", smsUsed: 85000, emailUsed: 15000 },
      { id: "biz_007", name: "Academy Plus", owner: "Fatima Ibrahim", plan: "PRO", mrr: 45000, status: "ACTIVE", joinDate: "2026-05-18", renewalDate: "2026-06-28", lastPaymentDate: "2026-07-11", agentId: "agt_005", agentName: "Ngozi Ade", smsUsed: 15000, emailUsed: 3800 },
      { id: "biz_008", name: "HealthBridge Clinic", owner: "Dr. Oluwaseun", plan: "GOLD", mrr: 55000, status: "CHURNED", joinDate: "2025-09-18", renewalDate: "2026-08-18", lastPaymentDate: "2026-06-03", agentId: "agt_003", agentName: "Amina Yusuf", smsUsed: 0, emailUsed: 0 },
    ],
    meta: { total: 342, page: 1, lastPage: 43 },
    stats: { total: 342, active: 298, pending: 28, suspended: 16, approvedToday: 3, avgWaitTime: "2h 15m" },
  },

  "/api/v1/businesses/stats": {
    activeBusinesses: 298,
    totalMrr: 14250000,
    churnRate: 2.3,
    churnedCount: 8,
    totalBusinesses: 342,
    bestSellingPlan: { plan: "PRO", totalMrr: 5400000, businessCount: 120 },
    planDistribution: [
      { plan: "BASIC", count: 85, totalMrr: 2125000 },
      { plan: "SILVER", count: 72, totalMrr: 2520000 },
      { plan: "PRO", count: 120, totalMrr: 5400000 },
      { plan: "GOLD", count: 45, totalMrr: 2475000 },
      { plan: "ENTERPRISE", count: 20, totalMrr: 1730000 },
    ],
    statusDistribution: [
      { status: "ACTIVE", count: 298 },
      { status: "TRIAL", count: 28 },
      { status: "CHURNED", count: 16 },
    ],
  },

  "/api/v1/affiliates/agents": {
    agents: [
      { id: "agt_001", name: "Chidinma Eze", email: "chidinma@agents.com", phone: "+2348012345678", status: "ACTIVE", dateJoined: "2025-12-28", managerId: null, managerName: null, businessesCount: 45, managedMrr: 1875000, commissionEarned: 187500 },
      { id: "agt_002", name: "Tunde Bakare", email: "tunde@agents.com", phone: "+2348098765432", status: "ACTIVE", dateJoined: "2026-01-18", managerId: "agt_001", managerName: "Chidinma Eze", businessesCount: 38, managedMrr: 2100000, commissionEarned: 210000 },
      { id: "agt_003", name: "Amina Yusuf", email: "amina@agents.com", phone: "+2348055544433", status: "ACTIVE", dateJoined: "2026-02-18", managerId: null, managerName: null, businessesCount: 32, managedMrr: 1540000, commissionEarned: 154000 },
      { id: "agt_004", name: "Emeka Obi", email: "emeka@agents.com", phone: "+2348011122233", status: "ACTIVE", dateJoined: "2026-03-18", managerId: "agt_001", managerName: "Chidinma Eze", businessesCount: 25, managedMrr: 925000, commissionEarned: 92500 },
      { id: "agt_005", name: "Ngozi Ade", email: "ngozi@agents.com", phone: "+2348044455566", status: "ACTIVE", dateJoined: "2026-04-18", managerId: "agt_003", managerName: "Amina Yusuf", businessesCount: 18, managedMrr: 675000, commissionEarned: 67500 },
      { id: "agt_006", name: "Yemi Alade", email: "yemi@agents.com", phone: "+2348077788899", status: "SUSPENDED", dateJoined: "2025-09-18", managerId: null, managerName: null, businessesCount: 12, managedMrr: 340000, commissionEarned: 34000 },
    ],
    total: 28,
  },

  "/api/v1/messaging/sms": {
    logs: [
      { id: "sms_0", businessId: "biz_001", businessName: "Lagos Pizza Co.", smsCount: 1250, costPerSms: 2.5, sellingPricePerSms: 4.0, totalCost: 3125, totalRevenue: 5000, totalProfit: 1875, date: "2026-07-06" },
      { id: "sms_1", businessId: "biz_002", businessName: "QuickServe.ng", smsCount: 3200, costPerSms: 2.5, sellingPricePerSms: 4.0, totalCost: 8000, totalRevenue: 12800, totalProfit: 4800, date: "2026-07-05" },
      { id: "sms_2", businessId: "biz_003", businessName: "NovaTech Solutions", smsCount: 1800, costPerSms: 2.5, sellingPricePerSms: 4.0, totalCost: 4500, totalRevenue: 7200, totalProfit: 2700, date: "2026-07-04" },
      { id: "sms_3", businessId: "biz_004", businessName: "GreenLeaf Farms", smsCount: 600, costPerSms: 2.5, sellingPricePerSms: 4.0, totalCost: 1500, totalRevenue: 2400, totalProfit: 900, date: "2026-07-03" },
      { id: "sms_4", businessId: "biz_005", businessName: "Fashion Hub", smsCount: 900, costPerSms: 2.5, sellingPricePerSms: 4.0, totalCost: 2250, totalRevenue: 3600, totalProfit: 1350, date: "2026-07-02" },
    ],
    total: 5,
  },

  "/api/v1/messaging/email": {
    logs: [
      { id: "email_0", businessId: "biz_001", businessName: "Lagos Pizza Co.", emailCount: 350, costPerEmail: 0.5, sellingPricePerEmail: 1.5, totalCost: 175, totalRevenue: 525, totalProfit: 350, date: "2026-07-06" },
      { id: "email_1", businessId: "biz_002", businessName: "QuickServe.ng", emailCount: 780, costPerEmail: 0.5, sellingPricePerEmail: 1.5, totalCost: 390, totalRevenue: 1170, totalProfit: 780, date: "2026-07-05" },
      { id: "email_2", businessId: "biz_003", businessName: "NovaTech Solutions", emailCount: 520, costPerEmail: 0.5, sellingPricePerEmail: 1.5, totalCost: 260, totalRevenue: 780, totalProfit: 520, date: "2026-07-04" },
    ],
    total: 3,
  },

  "/api/v1/messaging/aggregates": {
    totalSmsSent: 1245800,
    totalEmailsSent: 89400,
    totalMessagingCost: 3114500,
    totalMessagingRevenue: 4983200,
    totalMessagingProfit: 1868700,
  },

  "/api/v1/funnel/stats": {
    id: "latest",
    qrScans: 15200,
    leadsCaptured: 8400,
    qrUsers: 6200,
    convertedToVemtap: 342,
    conversionRate: 4.1,
    date: "2026-07-18",
  },

  "/api/v1/notifications": [
    { id: "notif_001", type: "REVENUE", title: "New Subscription", message: "Lagos Pizza Co. upgraded to PRO plan — N45,000/mo", read: false, createdAt: "2026-07-18" },
    { id: "notif_002", type: "AGENT", title: "New Agent Registered", message: "Yemi Alade joined as an agent under Chidinma Eze", read: false, createdAt: "2026-07-18" },
    { id: "notif_003", type: "ALERT", title: "Payment Overdue", message: "Zenith Logistics invoice of N250,000 is 5 days overdue", read: false, createdAt: "2026-07-17" },
    { id: "notif_004", type: "SYSTEM", title: "SMS Gateway Alert", message: "Termii API response time increased to 2.3s — monitor closely", read: true, createdAt: "2026-07-17" },
    { id: "notif_005", type: "REVENUE", title: "Enterprise Deal", message: "Zenith Logistics renewed enterprise contract — N120,000/mo", read: true, createdAt: "2026-07-16" },
  ],

  "/api/v1/settings": {
    settings: {
      currency: "NGN",
      timezone: "Africa/Lagos",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
      paystackSecretKey: "sk_test_xxxxxxxx",
      termiiApiKey: "TL_xxxxxxxx",
    },
  },

  "/api/v1/settings/team": {
    members: [
      { id: "usr_001", name: "Admin User", email: "admin@vemtap.com", role: "SUPER_ADMIN", status: "ACTIVE", type: "INTERNAL" },
      { id: "usr_002", name: "Oluwaseun Akin", email: "seun@vemtap.com", role: "ADMIN", status: "ACTIVE", type: "INTERNAL" },
      { id: "usr_003", name: "Chioma Nwosu", email: "chioma@vemtap.com", role: "USER", status: "ACTIVE", type: "INTERNAL" },
    ],
  },

  "/api/v1/reports": {
    reportSections: [
      { label: "Total Revenue (YTD)", value: "N28,475,000", change: "+24.5%" },
      { label: "Net Profit", value: "N14,237,500", change: "+31.2%" },
      { label: "Active Businesses", value: "342", change: "+18.7%" },
      { label: "Commission Paid", value: "N4,256,000", change: "+15.3%" },
      { label: "SMS Sent", value: "1,245,800", change: "+42.1%" },
      { label: "Churn Rate", value: "2.3%", change: "-0.8%" },
    ],
    investorMetrics: [
      { label: "Monthly Recurring Revenue", value: "N14,250,000" },
      { label: "Annual Run Rate", value: "N171,000,000" },
      { label: "Customer LTV", value: "N312,000" },
      { label: "CAC", value: "N45,000" },
      { label: "LTV:CAC Ratio", value: "6.9x" },
      { label: "Gross Margin", value: "72.4%" },
    ],
  },

  "/api/v1/ai-assistant/insights": [
    { icon: "TrendingUp", text: "Revenue has grown 12.4% month-over-month — the strongest growth in Q2. SMS revenue is the primary driver at 33.6% of total.", type: "positive" },
    { icon: "AlertTriangle", text: "3 businesses (Zenith Logistics, HealthBridge Clinic, another) show churn risk based on declining usage patterns over the past 14 days.", type: "warning" },
    { icon: "TrendingUp", text: "Agent Chidinma Eze outperformed peers with 8 new signups this month. Consider a performance bonus or promotion.", type: "positive" },
    { icon: "AlertTriangle", text: "SMS gateway costs rose 8.2% this month while volume grew only 5.1%. This margin compression should be reviewed.", type: "warning" },
    { icon: "TrendingUp", text: "Break-even was achieved at 196 businesses. Current base is 342 (74.5% above break-even). The business is financially healthy.", type: "positive" },
  ],

  "/api/v1/ai-assistant/chat": {
    answer: "Based on your current metrics, revenue is trending up 12.4% month-over-month. You're on track to hit your Q3 targets. The main area of concern is SMS cost margins — consider renegotiating with your gateway provider if volume continues to grow at this pace.",
    data: [
      { label: "Revenue Growth", value: "12.4%" },
      { label: "Active Businesses", value: "342" },
      { label: "SMS Margin", value: "37.5%" },
      { label: "Churn Rate", value: "2.3%" },
    ],
  },

  "/api/v1/forecasting/project": {
    summary: {
      projectedMrr: 18500000,
      mrrGrowthPercent: 29.8,
      totalProjectedProfit: 52000000,
      isDeclining: false,
      healthAlert: "HEALTHY",
    },
    monthlyData: [
      { month: "2026-08", businesses: 350, mrr: 14585000, profit: 1508750, inflow: 2967500, outflow: 2345000, cashBalance: 1132300 },
      { month: "2026-09", businesses: 358, mrr: 14935000, profit: 1593750, inflow: 3087500, outflow: 2380000, cashBalance: 1372300 },
      { month: "2026-10", businesses: 366, mrr: 15285000, profit: 1678750, inflow: 3207500, outflow: 2415000, cashBalance: 1612300 },
      { month: "2026-11", businesses: 374, mrr: 15635000, profit: 1763750, inflow: 3327500, outflow: 2450000, cashBalance: 1852300 },
      { month: "2026-12", businesses: 382, mrr: 15985000, profit: 1848750, inflow: 3447500, outflow: 2485000, cashBalance: 2092300 },
      { month: "2027-01", businesses: 390, mrr: 16335000, profit: 1933750, inflow: 3567500, outflow: 2520000, cashBalance: 2332300 },
    ],
  },
};

function findMock(path: string): unknown {
  if (MOCK_DATA[path]) return MOCK_DATA[path];

  for (const [key, value] of Object.entries(MOCK_DATA)) {
    if (path.startsWith(key)) return value;
  }

  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const fullPath = `/api/v1/${path.join("/")}`;
  const mock = findMock(fullPath);
  if (mock) return NextResponse.json(mock);
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const fullPath = `/api/v1/${path.join("/")}`;
  const mock = findMock(fullPath);
  if (mock) return NextResponse.json(mock);
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const fullPath = `/api/v1/${path.join("/")}`;
  const mock = findMock(fullPath);
  if (mock) return NextResponse.json(mock);
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const fullPath = `/api/v1/${path.join("/")}`;
  const mock = findMock(fullPath);
  if (mock) return NextResponse.json(mock);
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const fullPath = `/api/v1/${path.join("/")}`;
  const mock = findMock(fullPath);
  if (mock) return NextResponse.json(mock);
  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}
