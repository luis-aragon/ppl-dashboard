'use client'

import { useState } from 'react'
import { useBuyers } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'
import type { BuyerRow } from '@/types/api'

function accColor(pct: number) {
  if (pct > 6) return 'text-[#639922] font-semibold'
  if (pct > 2) return 'text-[#EF9F27] font-semibold'
  return 'text-[#E24B4A] font-semibold'
}

function accBadge(pct: number) {
  if (pct > 6)  return { bg: 'bg-[#EAF3DE]', text: 'text-[#4A7A10]' }
  if (pct > 2)  return { bg: 'bg-[#FAEEDA]', text: 'text-[#854F0B]' }
  return               { bg: 'bg-[#FCEBEB]', text: 'text-[#A32D2D]' }
}

const COLS: { key: keyof BuyerRow; label: string; fmt?: (v: number) => string }[] = [
  { key: 'buyer_name',   label: 'Buyer' },
  { key: 'total_leads',  label: 'Leads',    fmt: (v) => (v ?? 0).toLocaleString() },
  { key: 'accepted',     label: 'Accepted', fmt: (v) => (v ?? 0).toLocaleString() },
  { key: 'accepted_pct', label: 'Acc%',     fmt: (v) => `${(v ?? 0).toFixed(1)}%` },
  { key: 'duplicate',    label: 'Dupes',    fmt: (v) => (v ?? 0).toLocaleString() },
  { key: 'sold',         label: 'Sold',     fmt: (v) => (v ?? 0).toLocaleString() },
  { key: 'revenue',      label: 'Revenue',  fmt: (v) => `$${(v ?? 0).toLocaleString()}` },
  { key: 'profit',       label: 'Profit',   fmt: (v) => `$${(v ?? 0).toLocaleString()}` },
  { key: 'profit_rate',  label: 'Margin',   fmt: (v) => `${(v ?? 0).toFixed(1)}%` },
  { key: 'cpa',          label: 'CPA',      fmt: (v) => `$${(v ?? 0).toFixed(2)}` },
]

interface Props { filters: Filters }

export function BuyerTable({ filters }: Props) {
  const [sortBy,  setSortBy]  = useState<string>('total_leads')
  const [sortDir, setSortDir] = useState<string>('desc')
  const [page,    setPage]    = useState(1)

  const { data, isLoading } = useBuyers(filters, sortBy, sortDir, page)

  function handleSort(key: string) {
    if (sortBy === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortBy(key); setSortDir('desc') }
    setPage(1)
  }

  if (isLoading) return (
    <div className="flex flex-col rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-3.5 border-b border-zinc-100">
        <div className="h-4 w-36 rounded bg-zinc-100" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              {COLS.map((col) => (
                <th key={col.key} className="px-3 py-2.5">
                  <div className="h-3 w-12 rounded bg-zinc-100" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-zinc-50">
                {COLS.map((col) => (
                  <td key={col.key} className="px-3 py-2.5">
                    <div className={`h-3 rounded bg-zinc-100 ${col.key === 'buyer_name' ? 'w-24' : 'w-12'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const rows      = data?.rows ?? []
  const total     = data?.total ?? 0
  const pageSize  = data?.page_size ?? 20
  const pageCount = Math.ceil(total / pageSize)
  const maxRev    = Math.max(1, ...rows.map((r) => r.revenue ?? 0))

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">Buyer Ranking</h2>
        <span className="text-xs text-zinc-400">{total} buyers</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'buyer_name' && handleSort(col.key)}
                  className={`px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap select-none ${
                    col.key !== 'buyer_name'
                      ? 'cursor-pointer text-zinc-400 hover:text-zinc-700 transition-colors'
                      : 'text-zinc-500'
                  } ${sortBy === col.key ? 'text-zinc-700' : ''}`}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span className="ml-1 text-zinc-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const accPct     = row.accepted_pct ?? 0
              const badge      = accBadge(accPct)
              const profitPos  = (row.profit ?? 0) >= 0
              const marginPos  = (row.profit_rate ?? 0) >= 0
              return (
                <tr
                  key={row.buyer_id}
                  className={`border-b border-zinc-50 transition-colors hover:bg-zinc-50 ${i % 2 === 0 ? '' : 'bg-zinc-50/30'}`}
                >
                  {COLS.map((col) => {
                    const raw = row[col.key]
                    const num = typeof raw === 'number' ? raw : (typeof raw === 'string' && raw !== '' ? parseFloat(raw) : null)
                    const val = col.fmt && num !== null && !isNaN(num) ? col.fmt(num) : String(raw ?? '—')
                    const isName      = col.key === 'buyer_name'
                    const isAccPct    = col.key === 'accepted_pct'
                    const isRevenue   = col.key === 'revenue'
                    const isProfit    = col.key === 'profit'
                    const isMargin    = col.key === 'profit_rate'
                    return (
                      <td key={col.key} className={`px-3 py-2.5 whitespace-nowrap tabular-nums ${isName ? 'font-medium text-zinc-800' : 'text-zinc-600'}`}>
                        {isName ? (
                          <div className="flex items-center gap-2">
                            <span>{val}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                              {accPct.toFixed(1)}%
                            </span>
                          </div>
                        ) : isAccPct ? (
                          <span className={accColor(accPct)}>{val}</span>
                        ) : isRevenue ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-zinc-800">{val}</span>
                            <div className="h-1 w-14 overflow-hidden rounded-full bg-zinc-100">
                              <div
                                className="h-full rounded-full bg-[#378ADD]"
                                style={{ width: `${(row.revenue ?? 0) / maxRev * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : isProfit ? (
                          <span className={profitPos ? 'text-[#639922] font-semibold' : 'text-[#E24B4A] font-semibold'}>
                            {profitPos ? '' : '-'}${Math.abs(row.profit ?? 0).toLocaleString()}
                          </span>
                        ) : isMargin ? (
                          <span className={marginPos ? 'text-[#639922]' : 'text-[#E24B4A]'}>{val}</span>
                        ) : val}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-10 text-center text-zinc-400 text-sm">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-500">
          <span>{total} buyers</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded px-2.5 py-1 transition-colors hover:bg-zinc-100 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-1">{page} / {pageCount}</span>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="rounded px-2.5 py-1 transition-colors hover:bg-zinc-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
