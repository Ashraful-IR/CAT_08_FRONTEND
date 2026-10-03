import { NextResponse } from "next/server";

/**
 * Presence-only cookie guard (SECURITY_AND_AUTH → Route protection).
 * The backend's auth is Better Auth (cookie `better-auth.session_token`;
 * `__Secure-` prefixed in production). It cannot verify the session here —
 * real verification happens when the first authenticated API call returns
 * 401 and the API client reacts. The legacy `token` cookie (pre-Better Auth)
 * is still accepted during the migration window.
 */

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token", "token"];

const PROTECTED_PREFIXES = ["/appointments", "/profile"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * @param {import("next/server").NextRequest & { cookies: { get: (name: string) => { value: string } | undefined } }} request
 * @returns {import("next/server").NextResponse}
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!hasSession && isProtected) {
    const login = new URL("/login", request.url);
    // `next` is validated as a relative path before use (open-redirect guard).
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/appointments/:path*", "/profile/:path*", "/login", "/register"],
};
