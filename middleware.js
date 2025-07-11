import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// Protected routes that require authentication
const protectedRoutes = [
  '/patients',
  '/reports',
  '/studies',
  '/categories',
  '/medical',
  '/dashboard'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/demo',
  '/about',
  '/features',
  '/contact',
  '/api/health',
  '/legacy'
];

// Auth routes
const authRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
  '/api/auth/me'
];

export default function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Handle static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Allow auth routes to pass through
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // For protected routes in production (Netlify), check authentication
  if (isProtectedRoute && process.env.NODE_ENV === 'production') {
    // Check for demo mode
    const isDemoMode = search.includes('demo=true');
    
    if (isDemoMode) {
      // Allow demo mode access without authentication
      return NextResponse.next();
    }

    // Redirect to login with returnTo parameter
    if (!request.cookies.get('appSession')) {
      const returnUrl = `${pathname}${search}`;
      url.pathname = '/api/auth/login';
      url.search = `returnTo=${encodeURIComponent(returnUrl)}`;
      return NextResponse.redirect(url);
    }
  }

  // Handle trailing slashes for static export
  if (process.env.NETLIFY && pathname !== '/' && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }

  // Special handling for legacy route with demo parameter
  if (pathname === '/legacy' && search) {
    // Preserve query parameters for legacy route
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// Optional: Use Auth0 middleware wrapper for additional protection
// Uncomment the following line if you want to use Auth0's built-in middleware
// export default withMiddlewareAuthRequired(middleware);