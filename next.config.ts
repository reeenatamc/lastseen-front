import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production'

function apiOrigin(): string | null {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : null
  } catch {
    return null
  }
}

const GOOGLE = 'https://accounts.google.com'

const cspDirectives: Array<[string, string[]]> = [
  ['default-src', ["'self'"]],
  ['frame-ancestors', ["'none'"]],
  ['base-uri', ["'self'"]],
  ['object-src', ["'none'"]],
  ['form-action', ["'self'"]],
  ['script-src', ["'self'", "'unsafe-inline'", GOOGLE, ...(isDev ? ["'unsafe-eval'"] : [])]],
  ['style-src', ["'self'", "'unsafe-inline'", GOOGLE]],
  ['img-src', ["'self'", 'data:', 'blob:', 'https://*.googleusercontent.com']],
  ['font-src', ["'self'", 'data:']],
  ['connect-src', ["'self'", ...(apiOrigin() ? [apiOrigin() as string] : []), GOOGLE]],
  ['frame-src', [GOOGLE]],
]

const csp = cspDirectives.map(([name, values]) => `${name} ${values.join(' ')}`).join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Every route except the guest result page, which must not leak the task id
        source: '/:path((?!.*upload/result).*)',
        headers: [...securityHeaders, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }],
      },
      {
        source: '/:locale/upload/result',
        headers: [...securityHeaders, { key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ]
  },
};

export default withNextIntl(nextConfig);
