import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseFilters } from '@/lib/parse-filters'
import type { ApiResponse, KpiData } from '@/types/api'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<KpiData>>> {
  const f = parseFilters(req)
  const { data, error } = await supabase.rpc('fn_dashboard_kpis', {
    p_date_from: f.dateFrom,
    p_date_to:   f.dateTo,
    p_suppliers: f.suppliers,
    p_buyers:    f.buyers,
  })

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data: (data as KpiData[])[0] ?? null, error: null })
}
