import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { listUsers } from "@/lib/store/users";
import { logActivity } from "@/lib/store/activity";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  const [store, accounts] = await Promise.all([readStore(), listUsers().catch(() => [])]);
  return NextResponse.json({ suspended: store.suspendedCustomers ?? [], accounts }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const { email, suspended } = (await req.json()) as { email: string; suspended: boolean };
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const store = (await readStore());
  const set = new Set(store.suspendedCustomers ?? []);
  if (suspended) set.add(email);
  else set.delete(email);
  store.suspendedCustomers = [...set];
  await writeStore(store);
  await logActivity("admin", suspended ? "warning" : "info", `Customer ${email} ${suspended ? "suspended" : "reactivated"}`, { ref: email, req });
  return NextResponse.json({ suspended: store.suspendedCustomers });
}
