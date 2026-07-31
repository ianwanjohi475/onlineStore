import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import type { OrderStatus } from "@/lib/types";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json(readStore().orders);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const { id, status } = (await req.json()) as { id: string; status: OrderStatus };
  const store = readStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  order.status = status;
  writeStore(store);
  return NextResponse.json(order);
}
