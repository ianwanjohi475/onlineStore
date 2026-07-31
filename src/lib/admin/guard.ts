import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "./auth";

export async function isAuthed() {
  return (await cookies()).get(ADMIN_COOKIE)?.value === ADMIN_TOKEN;
}

export function unauthorized() {
  return NextResponse.json({ error: "Not authorized" }, { status: 401 });
}
