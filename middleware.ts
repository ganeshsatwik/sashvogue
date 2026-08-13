import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  // Define customer protected paths
  const isProtectedPath =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/track-order');

  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtectedPath) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/?login=true', request.url));
    }

    const payload = await verifySessionToken(sessionToken);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/?login=true', request.url));
      response.cookies.delete('session_token');
      return response;
    }
  }

  if (isAuthPath) {
    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
