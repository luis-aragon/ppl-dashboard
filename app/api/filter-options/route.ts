import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { ApiResponse, FilterOptions } from '@/types/api'

export async function GET(): Promise<NextResponse<ApiResponse<FilterOptions>>> {
  const [suppliersRes, buyersRes, dateRes, verticalsRes] = await Promise.all([
    supabase
      .from('partners')
      .select('id, name')
      .eq('partner_type', 'supplier')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('partners')
      .select('id, name')
      .eq('partner_type', 'buyer')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('lead_facts')
      .select('event_day')
      .order('event_day', { ascending: true })
      .limit(1),
    supabase
      .from('vw_internal_lead_report')
      .select('vertical')
      .not('vertical', 'is', null)
      .order('vertical'),
  ])

  if (suppliersRes.error) return NextResponse.json({ data: null, error: suppliersRes.error.message }, { status: 500 })
  if (buyersRes.error)    return NextResponse.json({ data: null, error: buyersRes.error.message },    { status: 500 })

  const suppliers = (suppliersRes.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))
  const buyers    = (buyersRes.data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))
  const verticals = Array.from(new Set((verticalsRes.data ?? []).map((r) => r.vertical as string).filter(Boolean)))

  const minDate = dateRes.data?.[0]?.event_day ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const maxDate = new Date().toISOString().split('T')[0]

  return NextResponse.json({
    data: { suppliers, buyers, verticals, date_range: { min: minDate, max: maxDate } },
    error: null,
  })
}
