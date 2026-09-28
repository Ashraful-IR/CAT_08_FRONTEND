import { NextResponse } from "next/server";

/**
 * Presence-only cookie guard (SECURITY_AND_AUTH → Route protection).
 * It cannot verify the JWT — real verification happens when the first
 * authenticated API call returns 401 and the API client reacts.
 */

const PROTECTED_PREFIXES = ["/appointments", "/profile"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * @param {import("next/server").NextRequest & { cookies: { get: (name: string) => { value: string } | undefined } }} request
 * @returns {import("next/server").NextResponse}
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get("token")?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!hasToken && isProtected) {
    const login = new URL("/login", request.url);
    // `next` is validated as a relative path before use (open-redirect guard).
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (hasToken && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/appointments/:path*", "/profile/:path*", "/login", "/register"],
};
