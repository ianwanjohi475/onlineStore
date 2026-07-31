import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/admin/auth";

export function middleware(req: NextRequest) {
  const authed = req.cookies.get(ADMIN_COOKIE)?.value === ADMIN_TOKEN;
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
