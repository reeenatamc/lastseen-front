import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF guard for state-changing routes: rejects with 403 when an Origin header
 * is present and its host differs from the request Host.
 */
export function rejectCrossOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  if (!origin) return null
  const host = request.headers.get('host')
  try {
    if (host && new URL(origin).host === host) return null
  } catch {
    // malformed Origin falls through to rejection
  }
  return NextResponse.json({ code: 'forbidden' }, { status: 403 })
}
