import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json({ suspended: readStore().suspendedCustomers ?? [] });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const { email, suspended } = (await req.json()) as { email: string; suspended: boolean };
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const store = readStore();
  const set = new Set(store.suspendedCustomers ?? []);
  if (suspended) set.add(email);
  else set.delete(email);
  store.suspendedCustomers = [...set];
  writeStore(store);
  return NextResponse.json({ suspended: store.suspendedCustomers });
}
