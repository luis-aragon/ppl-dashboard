'use client'

import { useSearchParams } from 'next/navigation'
import { useFilters } from '@/hooks/use-filters'
import { FilterBar } from './filter-bar'
import { LeadsTable } from './leads-table'

export function LeadsClient() {
  const searchParams = useSearchParams()
  const supplierIdOverride = searchParams.get('supplier') ?? undefined

  const [filters, setFilters] = useFilters()

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} setFilters={setFilters} />
      <LeadsTable filters={filters} supplierIdOverride={supplierIdOverride} />
    </div>
  )
}
