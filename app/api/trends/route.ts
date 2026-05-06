import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import { parseFilters } from '@/lib/parse-filters'
import type { ApiResponse, TrendData } from '@/types/api'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<TrendData>>> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response as NextResponse<ApiResponse<TrendData>>

  const f = parseFilters(req)
  const suppliers = auth.profile.role === 'supplier' && auth.profile.partnerId
    ? [auth.profile.partnerId]
    : f.suppliers

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('fn_dashboard_trends', {
    p_date_from:   f.dateFrom,
    p_date_to:     f.dateTo,
    p_suppliers:   suppliers,
    p_buyers:      f.buyers,
    p_verticals:   f.verticals,
    p_granularity: f.granularity,
  })

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data: data as TrendData, error: null })
}
