import { NextRequest, NextResponse } from 'next/server'
import { authErrorFromStatus } from '@/lib/auth-errors'
import { rejectCrossOrigin } from '@/lib/server/guards'
import { setSessionCookie } from '@/lib/server/session'

export async function POST(request: NextRequest) {
  const blocked = rejectCrossOrigin(request)
  if (blocked) return blocked

  try {
    const { credential } = await request.json()

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json({ code: 'invalid_credentials' }, { status: 400 })
    }

    const BASE = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (!response.ok) {
      return NextResponse.json({ code: authErrorFromStatus(response.status) }, { status: response.status })
    }

    const data = await response.json()
    const res = NextResponse.json({ success: true })
    setSessionCookie(res, data.access_token)
    return res
  } catch (e) {
    console.error('[/api/auth/google] request failed:', e instanceof Error ? e.name : 'unknown')
    return NextResponse.json({ code: 'network' }, { status: 502 })
  }
}
