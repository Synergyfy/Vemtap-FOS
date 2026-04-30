import Link from "next/link";
import { ArrowRight, LayoutDashboard, Settings, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              Vemtap FOS
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Welcome to your new Front Office System. The project is fully configured with Next.js 16, Tailwind CSS 4, and AI Agent support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-500" />
              <h3 className="font-semibold">Dashboard</h3>
              <p className="text-sm text-zinc-500">Overview of operations</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <h3 className="font-semibold">Users</h3>
              <p className="text-sm text-zinc-500">Manage access and roles</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-3">
              <Settings className="w-8 h-8 text-orange-500" />
              <h3 className="font-semibold">Settings</h3>
              <p className="text-sm text-zinc-500">System configuration</p>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
        Built with Next.js 16 & Tailwind CSS 4
      </footer>
    </div>
  );
}
