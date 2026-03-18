// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface AIOXJob {
  id: string
  status: 'queued' | 'running' | 'done' | 'failed' | 'cancelled'
  agentId?: string
  squadId?: string
  message?: string
  output?: string
  error?: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  attempts?: number
}

export interface AIOXPool {
  running: number
  queued: number
  maxConcurrent: number
  workers?: Array<{ id: string; status: string; agentId?: string }>
}

export interface AIOXHealth {
  status: string
  uptime?: number
  wsClients?: number
  version?: string
}

export interface AIOXCron {
  id: string
  agentId: string
  squadId?: string
  schedule: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  description?: string
}

export interface AIOXRegistryAgent {
  id: string
  name: string
  squadId?: string
  squadType?: string
  description?: string
  commands?: string[]
  status?: string
}

export interface AIOXSquad {
  id: string
  name: string
  type?: string
  description?: string
  agentCount?: number
  agents?: AIOXRegistryAgent[]
}

export interface AIOXRegistry {
  agents: AIOXRegistryAgent[]
  squads: AIOXSquad[]
}

export interface AIOXExecuteParams {
  agentId: string
  squadId?: string
  message: string
  context?: Record<string, unknown>
  stream?: boolean
}

export interface AIOXOrchestrateParams {
  task: string
  squad?: string
  priority?: 'low' | 'normal' | 'high'
  context?: Record<string, unknown>
}

// ─── Engine URL resolution ─────────────────────────────────────────────────────

export function getEngineUrl(): string {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('aiox-settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.aiox_engine_url) return parsed.aiox_engine_url.replace(/\/$/, '')
      }
    } catch {}
  }
  const envUrl = import.meta.env.VITE_ENGINE_URL || import.meta.env.VITE_AIOX_ENGINE_URL
  return envUrl?.replace(/\/$/, '') || 'http://localhost:4002'
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getEngineUrl()}${path}`
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const aiox = {
  // Health & status
  getHealth: () => request<AIOXHealth>('/health'),
  getMetrics: () => request<AIOXMetrics>('/api/metrics'),

  // Legacy polling endpoints (kept for backwards compat)
  getEvents: (limit = 50) => request<AIOXEvent[]>(`/api/events?limit=${limit}`),
  getAgents: () => request<AIOXAgent[]>('/api/agents'),
  getAgent: (id: string) => request<AIOXAgent>(`/api/agents/${id}`),
  executeAgent: (id: string, params: Record<string, unknown> = {}) =>
    request<unknown>(`/api/agents/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params }),
    }),

  // Registry — agents & squads
  getRegistry: () => request<AIOXRegistry>('/registry'),

  // Pool management
  getPool: () => request<AIOXPool>('/pool'),
  resizePool: (max: number) =>
    request<unknown>('/pool/resize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max }),
    }),

  // Job management
  getJobs: (params?: { status?: string; squadId?: string; agentId?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.squadId) qs.set('squadId', params.squadId)
    if (params?.agentId) qs.set('agentId', params.agentId)
    if (params?.limit) qs.set('limit', String(params.limit))
    const q = qs.toString()
    return request<AIOXJob[]>(`/jobs${q ? '?' + q : ''}`)
  },
  getJob: (id: string) => request<AIOXJob>(`/jobs/${id}`),
  getJobLogs: (id: string) => request<{ logs: string[] }>(`/jobs/${id}/logs`),
  retryJob: (id: string) => request<unknown>(`/jobs/${id}/retry`, { method: 'POST' }),
  cancelJob: (id: string) =>
    request<unknown>(`/execute/status/${id}`, { method: 'DELETE' }),

  // Execution
  execute: (params: AIOXExecuteParams) =>
    request<{ jobId: string; status: string; id?: string }>('/execute/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),
  orchestrate: (params: AIOXOrchestrateParams) =>
    request<{ jobId: string; status: string; id?: string }>('/execute/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),

  // Cron
  getCrons: () => request<AIOXCron[]>('/cron'),
  toggleCron: (id: string, enabled: boolean) =>
    request<unknown>(`/cron/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    }),

  // Memory
  getMemory: (agentId?: string, squadId?: string) => {
    const qs = new URLSearchParams()
    if (agentId) qs.set('agentId', agentId)
    if (squadId) qs.set('squadId', squadId)
    return request<unknown[]>(`/memory?${qs.toString()}`)
  },

  // Authority audit
  getAuditLog: () => request<unknown[]>('/authority/audit'),
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
