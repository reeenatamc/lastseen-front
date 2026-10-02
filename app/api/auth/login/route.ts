import { NextRequest, NextResponse } from 'next/server'
import { authErrorFromStatus } from '@/lib/auth-errors'
import { rejectCrossOrigin } from '@/lib/server/guards'
import { setSessionCookie } from '@/lib/server/session'

export async function POST(request: NextRequest) {
  const blocked = rejectCrossOrigin(request)
  if (blocked) return blocked

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

    if (!response.ok) {
      return NextResponse.json({ code: authErrorFromStatus(response.status) }, { status: response.status })
    }

    const data = await response.json()
    const res = NextResponse.json({ success: true })
    setSessionCookie(res, data.access_token)
    return res
  } catch (e) {
    // Log the error kind only: never emails or request bodies
    console.error('[/api/auth/login] request failed:', e instanceof Error ? e.name : 'unknown')
    return NextResponse.json({ code: 'network' }, { status: 502 })
  }
}
