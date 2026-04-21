'use client'

import type { FinancialData } from '@/types/api'

function fmt(n: number, currency = false) {
  if (currency) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-zinc-900">{value}</span>
      {sub && <span className="text-xs text-zinc-400">{sub}</span>}
    </div>
  )
}

interface Props { data: FinancialData | null; isLoading: boolean }

export function FinancialScorecards({ data, isLoading }: Props) {
  if (isLoading) return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-zinc-100" />)}
  </div>

  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card label="Revenue"       value={fmt(data.total_revenue, true)} />
      <Card label="Cost"          value={fmt(data.total_cost, true)} />
      <Card label="Gross Profit"  value={fmt(data.gross_profit, true)} sub={`${data.profit_rate.toFixed(1)}% margin`} />
      <Card label="CPA"           value={fmt(data.cpa, true)} sub="per accepted lead" />
      <Card label="Avg Rev / Lead" value={fmt(data.avg_revenue_per_lead, true)} />
      <Card label="Profit Rate"   value={`${data.profit_rate.toFixed(1)}%`} />
    </div>
  )
}
