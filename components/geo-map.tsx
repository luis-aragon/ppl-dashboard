'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { GeoData } from '@/types/api'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// FIPS → state abbreviation lookup (only what we need)
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
  if (isLoading) return <div className="h-72 rounded-xl bg-zinc-100 animate-pulse" />

  const byState = Object.fromEntries((data ?? []).map((r) => [r.state, r]))
  const maxLeads = Math.max(1, ...(data ?? []).map((r) => r.total_leads))

  function fill(stateAbbr: string) {
    const row = byState[stateAbbr]
    if (!row) return '#f4f4f5'
    const intensity = row.total_leads / maxLeads
    const lightness = Math.round(90 - intensity * 55)
    return `hsl(221, 83%, ${lightness}%)`
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-zinc-700">Geographic Distribution</h2>
      <ComposableMap projection="geoAlbersUsa" className="w-full max-h-64">
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
                  style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#fbbf24' }, pressed: { outline: 'none' } }}
                  data-tooltip-id="geo-tip"
                  data-tooltip-content={row ? `${abbr}: ${row.total_leads} leads, $${row.revenue.toLocaleString()}` : abbr}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}
