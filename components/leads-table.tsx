'use client'

import { useState } from 'react'
import { useLeads } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'


const STATUS_STYLES: Record<string, string> = {
  accepted:  'bg-emerald-500/10 text-emerald-700',
  rejected:  'bg-red-500/10 text-red-600',
  duplicate: 'bg-amber-500/10 text-amber-700',
  error:     'bg-zinc-100 text-zinc-500',
}

interface Props { filters: Filters }

export function LeadsTable({ filters }: Props) {
  const [sortBy,  setSortBy]  = useState('event_day')
  const [sortDir, setSortDir] = useState('desc')
  const [page,    setPage]    = useState(1)

  const { data, isLoading } = useLeads(filters, sortBy, sortDir, page)

  function handleSort(key: string) {
    if (sortBy === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortBy(key); setSortDir('desc') }
    setPage(1)
  }

  const cols = [
    { key: 'event_day',     label: 'Date' },
    { key: 'lead_id',       label: 'Lead ID' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'buyer_name',    label: 'Buyer' },
    { key: 'status_bucket', label: 'Status LP' },
    { key: 'disposition',   label: 'Disposition' },
    { key: 'price',         label: 'Revenue' },
  ] as const

  if (isLoading) return (
    <div className="flex flex-col rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-3.5 border-b border-zinc-100">
        <div className="h-4 w-28 rounded bg-zinc-100" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/80">
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-2.5">
                <div className="h-3 w-14 rounded bg-zinc-100" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-zinc-50">
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-2.5">
                  <div className={`h-3 rounded bg-zinc-100 ${c.key === 'lead_id' ? 'w-32' : 'w-16'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const rows      = data?.rows ?? []
  const total     = data?.total ?? 0
  const pageSize  = data?.page_size ?? 50
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-700">Individual Leads</h2>
        <span className="text-xs text-zinc-400">{total.toLocaleString()} leads</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              {cols.map((col) => {
                const sortable = col.key !== 'lead_id' && col.key !== 'disposition'
                return (
                  <th
                    key={col.key}
                    onClick={() => sortable && handleSort(col.key)}
                    className={`px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap select-none ${
                      sortable
                        ? 'cursor-pointer text-zinc-400 hover:text-zinc-700 transition-colors'
                        : 'text-zinc-500'
                    } ${sortBy === col.key ? 'text-zinc-700' : ''}`}
                  >
                    {col.label}
                    {sortBy === col.key && (
                      <span className="ml-1 text-zinc-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${row.lead_id}-${i}`}
                className={`border-b border-zinc-50 transition-colors hover:bg-zinc-50 ${i % 2 === 0 ? '' : 'bg-zinc-50/30'}`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-zinc-600 tabular-nums">{row.event_day}</td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-zinc-500">{row.lead_id}</td>
                <td className="px-3 py-2 whitespace-nowrap text-zinc-700 font-medium">{row.supplier_name ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-zinc-600">{row.buyer_name ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[row.status_bucket] ?? 'bg-zinc-100 text-zinc-500'}`}>
                    {row.status_bucket}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-zinc-500 text-xs">{row.disposition ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums text-zinc-600">
                  {row.price > 0 ? `$${Number(row.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length} className="px-3 py-12 text-center text-zinc-400 text-sm">
                  No leads in the selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-500">
          <span>Page {page} of {pageCount}</span>
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
