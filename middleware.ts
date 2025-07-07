import { NextRequest, NextResponse } from 'next/server'

const allowed = (process.env.ALLOWED_ORIGINS ?? 'https://symfarmia.netlify.app,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && !allowed.includes(origin)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const res = NextResponse.next()
  if (origin && allowed.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Vary', 'Origin')
  }

  if (req.method === 'OPTIONS') {
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res
  }

  return res
}

export const config = {
  matcher: '/api/:path*',
}
