// ============================================================
// PPL Dashboard — API Contract Types
// Shared between BFF API routes and frontend components
// ============================================================

// --- Filter params (shared across all endpoints) ---
export interface DashboardFilters {
  dateFrom: string       // ISO date string, e.g. "2024-01-01"
  dateTo: string         // ISO date string, e.g. "2024-12-31"
  suppliers?: string[]   // supplier_id array, empty = all
  buyers?: string[]      // buyer_id array, empty = all
  verticals?: string[]   // vertical array (windows, roofing), empty = all
  granularity?: 'day' | 'week' | 'month'
}

// --- KPI Gauges (/api/kpis) ---
export interface KpiData {
  total_leads: number
  accepted: number
  accepted_pct: number       // 0-100
  duplicate: number
  duplicate_pct: number
  rejected: number
  rejected_pct: number
  error: number
  error_pct: number
  sold: number
  sold_pct: number           // sold / accepted * 100
  appointment_set: number
  appointment_set_pct: number
}

// --- Financial Scorecards (/api/financials) ---
export interface FinancialData {
  total_revenue: number
  total_cost: number
  gross_profit: number
  profit_rate: number        // gross_profit / total_revenue * 100
  cpa: number                // total_cost / accepted (cost per accepted lead)
  avg_revenue_per_lead: number
}

// --- Trend Chart (/api/trends) ---
export interface TrendPoint {
  period: string             // e.g. "2024-01" for month, "2024-01-15" for day
  total_leads: number
  accepted: number
  rejected: number
  duplicate: number
  revenue: number
  cost: number
}

export type TrendData = TrendPoint[]

// --- Supplier Ranking Table (/api/suppliers) ---
export interface SupplierRow {
  supplier_id: string
  supplier_name: string
  total_leads: number
  accepted: number
  accepted_pct: number
  rejected: number
  duplicate: number
  sold: number
  revenue: number
  cost: number
  profit: number
  profit_rate: number
  cpa: number
}

export interface SuppliersData {
  rows: SupplierRow[]
  total: number
  page: number
  page_size: number
}

// --- Geo Distribution (/api/geo) ---
export interface GeoRow {
  state: string              // US state abbreviation, e.g. "CA"
  state_name: string
  total_leads: number
  accepted: number
  revenue: number
}

export type GeoData = GeoRow[]

// --- Filter Options (/api/filter-options) ---
export interface FilterOptions {
  suppliers: { id: string; name: string }[]
  buyers: { id: string; name: string }[]
  verticals: string[]
  date_range: { min: string; max: string }
}

// --- Generic API response wrapper ---
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
