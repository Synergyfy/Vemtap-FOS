"use client";

import { useSyncExternalStore } from "react";
import { User, Mail, Clock, Activity, Building2 } from "lucide-react";

let _cachedRaw: string | null = null;
let _cachedUser: Record<string, unknown> | null = null;

function getProfileSnapshot(): Record<string, unknown> | null {
  const raw = localStorage.getItem("fos_user");
  if (raw === _cachedRaw) return _cachedUser;
  _cachedRaw = raw;
  _cachedUser = raw ? JSON.parse(raw) : null;
  return _cachedUser;
}

export default function ProfilePage() {
  const profile = useSyncExternalStore(
    () => () => {},
    getProfileSnapshot,
    () => null,
  );

  const displayName = String(
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName ?? "—"
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Profile
        </h1>
        <p className="text-zinc-500">
          View your personal account details and activity log.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PROFILE CARD */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-zinc-950 flex items-center justify-center mb-4 shadow-sm">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {displayName}
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              {String(profile?.email ?? "—")}
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              {String(profile?.role ?? "—")}
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wider">
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    Email Address
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50">
              {String(profile?.email ?? "—")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    Role
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50">
              {String(profile?.role ?? "—")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVITY LOG */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
              </h3>
            </div>

            <div className="p-6">
              <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8">
                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-zinc-900"></span>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Profile Synced
                    </h4>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Active session
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Authenticated as {String(profile?.email ?? "—")}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
