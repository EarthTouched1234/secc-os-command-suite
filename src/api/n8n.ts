const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL || 'https://sunnicommandcenter.app.n8n.cloud'

export interface Connector {
  id: string
  name: string
  description: string
  webhook: string
  method: 'POST' | 'GET'
  payload?: Record<string, unknown>
  category: 'leasing' | 'revenue' | 'content' | 'intelligence' | 'system'
}
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

// Specialist agents with dedicated webhooks (not routed through Agent Sandbox)
const SPECIALIST_URLS: Record<string, string> = {
  finance: 'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/agent/finance',
  legal:   'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/agent/legal',
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
export { fetchWithRetry }
const PMO_SYNC_URL           = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/sync-status'
const PMO_SNAPSHOT_URL       = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/gate-snapshot'
const PMO_TRAJECTORY_URL     = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/trajectory'
const PMO_SENTINEL_URL       = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/financial-sentinel'
const ACTION_APPROVE_URL     = 'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/approve-v2'
const PENDING_ACTIONS_URL    = 'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/actions/pending'
const GUARDIAN_RISK_URL      = 'https://sunnicommandcenter.app.n8n.cloud/webhook/guardian/risk-register'
const GUARDIAN_INTERCEPT_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/guardian/intercept'

// GUARDiAN Zero-Trust Layer — Golden Automation Rule enforcement.
// Any action whose type appears here is PROTECTED: blocked, logged to the Risk &
// Decision Register, and routed to human approval before execution.
// Non-listed types are Non-Protected and pass through as standard operations.
export const PROTECTED_ACTION_TYPES: Record<string, { riskLevel: 'Critical' | 'High' | 'Medium'; reason: string }> = {
  financial:         { riskLevel: 'Critical', reason: 'Financial commitment or payment' },
  budget_change:     { riskLevel: 'Critical', reason: 'Program budget modification' },
  credential_change: { riskLevel: 'Critical', reason: 'Credential or secret rotation' },
  workflow_delete:   { riskLevel: 'Critical', reason: 'Irreversible workflow destruction' },
  security:          { riskLevel: 'Critical', reason: 'Security boundary change' },
  architectural:     { riskLevel: 'High',     reason: 'System architecture modification' },
  gate_change:       { riskLevel: 'High',     reason: 'PMO gate transition' },
  github_push:       { riskLevel: 'High',     reason: 'Code deployment to repository' },
  email_file:        { riskLevel: 'Medium',   reason: 'External communication with attachments' },
  workflow_run:      { riskLevel: 'Medium',   reason: 'Workflow execution with side effects' },
}

export interface GuardianClassification {
  protected: boolean
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low'
  reason: string
}

export function classifyAction(actionType: string): GuardianClassification {
  const match = PROTECTED_ACTION_TYPES[actionType]
  if (match) return { protected: true, ...match }
  return { protected: false, riskLevel: 'Low', reason: 'Standard operational action' }
}

export interface RiskEntry {
  id: string
  title: string
  agent: string
  action_type: string
  classification: 'Protected' | 'Non-Protected'
  risk_level: string
  status: string
  program: string
  logged_at: string
  authorized_by: string | null
}

export async function fetchRiskRegister(): Promise<RiskEntry[]> {
  try {
    const res = await fetchWithRetry(GUARDIAN_RISK_URL, { method: 'GET' })
    if (!res.ok) return []
    const data = await res.json()
    return data.entries || []
  } catch {
    return []
  }
}

export async function logToRiskRegister(action: {
  action_id: string
  agent: string
  action_type: string
  preview_message: string
  program?: string
}): Promise<{ logged: boolean; risk_id?: string }> {
  try {
    const res = await fetchWithRetry(GUARDIAN_INTERCEPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    })
    if (!res.ok) return { logged: false }
    return res.json()
  } catch {
    return { logged: false }
  }
}

// SLA targets per agent per mode (milliseconds).
// Warning fires at 80% of target; breach fires at 100%.
export const SLA_TARGETS: Record<string, { standard: number; lite: number }> = {
  horhanis:  { standard: 45_000, lite: 20_000 },
  trio:      { standard: 60_000, lite: 25_000 },
  tito:      { standard: 90_000, lite: 40_000 },
  ciro:      { standard: 90_000, lite: 40_000 },
  sunni:     { standard: 60_000, lite: 25_000 },
  guardian:  { standard: 30_000, lite: 15_000 },
  triage:    { standard: 60_000, lite: 25_000 },
  finance:   { standard: 60_000, lite: 25_000 },
  legal:     { standard: 60_000, lite: 25_000 },
}

export interface SLAResult {
  elapsedMs: number
  targetMs: number
  status: 'met' | 'warning' | 'breached'
  agent: string
  mode: 'standard' | 'lite'
}

