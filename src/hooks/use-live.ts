"use client";

import { useEffect, useRef, useState } from "react";

type Status = "connecting" | "live" | "offline";

interface Sub {
  onChange?: () => void;
  onStatus?: (s: Status) => void;
  onPulse?: () => void;
}

/**
 * A single shared EventSource for the whole app.
 *
 * Opening one stream per component quickly exhausts the browser's ~6
 * connections-per-host budget on HTTP/1.1, which starves client-side
 * navigation and makes the app feel frozen. Instead every `useLive` consumer
 * subscribes to this one connection; it opens on first subscriber and closes
 * when the last one leaves.
 */
const subs = new Set<Sub>();
let es: EventSource | null = null;
let baseline = -1;
let status: Status = "connecting";
let retry: ReturnType<typeof setTimeout> | null = null;

function broadcastStatus(s: Status) {
  status = s;
  subs.forEach((x) => x.onStatus?.(s));
}

function connect() {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (es || subs.size === 0) return;
  broadcastStatus("connecting");
  es = new EventSource("/api/events");
  es.onopen = () => broadcastStatus("live");
  es.onmessage = (e) => {
    try {
      const { version } = JSON.parse(e.data) as { version: number };
      if (baseline === -1) {
        baseline = version; // ignore initial snapshot
        return;
      }
      if (version !== baseline) {
        baseline = version;
        subs.forEach((x) => { x.onPulse?.(); x.onChange?.(); });
      }
    } catch {
      /* ignore malformed */
    }
  };
  es.onerror = () => {
    broadcastStatus("offline");
    es?.close();
    es = null;
    if (retry) clearTimeout(retry);
    if (subs.size > 0) retry = setTimeout(connect, 3000);
  };
}

function teardownIfIdle() {
  if (subs.size > 0) return;
  if (retry) { clearTimeout(retry); retry = null; }
  es?.close();
  es = null;
  baseline = -1;
  status = "connecting";
}

/**
 * Subscribe to real-time store updates. `onChange` fires whenever the store
 * version increments. Returns the shared connection status and a per-consumer
 * pulse counter that ticks on each update.
 */
export function useLive(onChange?: () => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const [st, setSt] = useState<Status>(status);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const sub: Sub = {
      onChange: () => cb.current?.(),
      onStatus: (s) => setSt(s),
      onPulse: () => setPulse((p) => p + 1),
    };
    subs.add(sub);
    setSt(status);
    connect();
    return () => {
      subs.delete(sub);
      teardownIfIdle();
    };
  }, []);

  return { status: st, pulse };
}
