import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Public routes - no auth needed
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    // If logged in and visiting login/signup, redirect to dashboard
    if (session && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
