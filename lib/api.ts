export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8000/api"

export interface RegionData {
  id: number
  city: string
  risk: "High" | "Medium" | "Low"
  activeCases: number
  activeTrend: string
  patients: number
  patientsTrend: string
  history: number[]
  disease?: string
  populationDensity: number
  hospitalCapacity: number
  vaccinationRate: number
  recommendations: string[]
  lastWeekCases: number
}

export interface DashboardStats {
  totalCases: number
  totalPatients: number
  activeRegions: number
  highRisk: number
}

export interface ChartData {
  city: string
  data: { day: string; value: number }[]
}

export interface ApiResponse {
  regions: RegionData[]
  totals: DashboardStats
  topChart: ChartData[]
}

// Backward-compatible aliases for existing imports in app code.
export type DashboardResponse = ApiResponse
export type RegionOut = RegionData
export type RegionCreate = Partial<RegionData>

export async function fetchDashboardData(): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE_URL}/regions`)
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json()
}

export async function fetchWeather(city: string) {
  const res = await fetch(
    `${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`
  )
  if (!res.ok) throw new Error("Failed to fetch weather")
  return res.json()
}

export async function addOrUpdateRegion(
  data: Partial<RegionData>
): Promise<RegionData> {
  const res = await fetch(`${API_BASE_URL}/regions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to add or update region")
  return res.json()
}

export async function updateRegion(
  id: number,
  data: Partial<RegionData>
): Promise<RegionData> {
  const res = await fetch(`${API_BASE_URL}/regions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update region")
  return res.json()
}

export async function deleteRegion(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/regions/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete region")
}
