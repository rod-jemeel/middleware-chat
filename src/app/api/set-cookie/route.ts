// src/app/api/set-cookie/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const { name, value } = await req.json()

  // Set a cookie named 'chat' with a value
  await cookieStore.set(name, value, {
    httpOnly: true,
    path: '/',
  })

  return NextResponse.json({ message: 'Cookie set successfully' })
}
