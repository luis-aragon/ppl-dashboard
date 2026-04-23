import { NextRequest } from 'next/server'

export interface FilterParams {
  dateFrom: string
  dateTo: string
  suppliers: string[] | null
  buyers: string[] | null
  granularity: string
  sortBy: string
  sortDir: string
  page: number
  pageSize: number
}

export function parseFilters(req: NextRequest): FilterParams {
  const { searchParams } = req.nextUrl

  const dateFrom = searchParams.get('dateFrom') ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const dateTo = searchParams.get('dateTo') ?? new Date().toISOString().split('T')[0]

  const suppliersRaw = searchParams.get('suppliers')
  const buyersRaw = searchParams.get('buyers')

  return {
    dateFrom,
    dateTo,
    suppliers: suppliersRaw ? suppliersRaw.split(',').filter(Boolean) : null,
    buyers: buyersRaw ? buyersRaw.split(',').filter(Boolean) : null,
    granularity: searchParams.get('granularity') ?? 'month',
    sortBy: searchParams.get('sortBy') ?? 'total_leads',
    sortDir: searchParams.get('sortDir') ?? 'desc',
    page: parseInt(searchParams.get('page') ?? '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') ?? '20', 10),
  }
}
