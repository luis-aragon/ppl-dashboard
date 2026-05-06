import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  return NextResponse.json({ data: auth.profile, error: null })
}
