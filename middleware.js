import { NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

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
  '/medical-ai-demo',
  '/about',
  '/features',
  '/contact',
  '/api/health',
  '/legacy'
];

// Auth routes (handled by Auth0 v4 middleware)
const authRoutes = [
  '/auth/login',
  '/auth/logout',
  '/auth/callback',
  '/auth/me'
];

export default async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  
  console.log('[Middleware] Processing request for:', pathname);

  // Handle static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Handle Auth0 routes (v4 automatically handles /auth/* routes)
  if (pathname.startsWith('/auth/')) {
    return auth0.middleware(request);
  }

  // Check if the route is public first
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  console.log('[Middleware] Is public route?', isPublicRoute);
  
  // Check if the route is protected
  const isProtectedRoute = !isPublicRoute && protectedRoutes.some(route => pathname.startsWith(route));
  console.log('[Middleware] Is protected route?', isProtectedRoute);

  // For protected routes in production (Netlify), check authentication
  if (isProtectedRoute && process.env.NODE_ENV === 'production') {
    // Check for demo mode
    const isDemoMode = search.includes('demo=true');
    
    if (isDemoMode) {
      // Allow demo mode access without authentication
      return NextResponse.next();
    }

    // Use Auth0 v4 middleware for authentication check
    const response = await auth0.middleware(request);
    
    // If Auth0 middleware returns a redirect (user not authenticated), use it
    if (response.status === 302 || response.status === 307) {
      return response;
    }
    
    // Otherwise continue with the request
    return response;
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