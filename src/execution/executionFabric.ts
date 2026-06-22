/* ──────────────────────────────────────────────────────────────────────────
   Execution Fabric — the real-world actuator layer.
   Converts a Decision Object into real system actions across Yardi, CRM IQ,
   Slack, Notion, etc. Adds translation, multi-system orchestration, a
   verification loop, failure recovery, and hard guardrails. This is the
   layer that turns the intelligence system into an operating system.
   ────────────────────────────────────────────────────────────────────────── */

export type ExecStatus = 'verified' | 'pending' | 'recovered' | 'failed'

/* Action Object — the executable command the fabric emits. */
export interface ActionObject {
  system: string
  action: string
  payload: Record<string, string>
}

export const EXAMPLE_ACTION: ActionObject = {
  system: 'Yardi',
  action: 'create_work_order',
  payload: { priority: 'high', unit: 'A-1203', issue: 'turnover delay risk' },
}

/* Architecture insertion — Execution Fabric sits between Simulation + Workforce. */
export const ARCH_STACK = [
  { name: 'Signal Engine', color: '#34d399' },
  { name: 'Reasoning Engine', color: '#b58cff' },
  { name: 'Decision Engine', color: '#f4c95d' },
  { name: 'Simulation Engine', color: '#62a8ff' },
  { name: 'Execution Fabric', color: '#c084fc', isNew: true },
  { name: 'AI Workforce', color: '#62a8ff' },
  { name: 'External Systems (Yardi / CRM IQ / …)', color: '#64748b' },
]

/* The full closed loop — the real self-correcting enterprise system. */
export const CLOSED_LOOP = ['Signal', 'Reason', 'Decide', 'Simulate', 'Execute', 'Verify', 'Feedback']
export const FABRIC_STAGES = ['Execute', 'Verify'] // the stages the fabric owns

/* The 4 functions of the Execution Fabric. */
export const FABRIC_FUNCTIONS = [
  {
    n: 1, name: 'Action Translation', icon: '🔤', color: '#c084fc',
    desc: 'Converts the Decision Object into executable system commands.',
    bullets: ['Decision → Action Object', 'System-specific payloads', 'Schema validation'],
  },
  {
    n: 2, name: 'Multi-System Orchestration', icon: '🔀', color: '#62a8ff',
    desc: 'One decision fans out to many systems in the right order.',
    bullets: ['CRM IQ · Yardi · Slack', 'Notion audit · Power BI', 'Dependency ordering'],
  },
  {
    n: 3, name: 'Execution Verification Loop', icon: '✅', color: '#34d399',
    desc: 'Confirms each action actually landed — else re-queue or escalate.',
    bullets: ['Task created?', 'Workflow triggered?', 'System state updated?'],
  },
  {
    n: 4, name: 'Failure Recovery', icon: '🛟', color: '#ef4444',
    desc: 'Handles the messy reality that makes it enterprise-grade.',
    bullets: ['API failure', 'Missing data / partial execution', 'System mismatch → rollback'],
  },
]

/* Property occupancy scenario — one decision fans out across systems.
   status illustrates the verification loop (+ one recovered failure). */
export const ORCHESTRATION: (ActionObject & { icon: string; detail: string; status: ExecStatus })[] = [
  { system: 'Yardi', icon: '🏢', action: 'reprioritize_work_orders', detail: 'Unit A-1203 · turnover delay risk · priority high', status: 'verified', payload: {} },
  { system: 'CRM IQ', icon: '📇', action: 'create_task_batch', detail: '12 leasing follow-up tasks queued', status: 'verified', payload: {} },
  { system: 'Slack', icon: '💬', action: 'send_alert', detail: 'Property ops channel notified', status: 'verified', payload: {} },
  { system: 'Notion', icon: '📓', action: 'write_audit_log', detail: 'Decision + actions logged to audit trail', status: 'verified', payload: {} },
  { system: 'Power BI', icon: '📊', action: 'update_kpi', detail: 'Occupancy KPI refresh — API retried once', status: 'recovered', payload: {} },
]

/* Decision Type → System Action → Agent → Workflow mapping. */
export const DECISION_ACTION_MAP = [
  { decision: 'Accelerate maintenance queue', systemAction: 'Yardi · reprioritize_work_orders', agent: 'Maintenance Coordinator Agent', workflow: 'Vacancy Recovery Protocol' },
  { decision: 'Increase leasing outreach', systemAction: 'CRM IQ · create_task_batch', agent: 'Leasing Optimization Agent', workflow: 'Vacancy Recovery Protocol' },
  { decision: 'Pricing review', systemAction: 'Finance · pricing_review_alert', agent: 'Asset Performance Analyst Agent', workflow: 'Pricing Review' },
  { decision: 'Vacancy recovery protocol', systemAction: 'Multi-system · trigger_protocol', agent: 'Leasing + Maintenance Agents', workflow: 'Vacancy Recovery Protocol' },
]

/* Property: Decision → Execution mapping (the wedge example). */
export const PROPERTY_EXEC_MAP = [
  { decision: 'accelerate maintenance queue', execution: 'Yardi work order reprioritization' },
  { decision: 'increase leasing outreach', execution: 'CRM IQ task batch creation' },
  { decision: 'pricing review', execution: 'finance system alert' },
  { decision: 'vacancy recovery protocol', execution: 'multi-agent workflow trigger' },
]

/* Guardrails — what keeps the fabric from going rogue. */
export const GUARDRAILS = [
  { icon: '♻️', name: 'Idempotent actions', desc: 'Same decision never double-fires an action.' },
  { icon: '🛡', name: 'Approval tiers (GUARDiAN)', desc: 'Protected actions require human authorization.' },
  { icon: '📜', name: 'Execution logs', desc: 'Every action written to an auditable trail.' },
  { icon: '↩️', name: 'Rollback capability', desc: 'Partial or wrong execution can be reversed.' },
]

export const STRATEGIC = [
  { stage: 'Before', label: 'AI PMO = intelligence layer', color: '#64748b' },
  { stage: 'Now', label: 'AI PMO = decision system', color: '#62a8ff' },
  { stage: 'Next', label: 'AI PMO = autonomous enterprise operating system', color: '#f4c95d' },
]

export function toActionJSON(a: ActionObject) {
  return { system: a.system, action: a.action, payload: a.payload }
}
