'use client'

import { useState } from 'react'
import { useSuppliers } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'
import type { SupplierRow } from '@/types/api'

const COLS: { key: keyof SupplierRow; label: string; fmt?: (v: number) => string }[] = [
  { key: 'supplier_name',  label: 'Supplier' },
  { key: 'total_leads',    label: 'Leads',     fmt: (v) => v.toLocaleString() },
  { key: 'accepted',       label: 'Accepted',  fmt: (v) => v.toLocaleString() },
  { key: 'accepted_pct',   label: 'Acc%',      fmt: (v) => `${v.toFixed(1)}%` },
  { key: 'rejected',       label: 'Rejected',  fmt: (v) => v.toLocaleString() },
  { key: 'duplicate',      label: 'Dupes',     fmt: (v) => v.toLocaleString() },
  { key: 'sold',           label: 'Sold',      fmt: (v) => v.toLocaleString() },
  { key: 'revenue',        label: 'Revenue',   fmt: (v) => `$${v.toLocaleString()}` },
  { key: 'cost',           label: 'Cost',      fmt: (v) => `$${v.toLocaleString()}` },
  { key: 'profit',         label: 'Profit',    fmt: (v) => `$${v.toLocaleString()}` },
  { key: 'profit_rate',    label: 'Margin',    fmt: (v) => `${v.toFixed(1)}%` },
  { key: 'cpa',            label: 'CPA',       fmt: (v) => `$${v.toFixed(2)}` },
]

interface Props { filters: Filters }

export function SupplierTable({ filters }: Props) {
  const [sortBy, setSortBy]   = useState<string>('total_leads')
  const [sortDir, setSortDir] = useState<string>('desc')
  const [page, setPage]       = useState(1)

  const { data, isLoading } = useSuppliers(filters, sortBy, sortDir, page)

  function handleSort(key: string) {
    if (sortBy === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortBy(key); setSortDir('desc') }
    setPage(1)
  }

  if (isLoading) return <div className="h-48 rounded-xl bg-zinc-100 animate-pulse" />

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const pageSize = data?.page_size ?? 20
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-700">Supplier Ranking</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'supplier_name' && handleSort(col.key)}
                  className={`px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap ${col.key !== 'supplier_name' ? 'cursor-pointer hover:text-zinc-900 select-none' : ''}`}
                >
                  {col.label}
                  {sortBy === col.key && (sortDir === 'desc' ? ' ↓' : ' ↑')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.supplier_id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                {COLS.map((col) => {
                  const raw = row[col.key]
                  const val = col.fmt && typeof raw === 'number' ? col.fmt(raw) : String(raw ?? '-')
                  return <td key={col.key} className="px-3 py-2 text-zinc-700 whitespace-nowrap">{val}</td>
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={COLS.length} className="px-3 py-8 text-center text-zinc-400">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 text-xs text-zinc-500">
          <span>{total} suppliers</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 rounded hover:bg-zinc-100 disabled:opacity-40">Prev</button>
            <span>{page} / {pageCount}</span>
            <button disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded hover:bg-zinc-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
