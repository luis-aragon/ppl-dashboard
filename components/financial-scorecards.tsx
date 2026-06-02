'use client'

import type { FinancialData } from '@/types/api'

function fmtUsd(n: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n ?? 0)
}
function fmtUsdFull(n: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n ?? 0)
}

function Card({
  icon, label, value, sub, subColor,
}: {
  icon: string
  label: string
  value: string
  sub?: string
  subColor?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-lg">{icon}</div>
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900">{value}</span>
      {sub && <span className={`text-xs ${subColor ?? 'text-zinc-400'}`}>{sub}</span>}
    </div>
  )
}

interface Props { data: FinancialData | null; isLoading: boolean }

export function FinancialScorecards({ data, isLoading }: Props) {
  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white px-4 py-4 shadow-sm animate-pulse">
          <div className="h-5 w-5 rounded bg-zinc-100" />
          <div className="h-3 w-16 rounded bg-zinc-100" />
          <div className="h-7 w-24 rounded bg-zinc-100" />
          <div className="h-3 w-14 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  )

  if (!data) return null

  const profitRate = data.profit_rate ?? 0
  const profit     = data.gross_profit ?? 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card
        icon="💰"
        label="Revenue"
        value={fmtUsdFull(data.total_revenue)}
        sub="Total LP revenue"
      />
      <Card
        icon="📤"
        label="Cost"
        value={fmtUsdFull(data.total_cost)}
        sub="Lead acquisition cost"
      />
      <Card
        icon="📈"
        label="Gross Profit"
        value={fmtUsdFull(profit)}
        sub={`${profitRate.toFixed(1)}% margin`}
        subColor={profitRate > 0 ? 'text-[#639922] font-medium' : 'text-[#E24B4A] font-medium'}
      />
      <Card
        icon="💵"
        label="Avg CPA"
        value={fmtUsd(data.cpa)}
        sub="Per accepted lead"
      />
      <Card
        icon="🎯"
        label="Rev / Lead"
        value={fmtUsd(data.avg_revenue_per_lead)}
        sub="Avg revenue per lead"
      />
      <Card
        icon="%"
        label="Profit Rate"
        value={`${profitRate.toFixed(1)}%`}
        sub="Profit / Revenue"
        subColor={
          profitRate >= 20 ? 'text-[#639922] font-medium'
          : profitRate >= 0 ? 'text-[#EF9F27] font-medium'
          : 'text-[#E24B4A] font-medium'
        }
      />
    </div>
  )
}
