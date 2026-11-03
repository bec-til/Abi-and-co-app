import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If logged in and trying to access /login, redirect to /dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If NOT logged in and trying to access a protected route (or root), redirect to /login
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect specific routes + root, while skipping static files, images, and internal Next.js assets
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/customers/:path*',
    '/analytics/:path*',
  ],
};