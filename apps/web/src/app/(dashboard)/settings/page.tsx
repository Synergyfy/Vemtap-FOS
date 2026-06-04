"use client";

import { useState, useEffect } from "react";
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

type Tab = "general" | "integrations" | "team" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const { data: teamData, isLoading: teamLoading } = useTeam();

  const updateSettings = useUpdateSettings();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const changePassword = useChangePassword();

  const settings = settingsData?.settings;

  // --- GENERAL / INTEGRATIONS FORM STATE ---
  const [form, setForm] = useState<SettingsData>({
    currency: "NGN",
    timezone: "WAT",
    dateFormat: "DD/MM/YYYY",
    theme: "dark",
    paystackSecretKey: "",
    termiiApiKey: "",
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleField = (field: keyof SettingsData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form);
  };

  // --- TEAM STATE ---
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

  // --- SECURITY STATE ---
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

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "team", label: "Team Management", icon: Users },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 pb-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings & Configuration
        </h1>
        <p className="text-zinc-500">
          Manage platform preferences, integrations, and user access.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* TABS SIDEBAR */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* TAB CONTENT */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
          {/* --- GENERAL SETTINGS --- */}
          {activeTab === "general" && (
            <form onSubmit={handleSaveSettings} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  General Preferences
                </h2>
                <p className="text-sm text-zinc-500">
                  Update your basic platform settings.
                </p>
              </div>

              {settingsLoading ? (
                <div className="text-sm text-zinc-500">Loading settings...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Base Currency
                      </label>
                      <select
                        value={form.currency}
                        onChange={(e) => handleField("currency", e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Timezone
                      </label>
                      <select
                        value={form.timezone}
                        onChange={(e) => handleField("timezone", e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WAT">West Africa Time (WAT)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Date Format
                    </label>
                    <select
                      value={form.dateFormat}
                      onChange={(e) => handleField("dateFormat", e.target.value)}
                      className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>

                  <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                      Theme Settings
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={form.theme === "light"}
                          onChange={(e) => handleField("theme", e.target.value)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Light Mode</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={form.theme === "dark"}
                          onChange={(e) => handleField("theme", e.target.value)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark Mode</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={form.theme === "system"}
                          onChange={(e) => handleField("theme", e.target.value)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">System Preference</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {updateSettings.isSuccess ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                  </span>
                ) : updateSettings.isError ? (
                  <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-500 font-medium">
                    <AlertCircle className="w-4 h-4" /> {updateSettings.error?.message || "Failed to save"}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* --- INTEGRATIONS --- */}
          {activeTab === "integrations" && (
            <form onSubmit={handleSaveSettings} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  API Integrations
                </h2>
                <p className="text-sm text-zinc-500">
                  Manage connections to payment gateways and communication providers.
                </p>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Connected
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Secret Key</label>
                        <input
                          type="password"
                          value={form.paystackSecretKey}
                          onChange={(e) => handleField("paystackSecretKey", e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Termii / SMS Gateway</h3>
                        <p className="text-xs text-zinc-500">Provider for outbound SMS messages.</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Connected
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500">API Key</label>
                        <input
                          type="password"
                          value={form.termiiApiKey}
                          onChange={(e) => handleField("termiiApiKey", e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {updateSettings.isSuccess ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                  </span>
                ) : updateSettings.isError ? (
                  <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-500 font-medium">
                    <AlertCircle className="w-4 h-4" /> {updateSettings.error?.message || "Failed to save"}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}

          {/* --- TEAM MANAGEMENT --- */}
          {activeTab === "team" && (
            <div className="flex flex-col h-full">
              <div className="p-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Team Management
                  </h2>
                  <p className="text-sm text-zinc-500">Manage who has access to the Financial OS.</p>
                </div>
                <button
                  onClick={() => setIsInviting(!isInviting)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm cursor-pointer"
                >
                  {isInviting ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isInviting ? "Cancel" : "Invite Member"}
                </button>
              </div>

              {inviteMember.isSuccess && (
                <div className="mx-8 mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Invitation sent successfully
                </div>
              )}

              {isInviting && (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@vemtap.com"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-48">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="USER">Viewer</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={inviteMember.isPending}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                    >
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
                            <span className={`font-medium ${member.role === "Super Admin" ? "text-purple-600 dark:text-purple-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            {member.type === "Owner" ? (
                              <span className="text-xs text-zinc-400">Owner</span>
                            ) : (
                              <button
                                onClick={() => removeMember.mutate(member.id)}
                                disabled={removeMember.isPending}
                                className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer disabled:opacity-50"
                              >
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

          {/* --- SECURITY --- */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Security Settings
                </h2>
                <p className="text-sm text-zinc-500">
                  Manage your account password.
                </p>
              </div>

              <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 max-w-sm">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-zinc-500" /> Change Password
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changePassword.isPending || !currentPassword || !newPassword}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {changePassword.isPending ? "Updating..." : "Update Password"}
                  </button>
                  {changePassword.isSuccess && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Password updated successfully.
                    </p>
                  )}
                  {changePassword.isError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {changePassword.error?.message || "Failed to update password"}
                    </p>
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
