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

const N8N = '/n8n'
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

export async function chat(message: string, sessionId: string): Promise<{ reply: string; sessionId: string; turnNumber: number }> {
  const res = await fetch('/chat/webhook/horhanis-conversation', {
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
): Promise<unknown> {
  const res = await fetch('/dispatch/webhook/horhanis/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command,
      source: 'CommanderConsole',
      operator: 'SunNi',
      ...(intent   ? { intent }   : {}),
      ...(context  ? { context }  : {}),
      ...(council  ? { council }  : {}),
    }),
  })
  if (!res.ok) throw new Error(`Dispatch failed: ${res.status}`)
  return res.json()
}
