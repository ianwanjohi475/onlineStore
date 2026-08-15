import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import type { Category } from "@/lib/types";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json((await readStore()).categories);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as Category[];
  const store = (await readStore());
  store.categories = body;
  await writeStore(store);
  return NextResponse.json(store.categories);
}
