import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Marked pending",
  confirmed: "Order confirmed",
  processing: "Processing started",
  packed: "Order packed",
  shipped: "Marked shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Marked delivered",
  cancelled: "Order cancelled",
  refunded: "Order refunded",
  returned: "Order returned",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Payment marked paid",
  failed: "Payment marked failed",
  refunded: "Payment refunded",
  "partially-refunded": "Payment partially refunded",
};

interface UpdateBody {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  refunded?: number;
  archived?: boolean;
  note?: string;
}

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json(readStore().orders);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as UpdateBody;
  const store = readStore();
  const order = store.orders.find((o) => o.id === body.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();
  order.timeline = order.timeline ?? [];
  order.notes = order.notes ?? [];

  if (body.status && body.status !== order.status) {
    order.status = body.status;
    order.timeline.push({ at: now, label: statusLabels[body.status], by: "Admin" });
  }

  if (body.paymentStatus && body.paymentStatus !== order.paymentStatus) {
    order.paymentStatus = body.paymentStatus;
    if (body.paymentStatus === "refunded") order.refunded = order.total;
    if (body.paymentStatus === "partially-refunded" && typeof body.refunded === "number") order.refunded = body.refunded;
    if (body.paymentStatus === "paid") order.refunded = 0;
    order.timeline.push({ at: now, label: paymentLabels[body.paymentStatus], by: "Admin" });
  }

  if (typeof body.archived === "boolean") {
    order.archived = body.archived;
    order.timeline.push({ at: now, label: body.archived ? "Order archived" : "Order restored", by: "Admin" });
  }

  if (body.note && body.note.trim()) {
    order.notes.push({ at: now, text: body.note.trim() });
  }

  writeStore(store);
  return NextResponse.json(order);
}
