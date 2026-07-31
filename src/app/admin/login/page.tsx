"use client";

import { LayoutDashboard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/admin/kit";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/admin/login", "POST", { password });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Incorrect password. The default is admin123.");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 text-brand-950">
            <LayoutDashboard size={24} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Oraimo Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your store</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-6">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 outline-none focus:border-brand-500"
              />
            </div>
          </label>
          {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-11 w-full rounded-full bg-brand-500 font-semibold text-brand-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Demo password: <b className="text-foreground">admin123</b>
          </p>
        </form>
      </div>
    </div>
  );
}
