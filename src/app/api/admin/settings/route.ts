import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json(readStore().settings);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as Partial<SiteSettings>;
  const store = readStore();
  store.settings = {
    ...store.settings,
    ...body,
    freeShipThreshold: Number(body.freeShipThreshold ?? store.settings.freeShipThreshold),
    shippingFee: Number(body.shippingFee ?? store.settings.shippingFee),
  };
  writeStore(store);
  return NextResponse.json(store.settings);
}
