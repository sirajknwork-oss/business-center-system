import type { NextConfig } from "next";
import { SECURITY_CONFIG } from "./security-config";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  // Production security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: SECURITY_CONFIG.ALLOWED_ORIGINS.join(', ')
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Bootstrap-Secret, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: SECURITY_CONFIG.SECURITY_HEADERS['X-Content-Type-Options']
          },
          {
            key: 'X-Frame-Options',
            value: SECURITY_CONFIG.SECURITY_HEADERS['X-Frame-Options']
          },
          {
            key: 'X-XSS-Protection',
            value: SECURITY_CONFIG.SECURITY_HEADERS['X-XSS-Protection']
          },
          {
            key: 'Referrer-Policy',
            value: SECURITY_CONFIG.SECURITY_HEADERS['Referrer-Policy']
          },
          {
            key: 'Content-Security-Policy',
            value: SECURITY_CONFIG.SECURITY_HEADERS['Content-Security-Policy']
          },
          {
            key: 'Permissions-Policy',
            value: SECURITY_CONFIG.SECURITY_HEADERS['Permissions-Policy']
          },
          {
            key: 'Strict-Transport-Security',
            value: SECURITY_CONFIG.SECURITY_HEADERS['Strict-Transport-Security']
          },
          {
            key: 'Server',
            value: ''
          },
          {
            key: 'X-Powered-By',
            value: ''
          }
        ]
      }
    ];
  }
};

export default nextConfig;
