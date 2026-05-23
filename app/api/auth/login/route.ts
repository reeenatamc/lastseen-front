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
  } catch (e) {
    // The most common cause of an unexpected throw here is the backend being
    // unreachable (docker stack down). Surface that explicitly so the user
    // gets a useful error instead of a silent "Internal server error" that
    // looks identical to the wrong-credentials case and triggers an apparent
    // re-auth loop on the /upload page.
    console.error('[/api/auth/login] forwarding to backend failed:', e)
    if (e instanceof TypeError && /fetch failed/i.test(e.message)) {
      return NextResponse.json(
        { error: 'No se puede conectar con el backend. ¿Está corriendo `docker compose up`?' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
