export interface AIOXEvent {
  id: string
  timestamp: string
  type: string
  agent: string
  status: 'success' | 'error' | 'pending'
  data: Record<string, unknown>
}

export interface AIOXAgent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  lastRun?: string
}

export interface AIOXMetrics {
  uptime?: number
  totalExecutions?: number
  successRate?: number
  [key: string]: unknown
}

function getEngineUrl() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('aiox-settings') : null
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.aiox_engine_url) return parsed.aiox_engine_url.replace(/\/$/, '')
    } catch {}
  }
  return import.meta.env.VITE_AIOX_ENGINE_URL?.replace(/\/$/, '') || 'http://localhost:4002'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getEngineUrl()}${path}`
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export const aiox = {
  getEvents: (limit = 50) =>
    request<AIOXEvent[]>(`/api/events?limit=${limit}`),

  getAgents: () =>
    request<AIOXAgent[]>('/api/agents'),

  getAgent: (id: string) =>
    request<AIOXAgent>(`/api/agents/${id}`),

  executeAgent: (id: string, params: Record<string, unknown> = {}) =>
    request<unknown>(`/api/agents/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params }),
    }),

  getMetrics: () =>
    request<AIOXMetrics>('/api/metrics'),

  getHealth: () =>
    request<{ status: string }>('/api/health'),
}
