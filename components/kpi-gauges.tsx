'use client'

import type { KpiData } from '@/types/api'

function Gauge({
  label, value, pct, color, textColor,
}: {
  label: string
  value: number | null
  pct: number | null
  color: string
  textColor: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className={`text-2xl font-bold tabular-nums tracking-tight ${textColor}`}>
        {(value ?? 0).toLocaleString()}
      </span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
      </div>
      <span className="text-xs tabular-nums text-zinc-400">{(pct ?? 0).toFixed(1)}%</span>
    </div>
  )
}

interface Props { data: KpiData | null; isLoading: boolean }

export function KpiGauges({ data, isLoading }: Props) {
  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white px-4 py-4 shadow-sm animate-pulse">
          <div className="h-3 w-16 rounded bg-zinc-100" />
          <div className="h-7 w-20 rounded bg-zinc-100" />
          <div className="h-1 w-full rounded-full bg-zinc-100" />
          <div className="h-3 w-10 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  )

  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total */}
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total Leads</span>
        <span className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
          {(data.total_leads ?? 0).toLocaleString()}
        </span>
        <div className="h-1 w-full rounded-full bg-zinc-100" />
        <span className="text-xs text-zinc-400">100%</span>
      </div>
      <Gauge label="Accepted"  value={data.accepted}  pct={data.accepted_pct}  color="bg-emerald-500" textColor="text-emerald-600" />
      <Gauge label="Duplicate" value={data.duplicate} pct={data.duplicate_pct} color="bg-amber-400"   textColor="text-amber-600"   />
      <Gauge label="Rejected"  value={data.rejected}  pct={data.rejected_pct}  color="bg-red-400"    textColor="text-red-500"     />
      <Gauge label="Error"     value={data.error}     pct={data.error_pct}     color="bg-zinc-400"   textColor="text-zinc-500"    />
      <Gauge label="Sold"      value={data.sold}      pct={data.sold_pct}      color="bg-blue-500"   textColor="text-blue-600"    />
    </div>
  )
}
