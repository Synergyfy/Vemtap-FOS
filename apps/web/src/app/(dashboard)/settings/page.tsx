"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Globe,
  Link as LinkIcon,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Key,
  X,
  AlertCircle,
  Tags,
  BookOpen,
  Calendar,
  Coins,
  Shield,
  CheckSquare,
  BellRing,
  ScrollText,
  Pencil,
  ToggleLeft,
  Search,
  Loader2,
} from "lucide-react";
import {
  useSettings,
  useUpdateSettings,
  useTeam,
  useInviteMember,
  useRemoveMember,
  useChangePassword,
} from "@/lib/hooks/use-settings";
import type { SettingsData } from "@/lib/types";

type Tab =
  | "general"
  | "categories"
  | "chart-of-accounts"
  | "financial-periods"
  | "currencies"
  | "user-permissions"
  | "approval-rules"
  | "notification-rules"
  | "audit-logs"
  | "integrations"
  | "team"
  | "security";

interface Category {
  id: string;
  name: string;
  type: "Income" | "Expense";
  description: string;
}

interface AccountEntry {
  id: string;
  code: string;
  name: string;
  type: string;
  normalBalance: "Debit" | "Credit";
}

interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Open" | "Closed";
}

interface CurrencyEntry {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
}

interface PermissionEntry {
  role: string;
  permissions: Record<string, boolean>;
}

interface ApprovalRule {
  id: string;
  name: string;
  trigger: string;
  approver: string;
  threshold: string;
  status: "Active" | "Inactive";
}

