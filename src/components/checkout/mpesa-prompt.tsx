"use client";

import { CheckCircle2, Loader2, RefreshCw, Smartphone, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/context/catalog";
import { formatPrice } from "@/lib/utils";

export interface PromptInfo {
  number: string;
  /** token that lets this browser check / retry the payment */
  t: string;
  total: number;
  status: string;
  message: string;
  receipt?: string | null;
  amountDue?: number;
  phone?: string | null;
  sent?: boolean;
}

/**
 * Live M-Pesa payment panel after checkout: waits for the customer to enter
 * their PIN, shows the result, and lets them re-send the prompt (or pay to the
 * Till) if it was cancelled or timed out.
 */
export function MpesaPrompt({ info, onPaid }: { info: PromptInfo; onPaid?: () => void }) {
  const { settings } = useCatalog();
  const [state, setState] = useState(info);
  const [phone, setPhone] = useState(info.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(info.sent === false ? info.message : "");
  const started = useRef<number | null>(null);
  const paidOnce = useRef(false);

  const poll = useCallback(async () => {
    const r = await fetch(`/api/mpesa/pay?order=${encodeURIComponent(info.number)}&t=${info.t}`, { cache: "no-store" }).catch(() => null);
    if (!r?.ok) return;
    const d = await r.json();
    setState((s) => ({ ...s, ...d }));
    if (d.status === "paid" && !paidOnce.current) {
      paidOnce.current = true;
      onPaid?.();
    }
  }, [info.number, info.t, onPaid]);

  useEffect(() => {
    if (state.status !== "pending") return;
    started.current ??= Date.now();
    const id = setInterval(() => {
      if (Date.now() - (started.current ?? Date.now()) > 4 * 60_000) return clearInterval(id);
      void poll();
    }, 3000);
    return () => clearInterval(id);
  }, [state.status, poll]);

  const retry = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: info.number, t: info.t, phone }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Couldn't send the prompt. Please try again.");
      started.current = Date.now();
      setState((s) => ({ ...s, ...d }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the prompt.");
    } finally {
      setBusy(false);
    }
  };

  const due = state.amountDue ?? info.total;

  if (state.status === "paid") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <CheckCircle2 size={26} className="shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">M-Pesa payment received</p>
          <p className="text-sm text-muted">
            Thank you!{state.receipt && <> Receipt <b className="font-mono text-foreground">{state.receipt}</b>.</>} We&apos;re preparing your order.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "pending" && !error) {
    return (
      <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Smartphone size={22} />
          <Loader2 size={44} className="absolute inset-0 animate-spin text-emerald-500/50" strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-semibold">Check your phone{state.phone && <> ({state.phone})</>}</p>
          <p className="text-sm text-muted">Enter your M-Pesa PIN to pay <b className="text-foreground">{formatPrice(due)}</b>. This page updates by itself once you&apos;ve paid.</p>
        </div>
      </div>
    );
  }

  // failed / cancelled / not sent
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <XCircle size={24} className="shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Payment not completed yet</p>
          <p className="text-sm text-muted">{error || state.message || "The M-Pesa payment didn't go through."} Your order is saved — you can try again.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 16))}
          placeholder="0712 345 678"
          aria-label="M-Pesa phone number"
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 outline-none focus:border-brand-500"
        />
        <Button onClick={retry} disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Send M-Pesa prompt again
        </Button>
      </div>
      {settings.mpesaTill && (
        <p className="text-xs text-muted">
          Or pay {formatPrice(due)} to Till <b className="font-mono text-foreground">{settings.mpesaTill}</b> (Lipa na M-Pesa → Buy Goods) and we&apos;ll confirm it.
        </p>
      )}
    </div>
  );
}
