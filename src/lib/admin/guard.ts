import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, readSession } from "./auth";
import { credentialVersion } from "./credentials";

/** Valid, non-idle session whose password version is current. */
export async function isAuthed() {
  const session = await readSession((await cookies()).get(ADMIN_COOKIE)?.value);
  return !!session && session.version === (await credentialVersion());
}

export function unauthorized() {
  return NextResponse.json({ error: "Your session has ended. Please sign in again." }, { status: 401 });
}
