// Notion API calls routed through the n8n Agent Sandbox or direct Notion API
// All calls go through existing n8n webhooks to avoid CORS + key exposure

const AGENT_WH = 'https://sunnicommandcenter.app.n8n.cloud/webhook/secc-os/agent'
const N8N_BASE = 'https://sunnicommandcenter.app.n8n.cloud'

// ── Agent Sandbox ─────────────────────────────────────────────────────────────

export interface AgentMessage {
  role: 'user' | 'agent'
  content: string
  timestamp: string
  agent: string
}

export async function agentChat(
  message: string,
  agent: string,
  sessionId: string,
  operator = 'SunNi',
): Promise<{ reply: string; sessionId: string; turnNumber: number }> {
  const res = await fetch(AGENT_WH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, agent, sessionId, operator }),
  })
  if (!res.ok) throw new Error(`Agent ${agent} failed: ${res.status}`)
  return res.json()
}

// ── Computer Use ──────────────────────────────────────────────────────────────

export async function browserTask(
  task: string,
  startUrl: string,
  agent = 'CiRO',
  maxSteps = 10,
): Promise<{ status: string; result: string; screenshotBase64?: string }> {
  const res = await fetch(`${N8N_BASE}/webhook/secc-os/computer-use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, startUrl, agent, sessionId: `cu-${Date.now()}`, maxSteps }),
  })
  if (!res.ok) throw new Error(`Browser task failed: ${res.status}`)
  return res.json()
}

// ── Connectors — n8n Webhook Triggers ────────────────────────────────────────

export interface Connector {
  id: string
  name: string
  description: string
  webhook: string
  method: 'POST' | 'GET'
  payload?: Record<string, unknown>
  category: 'leasing' | 'revenue' | 'content' | 'intelligence' | 'system'
}

export const CONNECTORS: Connector[] = [
  {
    id: 'horhanis-dispatch',
    name: 'HORHANiS Dispatch',
    description: 'Send a command to HORHANiS for triage and routing',
    webhook: `${N8N_BASE}/webhook/horhanis/dispatch`,
    method: 'POST',
    category: 'intelligence',
  },
  {
    id: 'score-update',
    name: 'Credit Score Update',
    description: 'Log a new credit score entry across all three bureaus',
    webhook: `${N8N_BASE}/webhook/cie/score-update`,
    method: 'POST',
    category: 'intelligence',
  },
  {
    id: 'report-intake',
    name: 'Credit Report Intake',
    description: 'Submit a credit report for AI analysis and dispute generation',
    webhook: `${N8N_BASE}/webhook/cie/report-intake`,
    method: 'POST',
    category: 'intelligence',
  },
  {
    id: 'dar-generate',
    name: 'DAR Generator',
    description: 'Generate a Daily Activity Report for leasing',
    webhook: `${N8N_BASE}/webhook/lie/dar-generate`,
    method: 'POST',
    category: 'leasing',
  },
  {
    id: 'followup-gap',
    name: 'Follow-Up Gap Alert',
    description: 'Scan for overdue follow-ups in the Leads Tracker',
    webhook: `${N8N_BASE}/webhook/lie/followup-gap-check`,
    method: 'POST',
    category: 'leasing',
  },
  {
    id: 'trio-reasoning',
    name: 'TRiO Reasoning',
    description: 'Run TRiO AI analysis on current leasing pipeline',
    webhook: `${N8N_BASE}/webhook/lie/trio-reasoning`,
    method: 'POST',
    category: 'leasing',
  },
  {
    id: 'dashboard-refresh',
    name: 'LIE Dashboard Refresh',
    description: 'Refresh KPI snapshot and post Slack digest',
    webhook: `${N8N_BASE}/webhook/lie/dashboard-refresh`,
    method: 'POST',
    category: 'leasing',
  },
  {
    id: 'lead-intake',
    name: 'Revenue Lead Intake',
    description: 'Submit a new sales lead into the Revenue Engine pipeline',
    webhook: `${N8N_BASE}/webhook/revenue/lead-intake`,
    method: 'POST',
    category: 'revenue',
  },
  {
    id: 'pre-call-brief',
    name: 'Pre-Call Brief',
    description: 'Generate AI pre-call brief for a revenue lead',
    webhook: `${N8N_BASE}/webhook/revenue/pre-call-brief`,
    method: 'POST',
    category: 'revenue',
  },
  {
    id: 'voice-intake',
    name: 'Voice Note Intake',
    description: 'Submit a voice note or quick capture to the Master Log',
    webhook: `${N8N_BASE}/webhook/task-entry`,
    method: 'POST',
    category: 'system',
  },
]

export async function triggerConnector(
  connector: Connector,
  payload: Record<string, unknown> = {},
): Promise<unknown> {
  const body = { ...connector.payload, ...payload }
  const res = await fetch(connector.webhook, {
    method: connector.method,
    headers: { 'Content-Type': 'application/json' },
    body: connector.method === 'POST' ? JSON.stringify(body) : undefined,
  })
  return res.json().catch(() => ({ status: res.ok ? 'triggered' : 'error', code: res.status }))
}
