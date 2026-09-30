import { NextResponse } from "next/server";
import { findOrderByNumber } from "@/lib/store/store";
import { publicOrder } from "@/lib/order-public";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";

/** Orders remembered on the shopper's device (?numbers=SVE-1,SVE-2), newest first. */
export async function GET(req: Request) {
  if (!rateLimit(`myorders:${clientIp(req)}`, 30, 60 * 1000).ok) {
    return NextResponse.json({ orders: [], error: "Too many requests" }, { status: 429 });
  }
  const raw = new URL(req.url).searchParams.get("numbers") || "";
  const numbers = [...new Set(raw.split(",").map((n) => n.trim().toUpperCase().replace(/^#/, "")).filter((n) => /^[A-Z0-9-]{3,24}$/.test(n)))].slice(0, 25);
  const found = await Promise.all(numbers.map((n) => findOrderByNumber(n)));
  const orders = found.filter((o): o is NonNullable<typeof o> => !!o).map(publicOrder);
  orders.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}
