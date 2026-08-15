import { NextResponse } from "next/server";
import { clearOrders, getOrders, updateOrder } from "@/lib/store/store";
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
  return NextResponse.json(await getOrders());
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as UpdateBody;
  const now = new Date().toISOString();

  const order = await updateOrder(body.id, (o) => {
    o.timeline = o.timeline ?? [];
    o.notes = o.notes ?? [];

    if (body.status && body.status !== o.status) {
      o.status = body.status;
      o.timeline.push({ at: now, label: statusLabels[body.status], by: "Admin" });
    }
    if (body.paymentStatus && body.paymentStatus !== o.paymentStatus) {
      o.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "refunded") o.refunded = o.total;
      if (body.paymentStatus === "partially-refunded" && typeof body.refunded === "number") o.refunded = body.refunded;
      if (body.paymentStatus === "paid") o.refunded = 0;
      o.timeline.push({ at: now, label: paymentLabels[body.paymentStatus], by: "Admin" });
    }
    if (typeof body.archived === "boolean") {
      o.archived = body.archived;
      o.timeline.push({ at: now, label: body.archived ? "Order archived" : "Order restored", by: "Admin" });
    }
    if (body.note && body.note.trim()) {
      o.notes.push({ at: now, text: body.note.trim() });
    }
    return o;
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

/** Clear every order — a clean slate for orders and customers. */
export async function DELETE() {
  if (!(await isAuthed())) return unauthorized();
  await clearOrders();
  return NextResponse.json({ ok: true });
}
