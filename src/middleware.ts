import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the CRM: requests without a session cookie go straight to the login page.
 * This is only a fast first check — every CRM page and action validates the session against
 * the database (src/lib/auth/session.ts) and checks permissions server-side.
 */
const COOKIES = ["__Host-lynix_session", "lynix_session"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/crm/login") return NextResponse.next();
  const hasSession = COOKIES.some((c) => req.cookies.has(c));
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/crm/login";
    url.search = pathname === "/crm" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/crm", "/crm/:path*"] };
