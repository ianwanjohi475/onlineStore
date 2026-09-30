import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createSession, readSession } from "@/lib/admin/auth";

/**
 * Guards /admin pages: no valid session → the login page. Opening admin pages
 * counts as activity, so the 15-minute idle timer restarts (sliding session).
 * Admin APIs re-check the session (incl. password version) on every call.
 */
export async function proxy(req: NextRequest) {
  const session = await readSession(req.cookies.get(ADMIN_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return session ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }
  if (!session) {
    const url = new URL("/admin/login", req.url);
    if (req.cookies.get(ADMIN_COOKIE)) url.searchParams.set("reason", "expired");
    const res = NextResponse.redirect(url);
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }
  const res = NextResponse.next();
  res.cookies.set(ADMIN_COOKIE, await createSession(session.version, session.issuedAt), adminCookieOptions);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
