'use client'

import { useFilters } from '@/hooks/use-filters'
import { useKpis, useFinancials, useTrends, useGeo } from '@/hooks/use-dashboard'
import { FilterBar } from './filter-bar'
import { KpiGauges } from './kpi-gauges'
import { FinancialScorecards } from './financial-scorecards'
import { TrendChart } from './trend-chart'
import { SupplierTable } from './supplier-table'
import { BuyerTable } from './buyer-table'
import { GeoMap } from './geo-map'

const VERTICALS = [
  { key: 'windows',        label: 'Windows',        active: true  },
  { key: 'roofing',        label: 'Roofing',        active: true  },
  { key: 'bath',           label: 'Bath',           active: false },
  { key: 'auto_insurance', label: 'Auto Insurance', active: false },
]

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between pt-2 pb-1 border-t border-zinc-100">
      <span className="text-sm font-semibold text-zinc-700">{title}</span>
      {sub && <span className="text-xs text-zinc-400">{sub}</span>}
    </div>
  )
}

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

  const errorRate = kpisData
    ? ((kpisData.error ?? 0) / Math.max(kpisData.total_leads ?? 1, 1)) * 100
    : 0

  const activeVertical = filters.verticals[0] ?? ''

  function setVertical(key: string) {
    setFilters({ verticals: key ? [key] : [] })
  }

  return (
    <div className="space-y-4">

      {/* Vertical tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        <button
          onClick={() => setVertical('')}
          className={`px-4 py-2 text-sm rounded-t-md border border-b-0 transition-colors relative top-px select-none ${
            activeVertical === ''
              ? 'bg-white border-zinc-200 font-medium text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          All
        </button>
        {VERTICALS.map((v) => (
          <button
            key={v.key}
            disabled={!v.active}
            onClick={() => v.active && setVertical(v.key)}
            className={`px-4 py-2 text-sm rounded-t-md border border-b-0 transition-colors relative top-px select-none ${
              !v.active
                ? 'border-transparent text-zinc-300 cursor-default'
                : activeVertical === v.key
                  ? 'bg-white border-zinc-200 font-medium text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {v.label}
            {!v.active && (
              <span className="ml-1.5 text-[10px] bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded">soon</span>
            )}
          </button>
        ))}
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Alert banner */}
      {errorRate >= 80 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span>⚠️</span>
          <span><strong>Quality Alert:</strong> Global error rate is {errorRate.toFixed(1)}%. Review your top suppliers — they may account for most errors.</span>
        </div>
      )}

      <SectionHeader title="Quality KPIs" />
      <KpiGauges data={kpisData} isLoading={kpisLoading} />

      <SectionHeader title="Financial Metrics" />
      <FinancialScorecards data={financialsData} isLoading={financialsLoading} />

      <SectionHeader title="Volume & Revenue Trends" sub="Accepted, rejected, duplicates vs. revenue" />
      <TrendChart data={trendsData} isLoading={trendsLoading} />

      <SectionHeader title="Supplier & Geography" sub="Click supplier name to drill into leads" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SupplierTable filters={filters} />
        <GeoMap data={geoData} isLoading={geoLoading} />
      </div>

      <SectionHeader title="Buyer Performance" />
      <BuyerTable filters={filters} />
    </div>
  )
}
