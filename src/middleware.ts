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

  // Parse the existing messages
  const parsedCookie = JSON.parse(chatCookie)
  const messages = parsedCookie.messages || []

  // Add a timestamp to each message if it doesn't already have one
  const updatedMessages = messages.map((message: any) => {
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString()
    }
    return message
  })

  // Update the cookie with the messages including timestamps
  const response = NextResponse.next()
  response.cookies.set('chat', JSON.stringify({ messages: updatedMessages }), {
    httpOnly: true,
    path: '/',
  })

  return response
}

export const config = {
  matcher: '/api/:path*',
}
