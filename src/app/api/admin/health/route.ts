import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { hasDb, getPool, DB_URL } from "@/lib/db";
import { addOrder, deleteOrder, getOrders, readStore } from "@/lib/store/store";
import type { Order } from "@/lib/types";

/**
 * Reports which storage backend is live and whether it's reachable, plus live
 * record counts read straight from that backend. Powers the admin status page
 * and the topbar database badge.
 */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  const start = Date.now();

  let connected = !hasDb; // file store is always "connected"
  let host: string | null = null;
  let error: string | null = null;

  if (hasDb) {
    try {
      await getPool().query("SELECT 1");
      connected = true;
    } catch (e) {
      connected = false;
      error = e instanceof Error ? e.message : "Connection failed";
    }
    try { host = new URL(DB_URL!).host; } catch { /* ignore */ }
  }

  let counts = { products: 0, orders: 0, customers: 0, categories: 0, brands: 0 };
  try {
    const store = await readStore();
    counts = {
      products: store.products.length,
      orders: store.orders.length,
      customers: new Set(store.orders.map((o) => o.customer.email).filter(Boolean)).size,
      categories: store.categories.length,
      brands: store.brands.length,
    };
  } catch (e) {
    if (!error) error = e instanceof Error ? e.message : "Read failed";
  }

  return NextResponse.json({
    backend: hasDb ? "database" : "file",
    connected,
    host,
    error,
    latencyMs: Date.now() - start,
    counts,
    checkedAt: new Date().toISOString(),
  });
}

/**
 * Backend self-test: exercises the REAL order pipeline end-to-end —
 * write a probe order → read it back → delete it — against whichever backend
 * is live. Returns a step-by-step pass/fail so you can see exactly where (if
 * anywhere) saving an order breaks on your own machine/database.
 */
export async function POST() {
  if (!(await isAuthed())) return unauthorized();
  const steps: { step: string; ok: boolean; detail?: string }[] = [];
  const start = Date.now();
  const now = new Date().toISOString();
  const probeId = `TEST-${Date.now()}`;
  const probe: Order = {
    id: probeId,
    number: `#${probeId}`,
    date: now,
    status: "pending",
    paymentStatus: "pending",
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    payment: "self-test",
    transactionId: probeId,
    refunded: 0,
    customer: { name: "Backend self-test", email: "", phone: "", address: "", city: "" },
    timeline: [{ at: now, label: "Self-test probe" }],
    notes: [],
  };

  let wrote = false;
  try {
    await addOrder(probe);
    wrote = true;
    steps.push({ step: "Write a test order", ok: true });
  } catch (e) {
    steps.push({ step: "Write a test order", ok: false, detail: e instanceof Error ? e.message : "write failed" });
  }

  if (wrote) {
    try {
      const found = (await getOrders()).some((o) => o.id === probeId);
      steps.push({ step: "Read it back", ok: found, detail: found ? undefined : "order was written but not found on read-back" });
    } catch (e) {
      steps.push({ step: "Read it back", ok: false, detail: e instanceof Error ? e.message : "read failed" });
    }
    try {
      await deleteOrder(probeId);
      steps.push({ step: "Clean up the test order", ok: true });
    } catch (e) {
      steps.push({ step: "Clean up the test order", ok: false, detail: e instanceof Error ? e.message : "cleanup failed" });
    }
  }

  const ok = steps.length > 0 && steps.every((s) => s.ok);
  return NextResponse.json({
    ok,
    backend: hasDb ? "database" : "file",
    steps,
    latencyMs: Date.now() - start,
    checkedAt: new Date().toISOString(),
  });
}
