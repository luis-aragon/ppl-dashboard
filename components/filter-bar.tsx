'use client'

import { useState } from 'react'
import { useFilterOptions } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

interface Props {
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
}

export function FilterBar({ filters, setFilters }: Props) {
  const { data: options } = useFilterOptions()

  // Local state so the input feels responsive while typing
  const [localFrom, setLocalFrom] = useState(filters.dateFrom)
  const [localTo,   setLocalTo]   = useState(filters.dateTo)

  function commitFrom(val: string) {
    setLocalFrom(val)
    if (DATE_RE.test(val)) setFilters({ dateFrom: val })
  }

  function commitTo(val: string) {
    setLocalTo(val)
    if (DATE_RE.test(val)) setFilters({ dateTo: val })
  }

  return (
    <div className="flex flex-wrap gap-3 items-end rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      {/* Date range */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">From</label>
        <input
          type="date"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          onBlur={(e)   => commitFrom(e.target.value)}
          className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">To</label>
        <input
          type="date"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
          onBlur={(e)   => commitTo(e.target.value)}
          className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* Buyers */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Buyer</label>
        <select
          multiple={false}
          value={filters.buyers[0] ?? ''}
          onChange={(e) => setFilters({ buyers: e.target.value ? [e.target.value] : [] })}
          className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="">All buyers</option>
          {(options?.buyers ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Suppliers multi-select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">
          Suppliers{filters.suppliers.length > 0 && ` (${filters.suppliers.length})`}
        </label>
        <select
          multiple
          size={1}
          value={filters.suppliers}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            setFilters({ suppliers: selected })
          }}
          className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          {(options?.suppliers ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Granularity */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Granularity</label>
        <div className="flex h-8 overflow-hidden rounded-md border border-zinc-200 bg-white text-sm">
          {(['day', 'week', 'month'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilters({ granularity: g })}
              className={`px-3 capitalize transition-colors ${
                filters.granularity === g
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(filters.suppliers.length > 0 || filters.buyers.length > 0) && (
        <button
          onClick={() => setFilters({ suppliers: [], buyers: [] })}
          className="ml-auto h-8 rounded-md px-3 text-sm text-zinc-500 hover:bg-zinc-100"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
