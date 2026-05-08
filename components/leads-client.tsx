'use client'

import { useFilters } from '@/hooks/use-filters'
import { FilterBar } from './filter-bar'
import { LeadsTable } from './leads-table'

export function LeadsClient() {
  const [filters, setFilters] = useFilters()

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} setFilters={setFilters} />
      <LeadsTable filters={filters} />
    </div>
  )
}
