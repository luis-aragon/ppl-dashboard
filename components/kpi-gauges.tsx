'use client'

import type { KpiData } from '@/types/api'

function acceptanceColor(pct: number) {
  if (pct > 6)  return { bar: 'bg-[#639922]', text: 'text-[#639922]', bg: 'bg-[#EAF3DE]' }
  if (pct > 2)  return { bar: 'bg-[#EF9F27]', text: 'text-[#EF9F27]', bg: 'bg-[#FAEEDA]' }
  return           { bar: 'bg-[#E24B4A]', text: 'text-[#E24B4A]', bg: 'bg-[#FCEBEB]' }
}

function Gauge({
  label, value, pct, barColor, textColor,
}: {
  label: string
  value: number | null
  pct: number | null
  barColor: string
  textColor: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className={`text-2xl font-bold tabular-nums tracking-tight ${textColor}`}>
        {(value ?? 0).toLocaleString()}
      </span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
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

  const acceptPct = data.accepted_pct ?? 0
  const accColors = acceptanceColor(acceptPct)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total — neutral */}
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total Leads</span>
        <span className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
          {(data.total_leads ?? 0).toLocaleString()}
        </span>
        <div className="h-1 w-full rounded-full bg-zinc-100" />
        <span className="text-xs text-zinc-400">100%</span>
      </div>

      {/* Accepted — quality-aware color */}
      <div className={`flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm`}>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Accepted</span>
        <span className={`text-2xl font-bold tabular-nums tracking-tight ${accColors.text}`}>
          {(data.accepted ?? 0).toLocaleString()}
        </span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className={`h-full rounded-full transition-all ${accColors.bar}`} style={{ width: `${Math.min(acceptPct, 100)}%` }} />
        </div>
        <span className={`text-xs tabular-nums font-medium ${accColors.text}`}>{acceptPct.toFixed(1)}%</span>
      </div>

      <Gauge label="Duplicate" value={data.duplicate} pct={data.duplicate_pct} barColor="bg-[#EF9F27]" textColor="text-[#EF9F27]" />
      <Gauge label="Rejected"  value={data.rejected}  pct={data.rejected_pct}  barColor="bg-[#E24B4A]" textColor="text-[#E24B4A]" />
      <Gauge label="Error"     value={data.error}     pct={data.error_pct}     barColor="bg-zinc-400"   textColor="text-zinc-500"   />
      <Gauge label="Sold"      value={data.sold}      pct={data.sold_pct}      barColor="bg-[#378ADD]"  textColor="text-[#185FA5]"  />
    </div>
  )
}
