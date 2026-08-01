"use client";

import { useEffect, useRef } from "react";

/**
 * Real-time-ish updates via lightweight polling.
 *
 * We deliberately avoid a long-lived SSE/WebSocket connection: on HTTP/1.1 a
 * held-open stream eats one of the browser's ~6 connections-per-host and can
 * starve client-side navigation, making the app feel frozen. Instead we poll a
 * tiny `/api/version` endpoint every few seconds; each request is short-lived
 * and released immediately, so navigation is never blocked. `onChange` fires
 * only when the store version actually changes. Polling pauses while the tab
 * is hidden.
 */
export function useLive(onChange?: () => void, intervalMs = 4000) {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (typeof window === "undefined") return;
    let baseline = -1;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (stopped) return;
      timer = setTimeout(tick, intervalMs);
    };

    const tick = async () => {
      if (stopped) return;
      if (document.hidden) return schedule();
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (res.ok) {
          const { version } = (await res.json()) as { version: number };
          if (baseline === -1) baseline = version;
          else if (version !== baseline) {
            baseline = version;
            cb.current?.();
          }
        }
      } catch {
        /* offline / transient — try again next tick */
      }
      schedule();
    };

    // refresh immediately when the tab regains focus
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);

    // establish the baseline right away so changes are caught from the start
    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
}
