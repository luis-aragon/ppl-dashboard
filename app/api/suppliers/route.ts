import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseFilters } from '@/lib/parse-filters'
import type { ApiResponse, SuppliersData } from '@/types/api'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<SuppliersData>>> {
  const f = parseFilters(req)
  const { data, error } = await supabase.rpc('fn_dashboard_suppliers', {
    p_date_from: f.dateFrom,
    p_date_to:   f.dateTo,
    p_suppliers: f.suppliers,
    p_buyers:    f.buyers,
    p_verticals: f.verticals,
    p_sort_by:   f.sortBy,
    p_sort_dir:  f.sortDir,
    p_page:      f.page,
    p_page_size: f.pageSize,
  })

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

  const rows = data as any[]
  const total = rows[0]?.total_count ?? 0
  return NextResponse.json({
    data: { rows, total, page: f.page, page_size: f.pageSize },
    error: null,
  })
}
