import { NextRequest, NextResponse } from 'next/server'
import { rejectCrossOrigin } from '@/lib/server/guards'

export async function POST(request: NextRequest) {
  const blocked = rejectCrossOrigin(request)
  if (blocked) return blocked

  const res = NextResponse.json({ success: true })
  res.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
