import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];
const DEFAULT_REDIRECT = "/dashboard";
const LOGIN_PATH = "/auth/login";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth-token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
