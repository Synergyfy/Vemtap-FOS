"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsPending(true);

    try {
      const body = await apiClient.post<{ access_token: string; user: Record<string, unknown> }>("/auth/register", {
        name: fullName,
        email,
        password,
      });
      localStorage.setItem("fos_access_token", body.access_token);
      localStorage.setItem("fos_user", JSON.stringify(body.user));
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : "Unable to connect to the registration service.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-zinc-50 dark:text-zinc-900 text-xl font-bold">V</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Get started with Vemtap Financial Command Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <div className="mt-1">
                <input id="fullName" name="fullName" type="text" autoComplete="name" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)} disabled={isPending}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input id="email" name="email" type="email" autoComplete="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={isPending}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={isPending}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={isPending}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 disabled:opacity-50" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={isPending}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-50">
                {isPending ? (
                  <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Creating account...</>
                ) : (
                  <><ArrowRight className="mr-2 w-4 h-4" /> Create Account</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
