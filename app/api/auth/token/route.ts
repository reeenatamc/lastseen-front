import { NextRequest, NextResponse } from 'next/server'

// The token reaches client JavaScript by current design; moving to a server-side proxy is pending.
export async function GET(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin') {
    return NextResponse.json({ token: null }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  const token = request.cookies.get('auth_token')?.value ?? null
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } })
}
