import { NextResponse } from 'next/server'
import { createClient } from './supabase/server'

export interface SessionProfile {
  userId: string
  role: 'admin' | 'supplier'
  partnerId: string | null
}

export type AuthResult =
  | { ok: true; profile: SessionProfile }
  | { ok: false; response: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('dashboard_users')
    .select('role, partner_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json({ data: null, error: 'No profile found' }, { status: 403 }),
    }
  }

  return {
    ok: true,
    profile: {
      userId: user.id,
      role: profile.role as 'admin' | 'supplier',
      partnerId: profile.partner_id ?? null,
    },
  }
}
