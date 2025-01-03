import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/'

  // Get the token from session storage
  const isAuthenticated = request.cookies.get('auth')?.value

  // Redirect authenticated users away from public paths
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to homepage
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Add your protected routes
export const config = {
  matcher: ['/', '/dashboard/:path*', '/games/:path*']
} 