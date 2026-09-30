import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/auth";

export async function proxy(req: NextRequest) {
  const authed = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    if (authed) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin") && !authed) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
