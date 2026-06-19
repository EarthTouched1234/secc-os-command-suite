export interface ExecutionSummary {
  id: string
  status: 'success' | 'error' | 'running' | 'waiting'
  startedAt: string
  stoppedAt: string | null
  workflowId: string
}

export interface ReportPayload {
  workflowName: string
  agentName: string
  executionId: string
  status: string
  summary: string
  domain: string
  notionPageId: string
  requiresApproval: boolean
  escalate: boolean
  timestamp: string
  missionStatus: 'ESCALATE' | 'PENDING_APPROVAL' | 'LOGGED'
  routeKey?: string
}

export interface FeedEntry extends ReportPayload {
  n8nExecutionId: string
  startedAt: string
}

export interface SystemExecution extends ExecutionSummary {
  workflowName?: string
}

// Dev: Vite proxies /n8n, /chat, /dispatch — strips prefix, adds auth headers.
// Production: CF Worker for REST API; direct n8n for public webhooks (no key needed).
const N8N = import.meta.env.PROD
  ? 'https://secc-os-n8n-proxy.earthtouched1234.workers.dev'
  : '/n8n'

// All chat/dispatch routes through Agent Sandbox — single proven endpoint, all 6 agents, CORS open.
// /webhook/horhanis-conversation kept as fallback only (HORHANiS-only, no multi-agent support).
const AGENT_SANDBOX_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/agent'
const DISPATCH_URL = '/dispatch/webhook/horhanis/dispatch' // dev only

// Map context to agent for Agent Sandbox routing
const CONTEXT_TO_AGENT: Record<string, string> = {
  LIFE:    'horhanis',
  COMMAND: 'ciro',
  WORK:    'horhanis',
  SCHOOL:  'ciro',
  CONTENT: 'tito',
}

// Fetch with timeout + 1 auto-retry on network/timeout failure.
// n8n Agent Sandbox can take 15-30s (Notion history load + GPT-4.1 + save turns).
// 55s matches just under n8n Cloud's 60s webhook limit.
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 55_000,
): Promise<Response> {
  const attempt = async (): Promise<Response> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      return res
    } finally {
      clearTimeout(timer)
    }
  }

  try {
    return await attempt()
  } catch (err) {
    // One retry after 3s on abort (timeout) or network error
    const isRetryable = err instanceof DOMException && err.name === 'AbortError'
      || err instanceof TypeError // network failure
    if (!isRetryable) throw err
    await new Promise(r => setTimeout(r, 3000))
    return attempt()
  }
}
const CC_INTAKE_WF = import.meta.env.VITE_CC_INTAKE_WORKFLOW_ID || 'OQeDlPmsb8gape73'

const WORKFLOW_NAMES: Record<string, string> = {
  gXNE0RtvUgzcZzC2: 'Voice Command Webhook',
  LiwNqXDbcezKGnFY: 'Maintenance Request Intake',
  kM9TERulHn7KAmTf: 'Incident Processing Engine',
  jU63movZ39zy20tM: 'TriO Integration',
  ewYfX1WXG4xEfQM9: 'CRM Follow-Up',
  OQeDlPmsb8gape73: 'Commander Console Intake',
}

async function get(path: string) {
  const res = await fetch(`${N8N}${path}`)
  if (!res.ok) throw new Error(`n8n API ${path}: ${res.status}`)
  return res.json()
}

const detailCache = new Map<string, ReportPayload | null>()

async function fetchExecutionDetail(id: string): Promise<ReportPayload | null> {
  if (detailCache.has(id)) return detailCache.get(id)!

  try {
    const data = await get(`/api/v1/executions/${id}?includeData=true`)
    const runData = data?.data?.resultData?.runData ?? data?.resultData?.runData
    const parsed = runData?.['Parse Payload']?.[0]?.data?.main?.[0]?.[0]?.json as ReportPayload | undefined
    const result = parsed ?? null
    detailCache.set(id, result)
    return result
  } catch {
    detailCache.set(id, null)
    return null
  }
}

export async function fetchFeed(limit = 20): Promise<FeedEntry[]> {
  const data = await get(`/api/v1/executions?workflowId=${CC_INTAKE_WF}&limit=${limit}`)
  const summaries: ExecutionSummary[] = data.data ?? []

  const entries = await Promise.all(
    summaries.map(async (ex) => {
      const detail = await fetchExecutionDetail(ex.id)
      if (!detail) return null
      return { ...detail, n8nExecutionId: ex.id, startedAt: ex.startedAt } as FeedEntry
    })
  )

  return entries.filter((e): e is FeedEntry => e !== null)
}

export async function fetchSystemExecutions(limit = 30): Promise<SystemExecution[]> {
  const data = await get(`/api/v1/executions?limit=${limit}`)
  return (data.data ?? []).map((ex: ExecutionSummary) => ({
    ...ex,
    workflowName: WORKFLOW_NAMES[ex.workflowId] ?? ex.workflowId,
  }))
}

// Unified agent call — routes all contexts through Agent Sandbox (supports all 6 agents).
// `context` maps to the correct agent; `actionLevel` is passed as metadata for logging.
export async function chat(
  message: string,
  sessionId: string,
  context?: string,
  mode: 'standard' | 'lite' = 'standard',
): Promise<{ reply: string; replyFull?: string; sessionId: string; turnNumber: number }> {
  if (import.meta.env.PROD) {
    const agent = CONTEXT_TO_AGENT[context || 'LIFE'] || 'horhanis'
    const res = await fetchWithRetry(AGENT_SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, agent, sessionId, operator: 'SunNi', mode }),
    })
    if (!res.ok) throw new Error(`Agent ${agent} failed: ${res.status}`)
    const data = await res.json()
    // Agent Sandbox returns { reply, replyFull, sessionId, turnNumber }
    return {
      reply: data.replyFull || data.reply || data.response || data.message || JSON.stringify(data),
      sessionId: data.sessionId || sessionId,
      turnNumber: data.turnNumber || 1,
    }
  }
  // Dev: Vite proxy
  const res = await fetchWithRetry('/chat/webhook/horhanis-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, operator: 'SunNi' }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  return res.json()
}

export async function dispatch(
  command: string,
  intent?: string,
  context?: string,
  council?: string[],
  sessionId?: string,
  mode: 'standard' | 'lite' = 'standard',
): Promise<unknown> {
  if (import.meta.env.PROD) {
    // Agent Sandbox — no auth, CORS open, all agents available
    const agent = CONTEXT_TO_AGENT[context || 'LIFE'] || 'horhanis'
    const res = await fetchWithRetry(AGENT_SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: command,
        agent,
        sessionId: sessionId || `cc-${Date.now()}`,
        operator: 'SunNi',
        mode,
      }),
    })
    if (!res.ok) throw new Error(`Agent failed: ${res.status}`)
    return res.json()
  }
  // Dev: use Vite proxy (adds x-horhanis-key server-side)
  const res = await fetchWithRetry(DISPATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command,
      source: 'CommanderConsole',
      operator: 'SunNi',
      ...(intent  ? { intent }  : {}),
      ...(context ? { context } : {}),
      ...(council ? { council } : {}),
    }),
  })
  if (!res.ok) throw new Error(`Dispatch failed: ${res.status}`)
  return res.json()
}
