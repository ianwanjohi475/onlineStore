import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "./auth";

export async function isAuthed() {
  return verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: "Not authorized" }, { status: 401 });
}
