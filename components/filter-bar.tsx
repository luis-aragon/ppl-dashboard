'use client'

import { useState } from 'react'
import { useFilterOptions } from '@/hooks/use-dashboard'
import type { Filters } from '@/hooks/use-filters'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const D90   = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const TODAY = new Date().toISOString().split('T')[0]

const DEFAULTS = {
  dateFrom:    D90,
  dateTo:      TODAY,
  suppliers:   [] as string[],
  buyers:      [] as string[],
  verticals:   [] as string[],
  granularity: 'month' as 'day' | 'week' | 'month',
}

const inputCls =
  'h-8 rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-colors'

interface Props {
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
}

export function FilterBar({ filters, setFilters }: Props) {
  const { data: options } = useFilterOptions()

  const [draft, setDraft] = useState({
    dateFrom:    filters.dateFrom,
    dateTo:      filters.dateTo,
    buyers:      filters.buyers,
    suppliers:   filters.suppliers,
    granularity: filters.granularity,
  })

  function patch<K extends keyof typeof draft>(key: K, val: (typeof draft)[K]) {
    setDraft((d) => ({ ...d, [key]: val }))
  }

  const isDirty =
    draft.dateFrom    !== filters.dateFrom    ||
    draft.dateTo      !== filters.dateTo      ||
    draft.granularity !== filters.granularity ||
    draft.buyers[0]   !== filters.buyers[0]   ||
    draft.suppliers[0] !== filters.suppliers[0]

  function apply() {
    if (!DATE_RE.test(draft.dateFrom) || !DATE_RE.test(draft.dateTo)) return
    setFilters(draft)
  }

  function reset() {
    setDraft(DEFAULTS)
    setFilters(DEFAULTS)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      {/* Date range */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">From</label>
        <input
          type="date"
          value={draft.dateFrom}
          onChange={(e) => patch('dateFrom', e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">To</label>
        <input
          type="date"
          value={draft.dateTo}
          onChange={(e) => patch('dateTo', e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-zinc-200" />

      {/* Buyer */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Buyer</label>
        <select
          value={draft.buyers[0] ?? ''}
          onChange={(e) => patch('buyers', e.target.value ? [e.target.value] : [])}
          className={inputCls}
        >
          <option value="">All</option>
          {(options?.buyers ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Supplier */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">
          Supplier{draft.suppliers.length > 0 && ` (${draft.suppliers.length})`}
        </label>
        <select
          value={draft.suppliers[0] ?? ''}
          onChange={(e) => patch('suppliers', e.target.value ? [e.target.value] : [])}
          className={inputCls}
        >
          <option value="">All</option>
          {(options?.suppliers ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Granularity */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Group By</label>
        <div className="flex h-8 overflow-hidden rounded-md border border-zinc-200 bg-white text-sm">
          {(['day', 'week', 'month'] as const).map((g) => (
            <button
              key={g}
              onClick={() => patch('granularity', g)}
              className={`px-3 capitalize transition-colors ${
                draft.granularity === g
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {g === 'day' ? 'Day' : g === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={reset}
          className="h-8 rounded-md px-3 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          Reset
        </button>
        <button
          onClick={apply}
          className={`relative h-8 rounded-md px-4 text-xs font-medium transition-colors ${
            isDirty
              ? 'bg-zinc-900 text-white hover:bg-zinc-700'
              : 'bg-zinc-100 text-zinc-400 cursor-default'
          }`}
        >
          {isDirty && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />
          )}
          Apply
        </button>
      </div>
    </div>
  )
}
