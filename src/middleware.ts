import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const locales = ['fr', 'en', 'ar'];
const defaultLocale = 'fr';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nouamane_super_secret_key_2024'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. ADMIN SECURITY ---
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get('admin_token')?.value;

    let isValid = false;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        isValid = true;
      } catch (error) {
        console.error('Invalid token in middleware:', error);
      }
    }

    if (!isValid) {
      if (isAdminApiRoute) {
        return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  // --- 2. STATIC FILES & API ROUTES (Except Admin) ---
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // --- 3. LOCALE REDIRECTION ---
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
