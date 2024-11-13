// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const chatCookie = request.cookies.get('chat')?.value

  if (!chatCookie) {
    const response = NextResponse.next()
    response.cookies.set('chat', JSON.stringify({ messages: [] }), {
      httpOnly: true,
      path: '/',
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
