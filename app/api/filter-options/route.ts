import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import type { ApiResponse, FilterOptions } from '@/types/api'

export async function GET(): Promise<NextResponse<ApiResponse<FilterOptions>>> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response as NextResponse<ApiResponse<FilterOptions>>

  const supabase = await createClient()

  const [suppliersRes, buyersRes, dateRes, verticalsRes] = await Promise.all([
    supabase.from('partners').select('id, name').eq('partner_type', 'supplier').eq('status', 'active').order('name'),
    supabase.from('partners').select('id, name').eq('partner_type', 'buyer').eq('status', 'active').order('name'),
    supabase.rpc('fn_get_min_event_day'),
    supabase.rpc('fn_get_distinct_verticals'),
  ])

  if (suppliersRes.error) return NextResponse.json({ data: null, error: suppliersRes.error.message }, { status: 500 })
  if (buyersRes.error)    return NextResponse.json({ data: null, error: buyersRes.error.message },    { status: 500 })
  if (verticalsRes.error) return NextResponse.json({ data: null, error: verticalsRes.error.message }, { status: 500 })

  let suppliers = (suppliersRes.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))
  const buyers    = (buyersRes.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))
  const verticals = Array.from(new Set<string>((verticalsRes.data ?? []).map((r: any) => r.vertical as string).filter(Boolean)))

  // Usuarios supplier solo ven su propio supplier en los filtros
  if (auth.profile.role === 'supplier' && auth.profile.partnerId) {
    suppliers = suppliers.filter((s) => s.id === auth.profile.partnerId)
  }

  const minDate = (dateRes.data as string | null) ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const maxDate = new Date().toISOString().split('T')[0]

  return NextResponse.json({
    data: { suppliers, buyers, verticals, date_range: { min: minDate, max: maxDate } },
    error: null,
  })
}
