// Production Security Configuration
// Update this file with your deployment domain and security settings

export const SECURITY_CONFIG = {
  // Replace with your production domain
  PRODUCTION_DOMAIN: 'yourdomain.com',
  PRODUCTION_URL: 'https://yourdomain.com',
  
  // Database connection for Vercel serverless
  DATABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  
  // CORS allowed origins
  ALLOWED_ORIGINS: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://business.yourdomain.com',
    'https://*.vercel.app', // Allow all Vercel preview URLs
    'http://localhost:3000',
    'http://localhost:3001'
  ],

  // Security headers configuration
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; '),
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // API rate limiting
  RATE_LIMITING: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    BLOCK_DURATION_MS: 30 * 60 * 1000 // 30 minutes
  },

  // JWT configuration
  JWT_CONFIG: {
    ALGORITHM: 'HS256',
    EXPIRES_IN: '24h',
    ISSUER: 'business-center-system'
  }
};

// Environment-specific settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
