"use client";

import { useEffect, useRef, useState } from "react";

type Status = "connecting" | "live" | "offline";

/**
 * Subscribes to the server's real-time event stream and invokes `onChange`
 * whenever the store version increments. Auto-reconnects with backoff.
 * Returns the live connection status and a pulse counter that ticks on updates.
 */
export function useLive(onChange?: () => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const [status, setStatus] = useState<Status>("connecting");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;
    let es: EventSource | null = null;
    let baseline = -1;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (stopped) return;
      es = new EventSource("/api/events");
      es.onopen = () => setStatus("live");
      es.onmessage = (e) => {
        try {
          const { version } = JSON.parse(e.data) as { version: number };
          if (baseline === -1) {
            baseline = version; // ignore the initial snapshot
            return;
          }
          if (version !== baseline) {
            baseline = version;
            setPulse((p) => p + 1);
            cb.current?.();
          }
        } catch {
          /* ignore malformed */
        }
      };
      es.onerror = () => {
        setStatus("offline");
        es?.close();
        retry = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      stopped = true;
      es?.close();
      clearTimeout(retry);
    };
  }, []);

  return { status, pulse };
}
