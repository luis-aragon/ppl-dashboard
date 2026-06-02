'use client'

import { useState } from 'react'
import { useFilterOptions } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const inputCls =
  'h-8 rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-colors'

interface Props {
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
}

export function FilterBar({ filters, setFilters }: Props) {
  const { data: options } = useFilterOptions()

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

  const hasActive = filters.suppliers.length > 0 || filters.buyers.length > 0

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      {/* Date range */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Desde</label>
        <input
          type="date"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          onBlur={(e) => commitFrom(e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Hasta</label>
        <input
          type="date"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
          onBlur={(e) => commitTo(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-zinc-200" />

      {/* Buyer */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Buyer</label>
        <select
          value={filters.buyers[0] ?? ''}
          onChange={(e) => setFilters({ buyers: e.target.value ? [e.target.value] : [] })}
          className={inputCls}
        >
          <option value="">Todos</option>
          {(options?.buyers ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Supplier */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">
          Supplier{filters.suppliers.length > 0 && ` (${filters.suppliers.length})`}
        </label>
        <select
          value={filters.suppliers[0] ?? ''}
          onChange={(e) => setFilters({ suppliers: e.target.value ? [e.target.value] : [] })}
          className={inputCls}
        >
          <option value="">Todos</option>
          {(options?.suppliers ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Granularity */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Agrupación</label>
        <div className="flex h-8 overflow-hidden rounded-md border border-zinc-200 bg-white text-sm">
          {(['day', 'week', 'month'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilters({ granularity: g })}
              className={`px-3 capitalize transition-colors ${
                filters.granularity === g
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {g === 'day' ? 'Día' : g === 'week' ? 'Sem' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => setFilters({ suppliers: [], buyers: [], verticals: [] })}
          className="ml-auto h-8 rounded-md px-3 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
