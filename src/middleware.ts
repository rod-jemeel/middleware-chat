// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const cookieStore = cookies(request)
  const chatCookie = await cookieStore.get('chat')?.value

  // Log the existing chat cookie
  console.log('Existing chat cookie:', chatCookie)

  // If the chat cookie does not exist, set a new one
  if (!chatCookie) {
    const response = NextResponse.next()
    const newCookieValue = JSON.stringify({ messages: [] })
    console.log('Setting new chat cookie:', newCookieValue)
    response.cookies.set('chat', newCookieValue, {
      httpOnly: true,
      path: '/',
    })
    return response
  }

  // Log the response headers
  const response = NextResponse.next()
  console.log('Response headers:', response.headers)

  return response
}

// Match all API routes
export const config = {
  matcher: '/api/:path*',
}
