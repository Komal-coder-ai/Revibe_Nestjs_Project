import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { allowedOrigins } from '@/lib/allowedOrigins';

// Proxy entry used by Next.js in place of middleware. This applies CORS headers
// for API routes except when explicitly skipped (e.g. /api/customer/*).


export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const pathname = request.nextUrl.pathname;

  // Debug logging for CORS troubleshooting
  console.log('[CORS DEBUG] Incoming Origin:', origin);
  console.log('[CORS DEBUG] Pathname:', pathname);

  // Allow dynamic ngrok domains for development
  const isNgrok = origin.endsWith('.ngrok-free.app') || origin.endsWith('.ngrok.app');
  const isAllowed = allowedOrigins.includes(origin) || isNgrok;

  const response = NextResponse.next();

  if (origin && isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    // Enable credentials for cookies/auth
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    console.log('[CORS DEBUG] Allow-Origin set:', origin);
  } else {
    console.log('[CORS DEBUG] Origin not allowed:', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, accessToken, refreshToken , accessToken');

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
