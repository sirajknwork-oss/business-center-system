import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security middleware for CORS and secure headers
export function middleware(request: NextRequest) {
  // Get origin from request
  const origin = request.headers.get('origin') || '';
  
  // CORS configuration for production
  const allowedOrigins = [
    'https://yourdomain.com',  // Replace with your production domain
    'https://www.yourdomain.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  // Check if origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // CORS headers
  const response = NextResponse.next();
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bootstrap-Secret, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';");
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove server information
  response.headers.set('Server', '');
  response.headers.set('X-Powered-By', '');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|_next/font|favicon.ico).*)',
  ],
};