export interface ActionRecord {
  action_id: string
  notion_page_id?: string
  agent: string
  action_type: string
  status: string
  preview_message: string
  destination: string
  session_id: string
  timestamp: string
  action_payload: string
}

export interface ActionReceipt {
  action_id: string
  type: string
  status: string
  timestamp: string
  destination: string | null
  receipt_url_or_file_path: string | null
  approved: boolean
  approver?: string
}

export interface SyncResult {
  synced: boolean
  programs_updated: number
  synced_at: string
}

export async function syncPortfolioStatus(): Promise<SyncResult> {
  const res = await fetchWithRetry(PMO_SYNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`)
  return res.json()
}

export interface SnapshotResult {
  snapshotted: boolean
  count: number
  reason: string
  snapped_at: string
}

export async function snapshotPortfolio(reason = 'post_sync'): Promise<SnapshotResult> {
  const res = await fetchWithRetry(PMO_SNAPSHOT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) throw new Error(`Snapshot failed: ${res.status}`)
  return res.json()
}

export interface SentinelAlert {
  name: string
  burn_pct: number
  alert_level: 'Watch' | 'Alert' | 'Critical'
}

export interface SentinelResult {
  sentinel: boolean
  checked: number
  alerts: SentinelAlert[]
  checked_at: string
}

export async function runFinancialSentinel(): Promise<SentinelResult> {
  const res = await fetchWithRetry(PMO_SENTINEL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(`Sentinel failed: ${res.status}`)
  return res.json()
}

export type TrajectoryDirection = 'Improving' | 'Stable' | 'Declining' | 'Unknown'

export type AccelDirection = 'accelerating' | 'decelerating' | 'flat' | 'unknown'
export type VelocityDirection = 'up' | 'down' | 'flat'

export interface TrajectoryEntry {
  program_id: string
  program: string
  direction: TrajectoryDirection
  scores: number[]
  delta: number | null
  // Velocity — avg health delta per snapshot period
  velocity: number | null
  velocity_pct: string | null       // e.g. "+10.2" or "-5.3"
  velocity_dir: VelocityDirection
  // Acceleration — 2nd derivative (delta of deltas), needs 3+ snapshots
  acceleration: number | null
  acceleration_pct: string | null   // e.g. "+5.0" or "-8.0"
  accel_dir: AccelDirection
  confidence: 'high' | 'medium' | 'low'
  snapshot_count: number
  scored_count: number
}

// Keyed by program_id for O(1) lookup in the UI
export type TrajectoryMap = Record<string, TrajectoryEntry>

export async function fetchTrajectory(): Promise<TrajectoryMap> {
  try {
    const res = await fetchWithRetry(PMO_TRAJECTORY_URL, { method: 'GET' })
    if (!res.ok) return {}
    const data = await res.json()
    const map: TrajectoryMap = {}
    for (const entry of (data.trajectories || [])) {
      map[entry.program_id] = entry
    }
    return map
  } catch {
    return {}
  }
}

// ── Launch KPIs (Intelligence & Analytics division) ──────────────────────────
const LAUNCH_KPI_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/launch/kpis'

export interface LaunchKPIs {
  generatedAt: string
  waitlist: {
    total: number
    last7: number
    byTier: { Core: number; Ops: number; Enterprise: number; Unsure: number }
    byStatus: { New: number; Contacted: number; Onboarded: number; Declined: number }
    onboarded: number
    enterpriseInterest: number
  }
  site?: {
    pageviews: number
    pageviews7: number
    uniqueSessions: number
    conversionPct: number
  }
  linkedin?: {
    impressions: number
    reactions: number
    comments: number
    engagementRate: number
    weekOf: string
    source: string
  } | null
  divisions: {
    total: number
    green: number
    amber: number
    red: number
    shipped: number
    inProgress: number
    blocked: number
    avgConfidence: number
  }
  notInstrumented: { metric: string; reason: string }[]
}

export async function fetchLaunchKPIs(): Promise<LaunchKPIs | null> {
  try {
    const res = await fetchWithRetry(LAUNCH_KPI_URL, { method: 'GET' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchPendingActions(): Promise<ActionRecord[]> {
  try {
    const res = await fetch(PENDING_ACTIONS_URL)
    if (!res.ok) return []
    const data = await res.json()
    return data.actions || []
  } catch {
    return []
  }
}

export async function approveAction(
  actionId: string,
  approved: boolean,
  approver = 'SunNi',
): Promise<ActionReceipt> {
  const res = await fetchWithRetry(ACTION_APPROVE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action_id: actionId, approved, approver }),
  })
  if (!res.ok) throw new Error(`Approve failed: ${res.status}`)
  return res.json()
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

function computeSLA(sendAt: number, agent: string, mode: 'standard' | 'lite'): SLAResult {
  const elapsedMs = Date.now() - sendAt
  const key = agent.toLowerCase()
  const targetMs = (SLA_TARGETS[key] ?? SLA_TARGETS.horhanis)[mode]
  const status = elapsedMs > targetMs ? 'breached'
    : elapsedMs > targetMs * 0.8 ? 'warning'
    : 'met'
  return { elapsedMs, targetMs, status, agent, mode }
}

// Shared transport for all agent calls — specialist and sandbox use identical wire format.
async function callAgent(
  url: string,
  agent: string,
  message: string,
  sessionId: string,
  mode: 'standard' | 'lite',
  sendAt: number,
): Promise<{ reply: string; sessionId: string; turnNumber: number; sla: SLAResult }> {
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, agent, sessionId, operator: 'SunNi', mode }),
  })
  if (!res.ok) throw new Error(`Agent ${agent} failed: ${res.status}`)
  const data = await res.json()
  return {
    reply: data.replyFull || data.reply || data.response || data.message || JSON.stringify(data),
    sessionId: data.sessionId || sessionId,
    turnNumber: data.turnNumber || 1,
    sla: computeSLA(sendAt, agent, mode),
  }
}

export async function chat(
  message: string,
  sessionId: string,
  context?: string,
  mode: 'standard' | 'lite' = 'standard',
): Promise<{ reply: string; replyFull?: string; sessionId: string; turnNumber: number; sla: SLAResult }> {
  const sendAt = Date.now()

  // @prefix override: "@finance what is my runway?" routes to specialist regardless of context tab.
  const prefixMatch = message.match(/^@(\w+)\s+/i)
  const prefixAgent = prefixMatch ? prefixMatch[1].toLowerCase() : null
  const cleanMessage = prefixAgent ? message.slice(prefixMatch![0].length) : message

  if (import.meta.env.PROD) {
    const specialistUrl = prefixAgent ? SPECIALIST_URLS[prefixAgent] : null
    const url = specialistUrl ?? AGENT_SANDBOX_URL
    const agent = specialistUrl ? prefixAgent! : (CONTEXT_TO_AGENT[(context || 'LIFE').toUpperCase()] || 'horhanis')
    return callAgent(url, agent, cleanMessage, sessionId, mode, sendAt)
  }
  // Dev: Vite proxy
  const res = await fetchWithRetry('/chat/webhook/horhanis-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, operator: 'SunNi' }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  const data = await res.json()
  return { ...data, sla: computeSLA(sendAt, 'horhanis', mode) }
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

// Connector Webhooks wired July 5 2026 all confirmed 200 OK
export const HORHANIS_DISPATCH_URL     = 'https://sunnicommandcenter.app.n8n.cloud/webhook/horhanis/dispatch'
export const HORHANIS_CONVERSATION_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/horhanis-conversation'
export const REVENUE_PRE_CALL_URL      = 'https://sunnicommandcenter.app.n8n.cloud/webhook/revenue/pre-call-brief'
export const CIE_SCORE_URL             = 'https://sunnicommandcenter.app.n8n.cloud/webhook/cie/score-update'
export const CIE_REPORT_URL            = 'https://sunnicommandcenter.app.n8n.cloud/webhook/cie/report-intake'
export const LIE_PMO_PROMOTE_URL       = 'https://sunnicommandcenter.app.n8n.cloud/webhook/connector/promote'
export const LIE_DAR_PROMOTE_URL       = 'https://sunnicommandcenter.app.n8n.cloud/webhook/connector/promote-dar'
export const LIE_DASHBOARD_URL         = 'https://sunnicommandcenter.app.n8n.cloud/webhook/lie/dashboard-refresh'
export const LIE_FOLLOWUP_GAP_URL      = 'https://sunnicommandcenter.app.n8n.cloud/webhook/lie/followup-gap-check'
export const LIE_TRIO_REASONING_URL    = 'https://sunnicommandcenter.app.n8n.cloud/webhook/lie/trio-reasoning'
export const LIE_DAR_GENERATE_URL      = 'https://sunnicommandcenter.app.n8n.cloud/webhook/lie/dar-generate'
export const REVENUE_LEAD_INTAKE_URL   = 'https://sunnicommandcenter.app.n8n.cloud/webhook/revenue/lead-intake'
export const CONNECTORS: Connector[] = [
  {
    id: 'hov-member-intake',
    name: 'HOV Member Intake',
    description: 'Creates a new HOV member record',
    webhook: `${N8N_BASE}/webhook/hov/member-intake`,
    method: 'POST',
    category: 'system',
  },
]

  