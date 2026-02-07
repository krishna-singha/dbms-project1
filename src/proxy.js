import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Auth check (shallow)
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = Boolean(token);

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    (pathname === '/login' || pathname === '/register')
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  }

  // Protect private routes
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
