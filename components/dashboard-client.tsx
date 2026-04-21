'use client'

import { useFilters } from '@/hooks/use-filters'
import { useKpis, useFinancials, useTrends, useGeo } from '@/hooks/use-dashboard'
import { FilterBar } from './filter-bar'
import { KpiGauges } from './kpi-gauges'
import { FinancialScorecards } from './financial-scorecards'
import { TrendChart } from './trend-chart'
import { SupplierTable } from './supplier-table'
import { GeoMap } from './geo-map'

export function DashboardClient() {
  const [filters, setFilters] = useFilters()

  const { data: kpis,       isLoading: kpisLoading }       = useKpis(filters)
  const { data: financials, isLoading: financialsLoading } = useFinancials(filters)
  const { data: trends,     isLoading: trendsLoading }     = useTrends(filters)
  const { data: geo,        isLoading: geoLoading }        = useGeo(filters)

  const kpisData       = kpis       ?? null
  const financialsData = financials ?? null
  const trendsData     = trends     ?? null
  const geoData        = geo        ?? null

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} setFilters={setFilters} />
      <KpiGauges data={kpisData} isLoading={kpisLoading} />
      <FinancialScorecards data={financialsData} isLoading={financialsLoading} />
      <TrendChart data={trendsData} isLoading={trendsLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SupplierTable filters={filters} />
        <GeoMap data={geoData} isLoading={geoLoading} />
      </div>
    </div>
  )
}
