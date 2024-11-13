// src/app/api/get-cookie/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const name = req.nextUrl.searchParams.get('name')
  const cookie = name ? await cookieStore.get(name) : null

  if (cookie) {
    return NextResponse.json({ name: cookie.name, value: cookie.value })
  } else {
    return NextResponse.json({ message: 'Cookie not found' }, { status: 404 })
  }
}
