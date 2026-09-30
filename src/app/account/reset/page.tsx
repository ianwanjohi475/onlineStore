"use client";

import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Set a new password from a one-time reset link (/account/reset?token=…). */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
    // keep the token out of browser history / referrers
    window.history.replaceState(null, "", "/account/reset");
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not reset your password.");
      setDone(true);
      setTimeout(() => { window.location.href = "/account"; }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-2xl font-bold sm:text-3xl">Set a new password</h1>
        {done ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p className="font-semibold">Password updated — you&apos;re signed in.</p>
            <button onClick={() => router.push("/account")} className="text-sm font-semibold text-brand-600 hover:underline">Go to my account</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            {!token && <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">This page needs the link from your reset message. <Link href="/account?mode=forgot" className="font-semibold underline">Request a new link</Link>.</p>}
            {(["password", "confirm"] as const).map((name) => (
              <label key={name} className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{name === "password" ? "New password" : "Confirm new password"}</span>
                <span className="flex h-11 items-center rounded-xl border border-border bg-surface pr-1 focus-within:border-brand-500">
                  <input name={name} type={show ? "text" : "password"} required minLength={8} maxLength={128} autoComplete="new-password" placeholder={name === "password" ? "At least 8 characters, with a number" : "Type it again"} className="h-full min-w-0 flex-1 bg-transparent px-4 outline-none" />
                  {name === "password" && (
                    <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2">
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </span>
              </label>
            ))}
            {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            <button type="submit" disabled={busy || !token} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta font-bold text-white hover:bg-cta-600 disabled:opacity-60">
              {busy && <Loader2 size={18} className="animate-spin" />} Save new password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
