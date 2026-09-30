"use client";

import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/layout/logo";

const reasons: Record<string, string> = {
  idle: "You were signed out after 15 minutes of inactivity.",
  expired: "Your session ended. Please sign in again.",
  "signed-out": "You've been signed out.",
};

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("reason");
    if (r && reasons[r]) setInfo(reasons[r]);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        // Friendly, generic messages only — nothing about the server's setup.
        throw new Error(res.status === 429 && d.error ? d.error : "Incorrect password. Please try again.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password. Please try again.");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="size-10 text-emerald-400" />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold">SIR VERT</p>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-emerald-300">Enterprise</p>
          </div>
        </div>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight">Run your store from one place.</h2>
          <p className="mt-3 max-w-sm text-white/70">Orders, products, banners, customers and payments — updated live on your storefront.</p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/60"><ShieldCheck size={16} /> Protected area · sessions are signed and time-limited</p>
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/30 blur-3xl" />
      </div>

      {/* form */}
      <div className="flex flex-col items-center justify-center bg-background p-5">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <LogoMark className="size-11 text-emerald-600 lg:hidden" />
            <h1 className="mt-3 font-display text-2xl font-bold lg:mt-0">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to the SIR VERT admin</p>
          </div>

          {info && <p role="status" className="mb-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">{info}</p>}

          <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <label htmlFor="admin-password" className="text-sm font-medium">Password</label>
            <div className={`mt-1.5 flex h-12 items-center rounded-xl border bg-background pr-1 transition-colors focus-within:border-brand-500 ${error ? "border-rose-400" : "border-border"}`}>
              <Lock size={16} className="ml-3.5 shrink-0 text-muted" />
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                aria-invalid={!!error}
                aria-describedby={error ? "admin-login-error" : undefined}
                className="h-full min-w-0 flex-1 bg-transparent px-3 outline-none"
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-2">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <p id="admin-login-error" role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cta font-bold text-white transition-colors hover:bg-cta-600 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <p className="mt-4 text-center text-xs text-muted">For your security you&apos;ll be signed out after 15 minutes of inactivity.</p>
          </form>

          <a href="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
            <ArrowLeft size={15} /> Back to the store
          </a>
        </div>
      </div>
    </div>
  );
}
