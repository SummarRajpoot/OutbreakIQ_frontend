const HF_BACKEND = "https://ranasummar0-outbreakiq.hf.space"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : `${HF_BACKEND}/api`

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

export interface AlertSummary {
  counts: {
    critical: number
    warning: number
    watch: number
    normal: number
  }
  highest_severity: string
  total_active_alerts: number
}

export interface Alert {
  id: number
  city: string
  severity: "critical" | "warning" | "watch" | "normal"
  color: string
  message: string
  active_cases: number
  timestamp: string
  acknowledged: boolean
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
    `${API_BASE_URL}/weather/${encodeURIComponent(city)}`
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

export async function fetchAlertsSummary(): Promise<AlertSummary> {
  const res = await fetch(`${API_BASE_URL}/alerts/summary`)
  if (!res.ok) throw new Error("Failed to fetch alerts summary")
  return res.json()
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_BASE_URL}/alerts/`)
  if (!res.ok) throw new Error("Failed to fetch alerts")
  return res.json()
}

export async function acknowledgeAlert(city: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/alerts/acknowledge/${encodeURIComponent(city)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Failed to acknowledge alert")
}

export async function fetchHospitalCities(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/hospitals/cities`)
  if (!res.ok) throw new Error("Failed to fetch hospital cities")
  return res.json()
}

export async function fetchHospitalDiseases(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/hospitals/diseases`)
  if (!res.ok) throw new Error("Failed to fetch hospital diseases")
  return res.json()
}

export async function fetchHospitals(params?: {
  city?: string
  disease?: string
}): Promise<unknown[]> {
  const query = new URLSearchParams()
  if (params?.city) query.append("city", params.city)
  if (params?.disease) query.append("disease", params.disease)

  const suffix = query.toString() ? `?${query.toString()}` : ""
  const res = await fetch(`${API_BASE_URL}/hospitals/${suffix}`)
  if (!res.ok) throw new Error("Failed to fetch hospitals")
  return res.json()
}

export async function sendChatMessage(message: string, city?: string): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE_URL}/chatbot/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, city }),
  })
  if (!res.ok) throw new Error("Chatbot request failed")
  return res.json()
}
