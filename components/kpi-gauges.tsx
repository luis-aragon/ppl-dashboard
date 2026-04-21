'use client'

import type { KpiData } from '@/types/api'

function Gauge({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-zinc-900">{value.toLocaleString()}</span>
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-zinc-400">{pct.toFixed(1)}%</span>
    </div>
  )
}

interface Props { data: KpiData | null; isLoading: boolean }

export function KpiGauges({ data, isLoading }: Props) {
  if (isLoading) return <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-zinc-100" />)}
  </div>

  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Leads</span>
        <span className="text-2xl font-bold text-zinc-900">{data.total_leads.toLocaleString()}</span>
        <div className="h-1.5 w-full rounded-full bg-zinc-100" />
        <span className="text-xs text-zinc-400">100%</span>
      </div>
      <Gauge label="Accepted"    value={data.accepted}         pct={data.accepted_pct}         color="bg-emerald-500" />
      <Gauge label="Duplicate"   value={data.duplicate}        pct={data.duplicate_pct}        color="bg-amber-400"   />
      <Gauge label="Rejected"    value={data.rejected}         pct={data.rejected_pct}         color="bg-red-400"     />
      <Gauge label="Error"       value={data.error}            pct={data.error_pct}            color="bg-zinc-400"    />
      <Gauge label="Sold"        value={data.sold}             pct={data.sold_pct}             color="bg-blue-500"    />
    </div>
  )
}
