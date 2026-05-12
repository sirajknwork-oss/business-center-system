// API Security Wrapper for Production
import { NextRequest, NextResponse } from "next/server";
import { SECURITY_CONFIG } from "./security-config";
import { handleAPIError } from "./errorHandler";

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowMs = SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS;
  
  let clientData = rateLimitStore.get(identifier);
  
  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(identifier, clientData);
    return { allowed: true, resetTime: clientData.resetTime };
  } else if (clientData.count >= maxRequests) {
    return { 
      allowed: false, 
      resetTime: clientData.resetTime + SECURITY_CONFIG.RATE_LIMITING.BLOCK_DURATION_MS 
    };
  } else {
    clientData.count++;
    rateLimitStore.set(identifier, clientData);
    return { allowed: true, resetTime: clientData.resetTime };
  }
}

export function withSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    let clientIP = 'unknown';
    let userAgent = 'unknown';
    try {
      // Get client IP for rate limiting
      clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      userAgent = req.headers.get('user-agent') || 'unknown';
      
      // Rate limiting check
      const rateLimit = checkRateLimit(clientIP, SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS);
      
      if (!rateLimit.allowed) {
        handleAPIError({
          message: 'Rate limit exceeded',
          statusCode: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          context: 'api-security',
          data: { clientIP, userAgent, resetTime: rateLimit.resetTime }
        }, 'rate-limiting');
        
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString()
            }
          }
        );
      }

      // Validate request size
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
        handleAPIError({
          message: 'Request too large',
          statusCode: 413,
          code: 'REQUEST_TOO_LARGE',
          context: 'api-security',
          data: { contentLength, clientIP }
        }, 'request-validation');
        
        return NextResponse.json(
          { error: 'Request entity too large' },
          { status: 413 }
        );
      }

      // Validate content type for POST/PUT
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const contentType = req.headers.get('content-type');
        const allowedTypes = ['application/json', 'multipart/form-data'];
        
        if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
          handleAPIError({
            message: 'Invalid content type',
            statusCode: 415,
            code: 'INVALID_CONTENT_TYPE',
            context: 'api-security',
            data: { contentType, method: req.method }
          }, 'content-validation');
          
          return NextResponse.json(
            { error: 'Unsupported Media Type' },
            { status: 415 }
          );
        }
      }

      // Add security headers to response
      const response = await handler(req);
      
      // Add security headers to existing response
      Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS - (rateLimitStore.get(clientIP)?.count ?? 0)).toString());
      response.headers.set('X-RateLimit-Reset', rateLimitStore.get(clientIP)?.resetTime?.toString() || '');

      return response;
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      handleAPIError({
        message: err.message || 'Internal server error',
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        context: 'api-security',
        data: { clientIP, userAgent, method: req.method, url: req.url }
      }, 'api-handler');
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Usage example:
// export async function POST(request: NextRequest) {
//   return withSecurity(async (req) => {
//     // Your API logic here
//     return NextResponse.json({ success: true });
//   })(request);
// }
