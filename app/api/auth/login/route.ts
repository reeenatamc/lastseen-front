import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const BASE = process.env.NEXT_PUBLIC_API_URL
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const response = await fetch(`${BASE}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'Login failed' },
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
