import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow only http://localhost:3000 as origin
  const allowedOrigins = [
    'http://localhost:3000',
    'https://revibe-nestjs-project.vercel.app',
    'https://84f4ea7c0305.ngrok-free.app', '*'
  ];

  // Get the request origin
  const requestOrigin = request.headers.get('origin');

  // Allow if the origin matches exactly or starts with any allowed origin (for subpaths)
  const allowOrigin = '*';

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
