import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
// Note: /admin has its own authentication system built into the page
const protectedRoutes = [
  '/style-interface',
  '/wardrobe-ideas',
  '/subscription',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Check for session cookie (correct cookie name: auth-session)
    const sessionCookie = request.cookies.get('auth-session')
    
    if (!sessionCookie) {
      // Redirect to sign-in page if no session
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|public).*)",
  ]
}
