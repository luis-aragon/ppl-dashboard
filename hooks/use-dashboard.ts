'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  KpiData,
  FinancialData,
  TrendData,
  SuppliersData,
  GeoData,
  FilterOptions,
  ApiResponse,
} from '@/types/api'
import type { Filters } from './use-filters'

function qs(filters: Filters, extra?: Record<string, string>) {
  const p = new URLSearchParams({
    dateFrom: filters.dateFrom,
    dateTo:   filters.dateTo,
    ...extra,
  })
  if (filters.suppliers.length) p.set('suppliers', filters.suppliers.join(','))
  if (filters.buyers.length)    p.set('buyers',    filters.buyers.join(','))
  return p.toString()
}

async function apiFetch<T>(url: string): Promise<T | null> {
  const res = await fetch(url)
  const json: ApiResponse<T> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data
}

export function useFilterOptions() {
  return useQuery<FilterOptions | null>({
    queryKey: ['filter-options'],
    queryFn: () => apiFetch<FilterOptions>('/api/filter-options'),
    staleTime: 5 * 60_000,
  })
}

export function useKpis(filters: Filters) {
  const key = qs(filters)
  return useQuery<KpiData | null>({
    queryKey: ['kpis', key],
    queryFn: () => apiFetch<KpiData>(`/api/kpis?${key}`),
  })
}

export function useFinancials(filters: Filters) {
  const key = qs(filters)
  return useQuery<FinancialData | null>({
    queryKey: ['financials', key],
    queryFn: () => apiFetch<FinancialData>(`/api/financials?${key}`),
  })
}

export function useTrends(filters: Filters) {
  const key = qs(filters, { granularity: filters.granularity })
  return useQuery<TrendData | null>({
    queryKey: ['trends', key],
    queryFn: () => apiFetch<TrendData>(`/api/trends?${key}`),
  })
}

export function useSuppliers(filters: Filters, sortBy = 'total_leads', sortDir = 'desc', page = 1) {
  const key = qs(filters, { sortBy, sortDir, page: String(page), pageSize: '20' })
  return useQuery<SuppliersData | null>({
    queryKey: ['suppliers', key],
    queryFn: () => apiFetch<SuppliersData>(`/api/suppliers?${key}`),
  })
}

export function useGeo(filters: Filters) {
  const key = qs(filters)
  return useQuery<GeoData | null>({
    queryKey: ['geo', key],
    queryFn: () => apiFetch<GeoData>(`/api/geo?${key}`),
  })
}
