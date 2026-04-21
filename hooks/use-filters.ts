'use client'

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs'

const D90  = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const TODAY = new Date().toISOString().split('T')[0]

const filterParsers = {
  dateFrom:    parseAsString.withDefault(D90),
  dateTo:      parseAsString.withDefault(TODAY),
  suppliers:   parseAsArrayOf(parseAsString).withDefault([]),
  buyers:      parseAsArrayOf(parseAsString).withDefault([]),
  granularity: parseAsStringEnum(['day', 'week', 'month'] as const).withDefault('month'),
}

export function useFilters() {
  return useQueryStates(filterParsers, { shallow: false })
}

export type Filters = ReturnType<typeof useFilters>[0]
