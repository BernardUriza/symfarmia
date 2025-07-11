import { handleAuth, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

// Custom login handler to properly handle returnTo parameter
const customLogin = async (req, { params }) => {
  try {
    const url = new URL(req.url);
    const returnTo = url.searchParams.get('returnTo') || '/';
    
    return handleLogin(req, {
      authorizationParams: {
        redirect_uri: process.env.AUTH0_BASE_URL + '/api/auth/callback'
      },
      returnTo: returnTo
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
};

// Custom callback handler to handle authentication callbacks
const customCallback = async (req, { params }) => {
  try {
    const response = await handleCallback(req, {
      redirectUri: process.env.AUTH0_BASE_URL + '/api/auth/callback',
      afterCallback: async (req, res, session, state) => {
        // Handle returnTo parameter from state
        const returnTo = state?.returnTo || '/';
        
        // Validate returnTo to prevent open redirects
        const validPaths = [
          '/',
          '/medical',
          '/patients', 
          '/reports',
          '/studies',
          '/categories',
          '/legacy',
          '/dashboard'
        ];
        
        let finalReturnTo = '/';
        for (const path of validPaths) {
          if (returnTo.startsWith(path)) {
            finalReturnTo = returnTo;
            break;
          }
        }
        
        return {
          ...session,
          returnTo: finalReturnTo
        };
      }
    });
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 });
  }
};

// Custom logout handler
const customLogout = async (req, { params }) => {
  try {
    return handleLogout(req, {
      returnTo: process.env.AUTH0_BASE_URL || '/'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
};

// Main Auth0 handler with custom routes
export const GET = async (req, context) => {
  const { params } = context;
  const auth0Param = params?.auth0;
  
  try {
    // Handle specific Auth0 routes
    if (auth0Param === 'login') {
      return customLogin(req, context);
    } else if (auth0Param === 'callback') {
      return customCallback(req, context);
    } else if (auth0Param === 'logout') {
      return customLogout(req, context);
    }
    
    // Default Auth0 handler for other routes
    return handleAuth({
      login: customLogin,
      callback: customCallback,
      logout: customLogout
    })(req, context);
  } catch (error) {
    console.error('Auth0 route error:', error);
    return NextResponse.json(
      { error: 'Authentication error', details: error.message },
      { status: 500 }
    );
  }
};

// Support POST method for certain Auth0 operations
export const POST = GET;