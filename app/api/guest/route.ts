import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'ls_guest'
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days

/** GET — returns the guest token from the httpOnly cookie, or null */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value ?? null
  return NextResponse.json({ token })
}

/** POST — sets the httpOnly guest token cookie after a free analysis */
export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}
