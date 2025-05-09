import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user');
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');

  // DEBUG : log le cookie
  console.log('middleware user cookie:', user);

  // Toujours autoriser l'accès à /login et /register
  if (isAuthPage) {
    return NextResponse.next();
  }

  // Si pas connecté et pas sur une page d'auth, redirige vers /login
  if (!user && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si connecté et essaie d'accéder à /login ou /register, redirige vers /
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 