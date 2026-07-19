"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  Bell,
  User,
  Target,
  BarChart3,
  Building2,
  Calendar,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Users,
  GitBranch,
  MessageSquare,
  Mail,
  Percent,
  FileText,
  Flag,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: { label: string; href: string }[];
}

const sidebarSections: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Revenue", icon: TrendingUp, href: "/revenue" },
  { label: "Expenses", icon: DollarSign, href: "/expenses" },
  { label: "Financials", icon: BarChart3, href: "/financials" },
  {
    label: "Planning",
    icon: Target,
    items: [
      { label: "Overview", href: "/planning" },
      { label: "Scenarios", href: "/planning/scenarios" },
    ],
  },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const set = new Set<string>();
    sidebarSections.forEach((s) => {
      if (s.items?.some((i) => pathname === i.href)) set.add(s.label);
    });
    return set;
  });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const { user: userProfile, logout: authLogout } = useAuth();

  const displayName = String(userProfile?.name ?? (userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.firstName) ?? "—");
  const displayEmail = String(userProfile?.email ?? "—");

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authLogout();
    router.push("/login");
    router.refresh();
  };

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center">
              <span className="text-zinc-50 dark:text-zinc-900 text-sm">V</span>
            </div>
            Vemtap FOS
          </Link>
          <button
            className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto hide-scrollbar">
          {sidebarSections.map((section) => {
            const SectionIcon = section.icon;

            if (section.items) {
              const isExpanded = expandedSections.has(section.label);
              const isActive = section.items.some((i) => pathname === i.href);
              return (
                <div key={section.label}>
                  <button
                    onClick={() => toggleSection(section.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                      ${isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      }`}
                  >
                    {SectionIcon && <SectionIcon className="w-4 h-4 shrink-0" />}
                    <span className="flex-1">{section.label}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {section.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${pathname === sub.href
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                            }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={section.label}
                href={section.href!}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === section.href || (section.href !== "/" && pathname.startsWith(section.href!))
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                  }`}
              >
                {SectionIcon && <SectionIcon className="w-4 h-4 shrink-0" />}
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors shrink-0">
              <User className="w-4 h-4 text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sm:px-8 relative shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 capitalize truncate hidden sm:block">
              {pathname.split("/")[1]?.replace("-", " ") || "Overview"}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="relative p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </Link>

            <div className="h-8 w-[1px] bg-zinc-200 dark:border-zinc-800 mx-1 sm:mx-2 hidden sm:block" />

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 pr-1 sm:pr-2 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                  <User className="w-5 h-5 text-zinc-100 dark:text-zinc-800 mt-1" />
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 py-1 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2"></div>
                    <button
                      onClick={(e) => {
                        setIsProfileDropdownOpen(false);
                        handleLogout(e);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
