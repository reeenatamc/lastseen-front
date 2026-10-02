import type { NextResponse } from 'next/server'

const FALLBACK_MAX_AGE = 30 * 60 // seconds, used when the JWT has no readable exp

/** Seconds until the JWT expires. Payload is decoded without verifying the signature: duration only. */
export function jwtMaxAge(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    if (typeof payload.exp === 'number') {
      const left = Math.floor(payload.exp - Date.now() / 1000)
      if (left > 0) return left
    }
  } catch {
    // fall through to the default
  }
  return FALLBACK_MAX_AGE
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: jwtMaxAge(token),
  })
}
