import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect dashboard and other internal routes
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                           nextUrl.pathname.startsWith('/risk-zones') ||
                           nextUrl.pathname.startsWith('/stats') ||
                           nextUrl.pathname.startsWith('/settings');

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
})

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public folder
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
