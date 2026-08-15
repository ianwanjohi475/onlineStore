import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { hasDb, getPool, DB_URL } from "@/lib/db";
import { readStore } from "@/lib/store/store";

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
