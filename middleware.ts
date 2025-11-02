import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any middleware logic here if needed
    console.log('Middleware processing request:', req.url);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This will allow all requests - we're not protecting any routes by default
        console.log('Authorization check, allowing all requests');
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - root path (/)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|$).*)",
  ]
}
