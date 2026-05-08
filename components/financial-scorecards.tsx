'use client'

import type { FinancialData } from '@/types/api'

function fmt(n: number | null | undefined, currency = false) {
  const v = n ?? 0
  if (currency)
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    }).format(v)
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-xl border bg-white px-4 py-4 shadow-sm ${accent ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-zinc-200'}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className={`text-2xl font-bold tabular-nums tracking-tight ${accent ? 'text-emerald-600' : 'text-zinc-900'}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-zinc-400">{sub}</span>}
    </div>
  )
}

interface Props { data: FinancialData | null; isLoading: boolean }

export function FinancialScorecards({ data, isLoading }: Props) {
  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white px-4 py-4 shadow-sm animate-pulse">
          <div className="h-3 w-16 rounded bg-zinc-100" />
          <div className="h-7 w-24 rounded bg-zinc-100" />
          <div className="h-3 w-14 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  )

  if (!data) return null

  const profitRate = data.profit_rate ?? 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card label="Revenue"        value={fmt(data.total_revenue, true)} />
      <Card label="Cost"           value={fmt(data.total_cost, true)} />
      <Card label="Gross Profit"   value={fmt(data.gross_profit, true)} sub={`${profitRate.toFixed(1)}% margen`} accent={profitRate > 0} />
      <Card label="CPA"            value={fmt(data.cpa, true)} sub="por lead aceptado" />
      <Card label="Rev / Lead"     value={fmt(data.avg_revenue_per_lead, true)} />
      <Card label="Profit Rate"    value={`${profitRate.toFixed(1)}%`} accent={profitRate > 20} />
    </div>
  )
}