interface NotificationRuleEntry {
  id: string;
  event: string;
  channel: string;
  enabled: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

const defaultCategories: Category[] = [
  { id: "1", name: "Software & Subscriptions", type: "Expense", description: "SaaS tools and recurring software" },
  { id: "2", name: "Hosting & Infrastructure", type: "Expense", description: "Cloud services and server costs" },
  { id: "3", name: "Salaries & Wages", type: "Expense", description: "Employee compensation" },
  { id: "4", name: "Marketing & Ads", type: "Expense", description: "Advertising and promotion" },
  { id: "5", name: "Product Sales", type: "Income", description: "Revenue from product sales" },
  { id: "6", name: "Service Revenue", type: "Income", description: "Revenue from services rendered" },
];

const defaultAccounts: AccountEntry[] = [
  { id: "1", code: "1000", name: "Cash & Bank", type: "Current Asset", normalBalance: "Debit" },
  { id: "2", code: "1100", name: "Accounts Receivable", type: "Current Asset", normalBalance: "Debit" },
  { id: "3", code: "2000", name: "Accounts Payable", type: "Current Liability", normalBalance: "Credit" },
  { id: "4", code: "3000", name: "Owner's Equity", type: "Equity", normalBalance: "Credit" },
  { id: "5", code: "4000", name: "Revenue", type: "Income", normalBalance: "Credit" },
  { id: "6", code: "5000", name: "Operating Expenses", type: "Expense", normalBalance: "Debit" },
];

const defaultPeriods: FinancialPeriod[] = [
  { id: "1", name: "FY 2025", startDate: "2025-01-01", endDate: "2025-12-31", status: "Closed" },
  { id: "2", name: "FY 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: "Open" },
  { id: "3", name: "Q1 2026", startDate: "2026-01-01", endDate: "2026-03-31", status: "Open" },
  { id: "4", name: "Q2 2026", startDate: "2026-04-01", endDate: "2026-06-30", status: "Open" },
];

const defaultCurrencies: CurrencyEntry[] = [
  { id: "1", code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1, isDefault: true },
  { id: "2", code: "USD", name: "US Dollar", symbol: "$", rate: 0.00065, isDefault: false },
  { id: "3", code: "GBP", name: "British Pound", symbol: "£", rate: 0.00051, isDefault: false },
  { id: "4", code: "EUR", name: "Euro", symbol: "€", rate: 0.00059, isDefault: false },
];

const defaultPermissions: PermissionEntry[] = [
  {
    role: "Super Admin",
    permissions: { view: true, create: true, edit: true, delete: true, approve: true, manageTeam: true, manageSettings: true },
  },
  {
    role: "Administrator",
    permissions: { view: true, create: true, edit: true, delete: true, approve: true, manageTeam: false, manageSettings: false },
  },
  {
    role: "Viewer",
    permissions: { view: true, create: false, edit: false, delete: false, approve: false, manageTeam: false, manageSettings: false },
  },
];

const defaultApprovalRules: ApprovalRule[] = [
  { id: "1", name: "Large Expense Approval", trigger: "Expense > ₦500,000", approver: "Super Admin", threshold: "₦500,000", status: "Active" },
  { id: "2", name: "Budget Overrun", trigger: "Budget Exceeded > 10%", approver: "Administrator", threshold: "10% over", status: "Active" },
  { id: "3", name: "New Vendor Payment", trigger: "First payment to vendor", approver: "Administrator", threshold: "Any amount", status: "Inactive" },
];

const defaultNotificationRules: NotificationRuleEntry[] = [
  { id: "1", event: "Large Transaction", channel: "Email", enabled: true },
  { id: "2", event: "Budget Threshold Reached", channel: "Email", enabled: true },
  { id: "3", event: "Overdue Invoice", channel: "Email", enabled: true },
  { id: "4", event: "New Member Joined", channel: "In-App", enabled: true },
  { id: "5", event: "Payment Received", channel: "In-App", enabled: false },
  { id: "6", event: "Weekly Summary", channel: "Email", enabled: false },
];

const defaultAuditLogs: AuditEntry[] = [
  { id: "1", timestamp: "2026-07-17 09:23:12", user: "Admin User", action: "Settings Updated", details: "Changed base currency to NGN" },
  { id: "2", timestamp: "2026-07-16 14:05:33", user: "Admin User", action: "Team Member Invited", details: "Invited jane@vemtap.com as Admin" },
  { id: "3", timestamp: "2026-07-15 11:44:01", user: "System", action: "Budget Alert Triggered", details: "Marketing budget at 85%" },
  { id: "4", timestamp: "2026-07-14 16:20:45", user: "Super Admin", action: "Category Created", details: "Added 'Consulting' income category" },
  { id: "5", timestamp: "2026-07-13 10:12:18", user: "Admin User", action: "Password Changed", details: "Password updated successfully" },
  { id: "6", timestamp: "2026-07-12 08:30:00", user: "System", action: "Period Closed", details: "FY 2025 financial period closed" },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl || "general");

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      queueMicrotask(() => setActiveTab(tabFromUrl));
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "general") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/settings${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const { data: teamData, isLoading: teamLoading } = useTeam();

  const updateSettings = useUpdateSettings();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const changePassword = useChangePassword();

  const settings = settingsData?.settings;

  const [form, setForm] = useState<SettingsData>({
    currency: "NGN",
    timezone: "WAT",
    dateFormat: "DD/MM/YYYY",
    theme: "dark",
    paystackSecretKey: "",
    termiiApiKey: "",
  });

  useEffect(() => {
    if (settings) queueMicrotask(() => setForm(settings));
  }, [settings]);

  const handleField = (field: keyof SettingsData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form);
    try {
      const raw = localStorage.getItem("fos_user");
      if (raw) {
        const user = JSON.parse(raw);
        user.theme = form.theme;
        localStorage.setItem("fos_user", JSON.stringify(user));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
  };

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("ADMIN");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    inviteMember.mutate(
      { email: inviteEmail, name: inviteName, role: inviteRole },
      { onSuccess: () => { setInviteEmail(""); setInviteName(""); setIsInviting(false); } },
    );
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      { onSuccess: () => { setCurrentPassword(""); setNewPassword(""); } },
    );
  };

  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage("fos_categories", defaultCategories));
  const [accounts, setAccounts] = useState<AccountEntry[]>(() => loadFromStorage("fos_accounts", defaultAccounts));
  const [periods] = useState<FinancialPeriod[]>(defaultPeriods);
  const [currencies, setCurrencies] = useState<CurrencyEntry[]>(() => loadFromStorage("fos_currencies", defaultCurrencies));
  const [permissions, setPermissions] = useState<PermissionEntry[]>(defaultPermissions);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(() => loadFromStorage("fos_approvalRules", defaultApprovalRules));
  const [notificationRules, setNotificationRules] = useState<NotificationRuleEntry[]>(defaultNotificationRules);
  const [auditLogs] = useState<AuditEntry[]>(defaultAuditLogs);

  useEffect(() => { localStorage.setItem("fos_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("fos_accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("fos_currencies", JSON.stringify(currencies)); }, [currencies]);
  useEffect(() => { localStorage.setItem("fos_approvalRules", JSON.stringify(approvalRules)); }, [approvalRules]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "Expense" as "Income" | "Expense", description: "" });

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ code: "", name: "", type: "", normalBalance: "Debit" as "Debit" | "Credit" });

  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [currencyForm, setCurrencyForm] = useState({ code: "", name: "", symbol: "", rate: 1 });

  const [showAddRule, setShowAddRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: "", trigger: "", approver: "", threshold: "", status: "Active" as "Active" | "Inactive" });

  const [auditSearch, setAuditSearch] = useState("");

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "chart-of-accounts", label: "Chart of Accounts", icon: BookOpen },
    { id: "financial-periods", label: "Financial Periods", icon: Calendar },
    { id: "currencies", label: "Currencies", icon: Coins },
    { id: "user-permissions", label: "User Permissions", icon: Shield },
    { id: "approval-rules", label: "Approval Rules", icon: CheckSquare },
    { id: "notification-rules", label: "Notification Rules", icon: BellRing },
    { id: "audit-logs", label: "Audit Logs", icon: ScrollText },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "team", label: "Team", icon: Users },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 pb-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings & Configuration
        </h1>
        <p className="text-zinc-500">
          Manage platform preferences, categories, permissions, and more.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-56 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
              />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
          {/* GENERAL */}
          {activeTab === "general" && (
            <form onSubmit={handleSaveSettings} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">General Preferences</h2>
                <p className="text-sm text-zinc-500">Update your basic platform settings.</p>
              </div>
              {settingsLoading ? (
                <div className="text-sm text-zinc-500">Loading settings...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Base Currency</label>
                      <select value={form.currency} onChange={(e) => handleField("currency", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Timezone</label>
                      <select value={form.timezone} onChange={(e) => handleField("timezone", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="WAT">West Africa Time (WAT)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date Format</label>
                    <select value={form.dateFormat} onChange={(e) => handleField("dateFormat", e.target.value)} className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">Theme Settings</h3>
                    <div className="flex items-center gap-4">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="theme" value={t} checked={form.theme === t} onChange={(e) => handleField("theme", e.target.value)} className="w-4 h-4 text-blue-600 cursor-pointer" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{t} Mode</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {updateSettings.isSuccess ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium"><CheckCircle2 className="w-4 h-4" /> Settings saved successfully</span>
                ) : updateSettings.isError ? (
                  <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-500 font-medium"><AlertCircle className="w-4 h-4" /> {updateSettings.error?.message || "Failed to save"}</span>
                ) : <span />}
                <button type="submit" disabled={updateSettings.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* CATEGORIES */}
          {activeTab === "categories" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Categories</h2>
                  <p className="text-sm text-zinc-500">Manage income and expense categories.</p>
                </div>
                <button onClick={() => { setShowAddCategory(true); setEditCategory(null); setCategoryForm({ name: "", type: "Expense", description: "" }); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              {(showAddCategory || editCategory) && (
                <div className="mb-6 p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">{editCategory ? "Edit Category" : "New Category"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Name</label>
                      <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Consulting" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Type</label>
                      <select value={categoryForm.type} onChange={(e) => setCategoryForm((p) => ({ ...p, type: e.target.value as "Income" | "Expense" }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Description</label>
                      <input type="text" value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!categoryForm.name) return;
                      if (editCategory) {
                        setCategories((prev) => prev.map((c) => c.id === editCategory.id ? { ...c, ...categoryForm } : c));
                      } else {
                        setCategories((prev) => [...prev, { id: String(Date.now()), ...categoryForm }]);
                      }
                      setShowAddCategory(false); setEditCategory(null); setCategoryForm({ name: "", type: "Expense", description: "" });
                    }} disabled={!categoryForm.name} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      {editCategory ? "Update" : "Create"}
                    </button>
                    <button onClick={() => { setShowAddCategory(false); setEditCategory(null); }} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{cat.name}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.type === "Income" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                            {cat.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-500">{cat.description}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditCategory(cat); setCategoryForm({ name: cat.name, type: cat.type, description: cat.description }); setShowAddCategory(false); }} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCategories((prev) => prev.filter((c) => c.id !== cat.id))} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CHART OF ACCOUNTS */}
          {activeTab === "chart-of-accounts" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Chart of Accounts</h2>
                  <p className="text-sm text-zinc-500">Define your financial account structure.</p>
                </div>
                <button onClick={() => { setShowAddAccount(true); setAccountForm({ code: "", name: "", type: "", normalBalance: "Debit" }); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Account
                </button>
              </div>

              {showAddAccount && (
                <div className="mb-6 p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">New Account</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Account Code</label>
                      <input type="text" value={accountForm.code} onChange={(e) => setAccountForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. 1100" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Account Name</label>
                      <input type="text" value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Accounts Receivable" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Type</label>
                      <select value={accountForm.type} onChange={(e) => setAccountForm((p) => ({ ...p, type: e.target.value }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select type</option>
                        <option value="Current Asset">Current Asset</option>
                        <option value="Fixed Asset">Fixed Asset</option>
                        <option value="Current Liability">Current Liability</option>
                        <option value="Long-term Liability">Long-term Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Normal Balance</label>
                      <select value={accountForm.normalBalance} onChange={(e) => setAccountForm((p) => ({ ...p, normalBalance: e.target.value as "Debit" | "Credit" }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Debit">Debit</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!accountForm.code || !accountForm.name || !accountForm.type) return;
                      setAccounts((prev) => [...prev, { id: String(Date.now()), ...accountForm }]);
                      setShowAddAccount(false); setAccountForm({ code: "", name: "", type: "", normalBalance: "Debit" });
                    }} disabled={!accountForm.code || !accountForm.name || !accountForm.type} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Create
                    </button>
                    <button onClick={() => setShowAddAccount(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Code</th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Normal Balance</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {accounts.map((acct) => (
                      <tr key={acct.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-mono text-sm text-zinc-700 dark:text-zinc-300">{acct.code}</td>
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{acct.name}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{acct.type}</td>
                        <td className="px-6 py-3.5">
                          <span className={`text-xs font-medium ${acct.normalBalance === "Debit" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {acct.normalBalance}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button onClick={() => setAccounts((prev) => prev.filter((a) => a.id !== acct.id))} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FINANCIAL PERIODS */}
          {activeTab === "financial-periods" && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Financial Periods</h2>
                <p className="text-sm text-zinc-500">Manage fiscal years and reporting periods.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Period Name</th>
                      <th className="px-6 py-3 font-medium">Start Date</th>
                      <th className="px-6 py-3 font-medium">End Date</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {periods.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{p.name}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{p.startDate}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{p.endDate}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === "Open" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CURRENCIES */}
          {activeTab === "currencies" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Currencies</h2>
                  <p className="text-sm text-zinc-500">Manage supported currencies and exchange rates.</p>
                </div>
                <button onClick={() => { setShowAddCurrency(true); setCurrencyForm({ code: "", name: "", symbol: "", rate: 1 }); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Currency
                </button>
              </div>

              {showAddCurrency && (
                <div className="mb-6 p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">New Currency</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Code</label>
                      <input type="text" value={currencyForm.code} onChange={(e) => setCurrencyForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. EUR" maxLength={3} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Name</label>
                      <input type="text" value={currencyForm.name} onChange={(e) => setCurrencyForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Euro" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Symbol</label>
                      <input type="text" value={currencyForm.symbol} onChange={(e) => setCurrencyForm((p) => ({ ...p, symbol: e.target.value }))} placeholder="e.g. €" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Rate (vs default)</label>
                      <input type="number" step="0.00001" value={currencyForm.rate} onChange={(e) => setCurrencyForm((p) => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!currencyForm.code || !currencyForm.name || !currencyForm.symbol || currencyForm.rate <= 0) return;
                      setCurrencies((prev) => [...prev, { id: String(Date.now()), ...currencyForm, isDefault: false }]);
                      setShowAddCurrency(false); setCurrencyForm({ code: "", name: "", symbol: "", rate: 1 });
                    }} disabled={!currencyForm.code || !currencyForm.name || !currencyForm.symbol || currencyForm.rate <= 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Create
                    </button>
                    <button onClick={() => setShowAddCurrency(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Currency</th>
                      <th className="px-6 py-3 font-medium">Code</th>
                      <th className="px-6 py-3 font-medium">Symbol</th>
                      <th className="px-6 py-3 font-medium">Exchange Rate</th>
                      <th className="px-6 py-3 font-medium">Default</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {currencies.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{c.name}</td>
                        <td className="px-6 py-3.5 font-mono text-sm text-zinc-700 dark:text-zinc-300">{c.code}</td>
                        <td className="px-6 py-3.5 text-lg text-zinc-500">{c.symbol}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{c.rate.toFixed(5)}</td>
                        <td className="px-6 py-3.5">
                          {c.isDefault ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Default</span>
                          ) : (
                            <button onClick={() => setCurrencies((prev) => prev.map((x) => ({ ...x, isDefault: x.id === c.id })))} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer">Set as default</button>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {!c.isDefault && (
                            <button onClick={() => setCurrencies((prev) => prev.filter((x) => x.id !== c.id))} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER PERMISSIONS */}
          {activeTab === "user-permissions" && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">User Permissions</h2>
                <p className="text-sm text-zinc-500">Configure role-based access permissions.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Role</th>
                      {Object.keys(defaultPermissions[0].permissions).map((perm) => (
                        <th key={perm} className="px-4 py-3 font-medium text-center capitalize">{perm.replace(/([A-Z])/g, " $1")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {permissions.map((row) => (
                      <tr key={row.role} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{row.role}</td>
                        {Object.entries(row.permissions).map(([key, val]) => (
                          <td key={key} className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => {
                                setPermissions((prev) => prev.map((r) =>
                                  r.role === row.role ? { ...r, permissions: { ...r.permissions, [key]: !val } } : r
                                ));
                              }}
                              disabled={row.role === "Super Admin"}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-zinc-400">Super Admin permissions are fixed and cannot be changed.</p>
            </div>
          )}

          {/* APPROVAL RULES */}
          {activeTab === "approval-rules" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Approval Rules</h2>
                  <p className="text-sm text-zinc-500">Define approval workflows for transactions and changes.</p>
                </div>
                <button onClick={() => { setShowAddRule(true); setRuleForm({ name: "", trigger: "", approver: "", threshold: "", status: "Active" }); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Rule
                </button>
              </div>

              {showAddRule && (
                <div className="mb-6 p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">New Approval Rule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Rule Name</label>
                      <input type="text" value={ruleForm.name} onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Large Expense" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Trigger</label>
                      <input type="text" value={ruleForm.trigger} onChange={(e) => setRuleForm((p) => ({ ...p, trigger: e.target.value }))} placeholder="e.g. Expense > ₦500k" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Approver Role</label>
                      <select value={ruleForm.approver} onChange={(e) => setRuleForm((p) => ({ ...p, approver: e.target.value }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select role</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Threshold</label>
                      <input type="text" value={ruleForm.threshold} onChange={(e) => setRuleForm((p) => ({ ...p, threshold: e.target.value }))} placeholder="e.g. ₦500,000" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Status</label>
                      <select value={ruleForm.status} onChange={(e) => setRuleForm((p) => ({ ...p, status: e.target.value as "Active" | "Inactive" }))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!ruleForm.name || !ruleForm.trigger || !ruleForm.approver) return;
                      setApprovalRules((prev) => [...prev, { id: String(Date.now()), ...ruleForm }]);
                      setShowAddRule(false); setRuleForm({ name: "", trigger: "", approver: "", threshold: "", status: "Active" });
                    }} disabled={!ruleForm.name || !ruleForm.trigger || !ruleForm.approver} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Create
                    </button>
                    <button onClick={() => setShowAddRule(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Rule</th>
                      <th className="px-6 py-3 font-medium">Trigger</th>
                      <th className="px-6 py-3 font-medium">Approver</th>
                      <th className="px-6 py-3 font-medium">Threshold</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {approvalRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{rule.name}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{rule.trigger}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{rule.approver}</td>
                        <td className="px-6 py-3.5 text-zinc-500">{rule.threshold}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${rule.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                            {rule.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button onClick={() => {
                            setApprovalRules((prev) => prev.map((r) =>
                              r.id === rule.id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r
                            ));
                          }} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer">
                            <ToggleLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => setApprovalRules((prev) => prev.filter((r) => r.id !== rule.id))} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATION RULES */}
          {activeTab === "notification-rules" && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Notification Rules</h2>
                <p className="text-sm text-zinc-500">Configure which events trigger notifications.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Event</th>
                      <th className="px-6 py-3 font-medium">Channel</th>
                      <th className="px-6 py-3 font-medium text-center">Enabled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {notificationRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{rule.event}</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {rule.channel === "Email" ? <LinkIcon className="w-3 h-3" /> : <BellRing className="w-3 h-3" />}
                            {rule.channel}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => setNotificationRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${rule.enabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === "audit-logs" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Audit Logs</h2>
                  <p className="text-sm text-zinc-500">Track changes and activities across the platform.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Timestamp</th>
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                      <th className="px-6 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {auditLogs
                      .filter((log) =>
                        !auditSearch || log.action.toLowerCase().includes(auditSearch.toLowerCase()) || log.details.toLowerCase().includes(auditSearch.toLowerCase()) || log.user.toLowerCase().includes(auditSearch.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-6 py-3.5 font-mono text-xs text-zinc-500">{log.timestamp}</td>
                          <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{log.user}</td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-zinc-500">{log.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === "integrations" && (
            <form onSubmit={handleSaveSettings} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Integrations</h2>
                <p className="text-sm text-zinc-500">Manage connections to payment gateways and communication providers.</p>
              </div>
              {settingsLoading ? (
                <div className="text-sm text-zinc-500">Loading settings...</div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Paystack Gateway</h3>
                        <p className="text-xs text-zinc-500">Primary payment processor for Subscriptions.</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Connected</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Secret Key</label>
                      <input type="password" value={form.paystackSecretKey} onChange={(e) => handleField("paystackSecretKey", e.target.value)} className="w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Termii / SMS Gateway</h3>
                        <p className="text-xs text-zinc-500">Provider for outbound SMS messages.</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Connected</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">API Key</label>
                      <input type="password" value={form.termiiApiKey} onChange={(e) => handleField("termiiApiKey", e.target.value)} className="w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {updateSettings.isSuccess ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium"><CheckCircle2 className="w-4 h-4" /> Settings saved successfully</span>
                ) : updateSettings.isError ? (
                  <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-500 font-medium"><AlertCircle className="w-4 h-4" /> {updateSettings.error?.message || "Failed to save"}</span>
                ) : <span />}
                <button type="submit" disabled={updateSettings.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}

          {/* TEAM */}
          {activeTab === "team" && (
            <div className="flex flex-col h-full">
              <div className="p-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team Management</h2>
                  <p className="text-sm text-zinc-500">Manage who has access to the Financial OS.</p>
                </div>
                <button onClick={() => setIsInviting(!isInviting)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm cursor-pointer">
                  {isInviting ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isInviting ? "Cancel" : "Invite Member"}
                </button>
              </div>
              {inviteMember.isSuccess && (
                <div className="mx-8 mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium"><CheckCircle2 className="w-4 h-4" /> Invitation sent successfully</div>
              )}
              {isInviting && (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                      <input type="text" required value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Doe" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                      <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@vemtap.com" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1 w-full sm:w-48">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                      <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="USER">Viewer</option>
                      </select>
                    </div>
                    <button type="submit" disabled={inviteMember.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto">
                      {inviteMember.isPending ? "Sending..." : "Send Invite"}
                    </button>
                  </form>
                </div>
              )}
              {teamLoading ? (
                <div className="p-8 text-sm text-zinc-500">Loading team...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-8 py-3 font-medium">User</th>
                        <th className="px-8 py-3 font-medium">Role</th>
                        <th className="px-8 py-3 font-medium">Status</th>
                        <th className="px-8 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {teamData?.members.map((member) => (
                        <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-8 py-4">
                            <div className="font-medium text-zinc-900 dark:text-zinc-50">{member.name}</div>
                            <div className="text-xs text-zinc-500">{member.email}</div>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`font-medium ${member.role === "Super Admin" ? "text-purple-600 dark:text-purple-400" : "text-zinc-700 dark:text-zinc-300"}`}>{member.role}</span>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${member.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            {member.type === "Owner" ? (
                              <span className="text-xs text-zinc-400">Owner</span>
                            ) : (
                              <button onClick={() => removeMember.mutate(member.id)} disabled={removeMember.isPending} className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer disabled:opacity-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Security Settings</h2>
                <p className="text-sm text-zinc-500">Manage your account password.</p>
              </div>
              <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 max-w-sm">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-zinc-500" /> Change Password
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" disabled={changePassword.isPending || !currentPassword || !newPassword} className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors mt-2 cursor-pointer disabled:opacity-50">
                    {changePassword.isPending ? "Updating..." : "Update Password"}
                  </button>
                  {changePassword.isSuccess && (
                    <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Password updated successfully.</p>
                  )}
                  {changePassword.isError && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {changePassword.error?.message || "Failed to update password"}</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
