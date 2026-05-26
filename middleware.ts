import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/overlord/push") ||
    pathname === "/api/operations/import" ||
    pathname.startsWith("/ws/terminal") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (!request.auth?.user && !isPublic) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (request.auth?.user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
