import { NextResponse } from "next/server";
import { publicOrder } from "@/lib/order-public";
import { findOrdersByUser } from "@/lib/store/store";
import { currentUser } from "@/lib/store/users";

export const runtime = "nodejs";

/** GET /api/auth/orders — orders placed while signed in to this account. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const orders = (await findOrdersByUser(user.id)).map(publicOrder);
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}
