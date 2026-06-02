'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { GeoData } from '@/types/api'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const FIPS: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC',
  '12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY',
  '22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT',
  '31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH',
  '40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT',
  '50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY',
}

interface Props { data: GeoData | null; isLoading: boolean }

export function GeoMap({ data, isLoading }: Props) {
  if (isLoading) return (
    <div className="flex flex-col rounded-xl border border-zinc-100 bg-white px-5 py-4 shadow-sm animate-pulse">
      <div className="mb-3 flex flex-col gap-1.5">
        <div className="h-4 w-40 rounded bg-zinc-100" />
        <div className="h-3 w-32 rounded bg-zinc-100" />
      </div>
      <div className="h-48 rounded-lg bg-zinc-100" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-3 w-8 rounded bg-zinc-100" />
            <div className="h-3 w-12 rounded bg-zinc-100" />
            <div className="h-3 w-16 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  )

  const sorted   = [...(data ?? [])].sort((a, b) => (b.total_leads ?? 0) - (a.total_leads ?? 0))
  const byState  = Object.fromEntries((data ?? []).map((r) => [r.state, r]))
  const maxLeads = Math.max(1, ...(data ?? []).map((r) => r.total_leads ?? 0))
  const topStates = sorted.slice(0, 7)

  function fill(abbr: string) {
    const row = byState[abbr]
    if (!row) return '#f4f4f5'
    const intensity = (row.total_leads ?? 0) / maxLeads
    const lightness = Math.round(90 - intensity * 55)
    return `hsl(221, 83%, ${lightness}%)`
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-zinc-700">Geographic Distribution</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Leads by state · top markets</p>
      </div>

      {(!data || data.length === 0) ? (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-zinc-400">
          No geographic data
        </div>
      ) : (
        <>
          <ComposableMap projection="geoAlbersUsa" className="w-full max-h-52">
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const abbr = FIPS[geo.id as string] ?? ''
                  const row  = byState[abbr]
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill(abbr)}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none', fill: '#fbbf24', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      data-tooltip-id="geo-tip"
                      data-tooltip-content={
                        row
                          ? `${abbr}: ${row.total_leads ?? 0} leads, $${(row.revenue ?? 0).toLocaleString()}`
                          : abbr
                      }
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Top states table */}
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['State', 'Leads', 'Revenue', 'Rate'].map((h) => (
                    <th key={h} className="pb-1.5 text-left font-medium uppercase tracking-wide text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topStates.map((g) => {
                  const rate    = g.revenue ? ((g.revenue ?? 0) / Math.max(g.total_leads ?? 1, 1)) : 0
                  const barW    = maxLeads ? ((g.total_leads ?? 0) / maxLeads) * 100 : 0
                  return (
                    <tr key={g.state} className="border-t border-zinc-50">
                      <td className="py-1.5 font-semibold text-zinc-700 w-10">{g.state}</td>
                      <td className="py-1.5 text-zinc-500">
                        <div className="flex flex-col gap-0.5">
                          <span>{(g.total_leads ?? 0).toLocaleString()}</span>
                          <div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full rounded-full bg-[#378ADD]" style={{ width: `${barW}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 text-zinc-600 font-medium">${(g.revenue ?? 0).toLocaleString()}</td>
                      <td className="py-1.5 text-zinc-400">${rate.toFixed(0)}/lead</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
