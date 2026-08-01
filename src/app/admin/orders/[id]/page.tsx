"use client";

import {
  Archive, ArchiveRestore, ArrowLeft, Ban, CreditCard, MapPin, Printer,
  RotateCcw, StickyNote, User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Btn, Card, Select, StatusPill, TextArea, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import { ORDER_STATUSES, PAYMENT_STATUSES, titleCase } from "@/lib/orders";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const toast = useToast();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api("/api/admin/orders", "GET")
      .then((all: Order[]) => setOrder(all.find((o) => o.id === id) ?? null))
      .catch(() => setOrder(null));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const update = async (patch: Record<string, unknown>, msg: string) => {
    setSaving(true);
    try {
      const updated = await api("/api/admin/orders", "PUT", { id, ...patch });
      setOrder(updated);
      toast(msg);
    } catch {
      toast("Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await update({ note }, "Note added");
    setNote("");
  };

  if (order === undefined) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />)}</div>;
  if (order === null) return (
    <div className="py-20 text-center">
      <p className="font-display text-lg font-bold">Order not found</p>
      <Link href="/admin/orders" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">← Back to orders</Link>
    </div>
  );

  const o = order;
  const bill = o.billing ?? o.customer;

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"><ArrowLeft size={16} /> All orders</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{o.number}</h1>
          <p className="mt-1 text-sm text-muted">Placed {new Date(o.date).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill status={o.status} />
            <StatusPill status={o.paymentStatus} />
            {o.archived && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">Archived</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" size="sm" onClick={() => printInvoice(o)}><Printer size={15} /> Invoice</Btn>
          {o.status !== "cancelled" && o.status !== "refunded" && (
            <Btn variant="outline" size="sm" onClick={() => update({ status: "cancelled" }, "Order cancelled")} disabled={saving}><Ban size={15} /> Cancel</Btn>
          )}
          {o.paymentStatus === "paid" && (
            <Btn variant="outline" size="sm" onClick={() => update({ paymentStatus: "refunded", status: "refunded" }, "Order refunded")} disabled={saving}><RotateCcw size={15} /> Refund</Btn>
          )}
          <Btn variant={o.archived ? "primary" : "ghost"} size="sm" onClick={() => update({ archived: !o.archived }, o.archived ? "Order restored" : "Order archived")} disabled={saving}>
            {o.archived ? <><ArchiveRestore size={15} /> Restore</> : <><Archive size={15} /> Archive</>}
          </Btn>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* left: items + status controls */}
        <div className="flex flex-col gap-6">
          <Card>
            <div className="border-b border-border px-5 py-4"><h2 className="font-display font-bold">Items</h2></div>
            <div className="divide-y divide-border">
              {o.items.map((it) => (
                <div key={it.slug} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div>
                    <Link href={`/product/${it.slug}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">{it.name}</Link>
                    <p className="text-xs text-muted">{formatPrice(it.price)} × {it.quantity}</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-border px-5 py-4 text-sm">
              <Row label="Subtotal" value={formatPrice(o.subtotal)} />
              {o.discount > 0 && <Row label="Discount" value={`−${formatPrice(o.discount)}`} accent />}
              <Row label="Shipping" value={o.shipping === 0 ? "Free" : formatPrice(o.shipping)} />
              <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="tabular-nums">{formatPrice(o.total)}</span></div>
              {(o.refunded ?? 0) > 0 && <Row label="Refunded" value={`−${formatPrice(o.refunded!)}`} accent />}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display font-bold">Update order</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Fulfilment status" value={o.status} disabled={saving} onChange={(e) => update({ status: e.target.value as OrderStatus }, `Marked ${titleCase(e.target.value)}`)}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </Select>
              <Select label="Payment status" value={o.paymentStatus} disabled={saving} onChange={(e) => update({ paymentStatus: e.target.value as PaymentStatus }, "Payment status updated")}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </Select>
            </div>
          </Card>

          {/* timeline */}
          <Card className="p-5">
            <h2 className="mb-4 font-display font-bold">Order timeline</h2>
            <ol className="relative ml-2 border-l border-border">
              {[...o.timeline].reverse().map((e, i) => (
                <li key={i} className="mb-4 ml-4 last:mb-0">
                  <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-brand-500" />
                  <p className="text-sm font-medium">{e.label}{e.by && <span className="text-muted"> · {e.by}</span>}</p>
                  <p className="text-xs text-muted">{new Date(e.at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* right: customer, payment, notes */}
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display font-bold"><User size={16} className="text-brand-500" /> Customer</h2>
            <p className="text-sm font-medium">{o.customer.name}</p>
            <p className="text-sm text-muted">{o.customer.email || "—"}</p>
            <p className="text-sm text-muted">{o.customer.phone || "—"}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display font-bold"><MapPin size={16} className="text-brand-500" /> Shipping</h2>
            <p className="text-sm">{o.customer.address || "—"}</p>
            <p className="text-sm text-muted">{o.customer.city}</p>
          </Card>

          {o.billing && (o.billing.address !== o.customer.address || o.billing.name !== o.customer.name) && (
            <Card className="p-5">
              <h2 className="mb-3 font-display font-bold">Billing</h2>
              <p className="text-sm font-medium">{bill.name}</p>
              <p className="text-sm">{bill.address}</p>
              <p className="text-sm text-muted">{bill.city}</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display font-bold"><CreditCard size={16} className="text-brand-500" /> Payment</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Method</span><span className="font-medium">{o.payment}</span></div>
              <div className="flex justify-between"><span className="text-muted">Status</span><StatusPill status={o.paymentStatus} /></div>
              {o.transactionId && <div className="flex justify-between gap-3"><span className="text-muted">Reference</span><span className="font-mono text-xs">{o.transactionId}</span></div>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display font-bold"><StickyNote size={16} className="text-brand-500" /> Internal notes</h2>
            {o.notes.length > 0 ? (
              <ul className="mb-3 space-y-2">
                {o.notes.map((n, i) => (
                  <li key={i} className="rounded-lg bg-surface-2 p-3 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(n.at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mb-3 text-sm text-muted">No notes yet.</p>}
            <TextArea label="" placeholder="Add a note for your team…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            <Btn className="mt-2" size="sm" onClick={addNote} disabled={saving || !note.trim()}>Add note</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${accent ? "text-brand-600 dark:text-brand-400" : ""}`}>
      <span className={accent ? "" : "text-muted"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/** Opens a clean, printable invoice in a new window. */
function printInvoice(o: Order) {
  const rows = o.items
    .map((it) => `<tr><td>${it.name}</td><td class="r">${it.quantity}</td><td class="r">KES ${it.price.toLocaleString()}</td><td class="r">KES ${(it.price * it.quantity).toLocaleString()}</td></tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${o.number}</title>
  <style>
    *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0c0e14;margin:40px;font-size:13px}
    h1{font-size:22px;margin:0} .muted{color:#667085} .r{text-align:right}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #00b25a;padding-bottom:16px;margin-bottom:20px}
    .brand{font-size:18px;font-weight:800;color:#00994d} table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:left} th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#667085}
    .totals{margin-top:16px;margin-left:auto;width:260px} .totals div{display:flex;justify-content:space-between;padding:4px 0}
    .totals .grand{border-top:2px solid #0c0e14;margin-top:6px;padding-top:8px;font-weight:800;font-size:15px}
    .cols{display:flex;gap:40px;margin:8px 0 4px} .cols>div{flex:1}
    .foot{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px;color:#667085;font-size:12px}
  </style></head><body>
    <div class="head">
      <div><div class="brand">SIR VERT ENTERPRISE</div><div class="muted">Nairobi CBD, Kenya · +254 799 239 739</div></div>
      <div class="r"><h1>Invoice</h1><div class="muted">${o.number}</div><div class="muted">${new Date(o.date).toLocaleDateString("en-KE", { dateStyle: "medium" } as Intl.DateTimeFormatOptions)}</div></div>
    </div>
    <div class="cols">
      <div><strong>Billed to</strong><br>${o.customer.name}<br>${o.customer.email || ""}<br>${o.customer.phone || ""}</div>
      <div><strong>Ship to</strong><br>${o.customer.address || ""}<br>${o.customer.city || ""}</div>
      <div><strong>Payment</strong><br>${o.payment}<br>${o.transactionId || ""}<br>${titleCase(o.paymentStatus)}</div>
    </div>
    <table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals">
      <div><span class="muted">Subtotal</span><span>KES ${o.subtotal.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div><span class="muted">Discount</span><span>− KES ${o.discount.toLocaleString()}</span></div>` : ""}
      <div><span class="muted">Shipping</span><span>${o.shipping === 0 ? "Free" : "KES " + o.shipping.toLocaleString()}</span></div>
      <div class="grand"><span>Total</span><span>KES ${o.total.toLocaleString()}</span></div>
    </div>
    <div class="foot">Thank you for shopping with SIR VERT ENTERPRISE. When you call, we answer. · sales@sirvertenterprise.co.ke</div>
  </body></html>`;
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
