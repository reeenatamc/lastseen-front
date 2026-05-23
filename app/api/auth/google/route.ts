import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    const BASE = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'Google login failed' },
        { status: response.status }
      )
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
