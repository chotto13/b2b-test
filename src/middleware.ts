import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/forgot-password", "/api/auth"]
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Redirect to login if not authenticated and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if already authenticated and trying to access login/register
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const isAdmin = token?.role === "ADMIN" || token?.role === "SUPER_ADMIN"
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
