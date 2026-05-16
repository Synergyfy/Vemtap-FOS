"use client";

import { useState } from "react";
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
  X
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaved, setIsSaved] = useState(false);

  // --- GENERAL STATE ---
  const [currency, setCurrency] = useState("NGN");
  const [timezone, setTimezone] = useState("WAT");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("dark");

  // --- INTEGRATIONS STATE ---
  const [paystackKey, setPaystackKey] = useState("sk_test_1234567890abcdef");
  const [termiiKey, setTermiiKey] = useState("termii_key_987654321");

  // --- TEAM STATE ---
  const [team, setTeam] = useState([
    { id: 1, name: "Admin User", email: "admin@vemtap.com", role: "Super Admin", status: "Active", type: "Owner" },
    { id: 2, name: "Sarah Finance", email: "sarah@vemtap.com", role: "Financial Analyst", status: "Active", type: "Member" }
  ]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Financial Analyst");

  // --- SECURITY STATE ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // --- HANDLERS ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setTeam([...team, {
      id: Math.random(),
      name: "Pending Invite",
      email: inviteEmail,
      role: inviteRole,
      status: "Pending",
      type: "Member"
    }]);
    setInviteEmail("");
    setIsInviting(false);
  };

  const handleDeleteMember = (id: number) => {
    setTeam(team.filter(member => member.id !== id));
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "team", label: "Team Management", icon: Users },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 pb-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings & Configuration</h1>
        <p className="text-zinc-500">Manage platform preferences, integrations, and user access.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* TABS SIDEBAR */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* --- GENERAL SETTINGS --- */}
          {activeTab === "general" && (
            <form onSubmit={handleSave} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">General Preferences</h2>
                <p className="text-sm text-zinc-500">Update your basic platform settings.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Base Currency</label>
                    <select 
                      value={currency} onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Timezone</label>
                    <select 
                      value={timezone} onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="WAT">West Africa Time (WAT)</option>
                      <option value="GMT">Greenwich Mean Time (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date Format</label>
                  <select 
                    value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">Theme Settings</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="theme" value="light" 
                        checked={theme === "light"} onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">Light Mode</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="theme" value="dark" 
                        checked={theme === "dark"} onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark Mode</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="theme" value="system" 
                        checked={theme === "system"} onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">System Preference</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {isSaved ? (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                  </span>
                ) : <span/>}
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* --- INTEGRATIONS --- */}
          {activeTab === "integrations" && (
            <form onSubmit={handleSave} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Integrations</h2>
                <p className="text-sm text-zinc-500">Manage connections to payment gateways and communication providers.</p>
              </div>

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
                        type="password" value={paystackKey} onChange={(e) => setPaystackKey(e.target.value)}
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
                        type="password" value={termiiKey} onChange={(e) => setTermiiKey(e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {isSaved ? <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium"><CheckCircle2 className="w-4 h-4" /> Keys updated</span> : <span/>}
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Save className="w-4 h-4" /> Save API Keys
                </button>
              </div>
            </form>
          )}

          {/* --- TEAM MANAGEMENT --- */}
          {activeTab === "team" && (
            <div className="flex flex-col h-full">
              <div className="p-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team Management</h2>
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

              {isInviting && (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                      <input 
                        type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@vemtap.com" 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-48">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                      <select 
                        value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Financial Analyst">Financial Analyst</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto">
                      Send Invite
                    </button>
                  </form>
                </div>
              )}
              
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
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-8 py-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">{member.name}</div>
                          <div className="text-xs text-zinc-500">{member.email}</div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`font-medium ${member.role === 'Super Admin' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium 
                            ${member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          {member.type === "Owner" ? (
                            <span className="text-xs text-zinc-400">Owner</span>
                          ) : (
                            <button 
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer"
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
            </div>
          )}

          {/* --- SECURITY --- */}
          {activeTab === "security" && (
            <form onSubmit={handleSave} className="p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Security Settings</h2>
                <p className="text-sm text-zinc-500">Manage passwords and two-factor authentication.</p>
              </div>

              <div className="space-y-8">
                
                <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-500" /> Change Password
                  </h3>
                  <div className="grid grid-cols-1 max-w-sm gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">Current Password</label>
                      <input 
                        type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-500">New Password</label>
                      <input 
                        type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors mt-2 cursor-pointer">
                      Update Password
                    </button>
                    {isSaved && newPassword && <p className="text-xs text-green-500 mt-1">Password updated successfully.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Two-Factor Authentication (2FA)
                  </h3>
                  <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                    <div>
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">Authenticator App</p>
                      <p className="text-xs text-zinc-500 mt-1">Use an app like Google Authenticator to generate verification codes.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${is2FAEnabled ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                  </div>
                </div>

              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
