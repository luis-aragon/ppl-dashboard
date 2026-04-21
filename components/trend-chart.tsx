'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendData } from '@/types/api'

interface Props { data: TrendData | null; isLoading: boolean }

export function TrendChart({ data, isLoading }: Props) {
  if (isLoading) return <div className="h-64 rounded-xl bg-zinc-100 animate-pulse" />
  if (!data || data.length === 0) return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-400">
      No trend data
    </div>
  )

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700">Lead Volume &amp; Revenue Over Time</h2>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value, name) => {
            const n = typeof value === 'number' ? value : 0
            if (name === 'revenue') return [`$${n.toLocaleString()}`, 'Revenue']
            return [n.toLocaleString(), name]
          }} />
          <Legend />
          <Bar  yAxisId="left"  dataKey="accepted"  name="Accepted"  fill="#10b981" radius={[2,2,0,0]} />
          <Bar  yAxisId="left"  dataKey="rejected"  name="Rejected"  fill="#f87171" radius={[2,2,0,0]} />
          <Bar  yAxisId="left"  dataKey="duplicate" name="Duplicate" fill="#fbbf24" radius={[2,2,0,0]} />
          <Line yAxisId="right" dataKey="revenue"   name="revenue"   stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
