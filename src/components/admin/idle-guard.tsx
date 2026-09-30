"use client";

import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_MS = 15 * 60 * 1000;
const WARN_MS = 60 * 1000; // warn during the last minute
const HEARTBEAT_EVERY = 60 * 1000;

/**
 * Signs the admin out after 15 minutes without activity (mouse, keyboard,
 * touch, scroll). One minute before, a dialog offers "Stay signed in".
 * Activity extends the server session at most once a minute; background
 * polling does NOT count as activity.
 */
export function IdleGuard() {
  const lastActive = useRef(Date.now());
  const lastBeat = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [defaultPw, setDefaultPw] = useState(false);

  const signOut = useCallback(async (reason: "idle" | "expired") => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    window.location.href = `/admin/login?reason=${reason}`;
  }, []);

  const beat = useCallback(async () => {
    lastBeat.current = Date.now();
    const res = await fetch("/api/admin/session", { method: "POST" }).catch(() => null);
    if (res && res.status === 401) signOut("expired");
  }, [signOut]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDefaultPw(!!d.defaultPassword))
      .catch(() => {});

    const onActivity = () => {
      lastActive.current = Date.now();
      if (Date.now() - lastBeat.current > HEARTBEAT_EVERY) void beat();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const id = setInterval(() => {
      const idle = Date.now() - lastActive.current;
      if (idle >= IDLE_MS) void signOut("idle");
      else if (idle >= IDLE_MS - WARN_MS) setSecondsLeft(Math.ceil((IDLE_MS - idle) / 1000));
      else setSecondsLeft(null);
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(id);
    };
  }, [beat, signOut]);

  return (
    <>
      {defaultPw && (
        <div className="flex flex-wrap items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1">You&apos;re using the default admin password. Set your own to keep the store safe.</span>
          <Link href="/admin/settings?tab=Security" className="font-semibold underline">Change password</Link>
        </div>
      )}

      {secondsLeft !== null && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4" role="alertdialog" aria-labelledby="idle-title">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-500/15 text-amber-600"><Clock size={24} /></span>
            <h2 id="idle-title" className="mt-3 font-display text-lg font-bold">Still there?</h2>
            <p className="mt-1 text-sm text-muted">For your security you&apos;ll be signed out in <b className="text-foreground tabular-nums">{secondsLeft}s</b> because of inactivity.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => signOut("idle")} className="h-10 rounded-lg border border-border text-sm font-semibold hover:bg-surface-2">Sign out</button>
              <button
                onClick={() => { lastActive.current = Date.now(); setSecondsLeft(null); void beat(); }}
                className="h-10 rounded-lg bg-brand-500 text-sm font-bold text-white hover:bg-brand-600"
              >
                Stay signed in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
