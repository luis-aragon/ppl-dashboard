'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { TrendData } from '@/types/api'

interface Props { data: TrendData | null; isLoading: boolean }

export function TrendChart({ data, isLoading }: Props) {
  if (isLoading) return (
    <div className="rounded-xl border border-zinc-100 bg-white px-5 py-4 shadow-sm animate-pulse">
      <div className="mb-4 flex flex-col gap-1.5">
        <div className="h-4 w-40 rounded bg-zinc-100" />
        <div className="h-3 w-64 rounded bg-zinc-100" />
      </div>
      <div className="flex items-end gap-1.5 h-52 px-2">
        {[60,80,45,90,55,70,85,40,75,65,88,50,72,38,95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-zinc-100" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )

  if (!data || data.length === 0) return (
    <div className="flex h-72 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-400">
      Sin datos de tendencia
    </div>
  )

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-700">Volumen y Revenue</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Leads aceptados, rechazados y duplicados vs. ingresos</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${((v ?? 0) / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : 0
              if (name === 'revenue') return [`$${n.toLocaleString()}`, 'Revenue']
              return [n.toLocaleString(), name]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
          <Bar  yAxisId="left"  dataKey="accepted"  name="Accepted"  fill="#10b981" radius={[3,3,0,0]} maxBarSize={32} />
          <Bar  yAxisId="left"  dataKey="rejected"  name="Rejected"  fill="#f87171" radius={[3,3,0,0]} maxBarSize={32} />
          <Bar  yAxisId="left"  dataKey="duplicate" name="Duplicate" fill="#fbbf24" radius={[3,3,0,0]} maxBarSize={32} />
          <Line yAxisId="right" dataKey="revenue"   name="Revenue"   stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
