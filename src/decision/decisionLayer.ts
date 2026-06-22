/* ──────────────────────────────────────────────────────────────────────────
   AI Decision Layer — the orchestration core (Phase 2).
   Sits between the Domain Execution System and the AI Workforce. Turns signals
   into reasoned, routed, simulated decisions. The Decision Object is the
   atomic intelligence unit. Built Property-first (the wedge).
   ────────────────────────────────────────────────────────────────────────── */

export type Grade = 'high' | 'medium' | 'low'

export interface DecisionOption {
  action: string
  impact: Grade
  effort: Grade
}

export interface DecisionRouting {
  agents: string[]
  systems: string[]
  workflow: string
}

/* The atomic intelligence unit. Everything in Phase 2 revolves around this. */
export interface DecisionObject {
  domain: string
  signal: string
  context: Record<string, string>
  diagnosis: string                    // causal inference — the critical missing piece
  predictions: Record<string, string>  // e.g. "14 days", "30 days"
  options: DecisionOption[]
  recommendedAction: string
  routing: DecisionRouting
  confidence: number                   // 0–1, from the simulation engine
}

/* Architecture insertion — Decision Layer goes between execution + workforce. */
export const ARCH_STACK = [
  { name: 'Domain Execution System', tag: 'models execution', color: '#64748b' },
  { name: 'AI Decision Layer', tag: 'NEW · critical', color: '#f4c95d', isNew: true },
  { name: 'AI Workforce (Agents)', tag: 'acts', color: '#62a8ff' },
  { name: 'Workflow Engine', tag: 'executes', color: '#34d399' },
]

/* The 4 engines of the Decision Layer. */
export const DECISION_ENGINES = [
  {
    n: 1, name: 'Signal Engine', role: 'Detects meaningful change', color: '#34d399',
    bullets: ['Threshold breaches', 'Trend shifts', 'Velocity changes', 'Abnormal clustering'],
    produces: 'signal',
  },
  {
    n: 2, name: 'Reasoning Engine', role: 'Explains causality — the critical missing piece', color: '#b58cff',
    bullets: ['Dependency mapping', 'Root cause inference', 'Constraint identification'],
    produces: 'diagnosis + context',
  },
  {
    n: 3, name: 'Decision Engine', role: 'Generates action paths', color: '#f4c95d',
    bullets: ['Ranked interventions', 'Cost / impact analysis', 'Prioritization logic'],
    produces: 'options + recommended_action',
  },
  {
    n: 4, name: 'Simulation Engine', role: 'Forecasts outcomes', color: '#62a8ff',
    bullets: ['What-if modeling', 'Risk propagation', 'Scenario comparison', 'Confidence scoring'],
    produces: 'predictions + confidence',
  },
]

/* Worked example — Property domain occupancy decision (the wedge). */
export const PROPERTY_DECISION: DecisionObject = {
  domain: 'Property, Facilities & Asset Operations',
  signal: 'Occupancy drop 2.4%',
  context: {
    'Maintenance backlog': '+31%',
    'Tour conversion': '-12%',
  },
  diagnosis: 'Turnover bottleneck + leasing friction',
  predictions: {
    '14 days': 'Occupancy 91.8%',
    '30 days': 'Risk threshold breach',
  },
  options: [
    { action: 'Accelerate maintenance queue', impact: 'high', effort: 'medium' },
    { action: 'Increase leasing follow-up frequency', impact: 'medium', effort: 'low' },
  ],
  recommendedAction: 'Accelerate maintenance queue + leasing outreach',
  routing: {
    agents: ['Maintenance Coordinator Agent', 'Leasing Optimization Agent'],
    systems: ['Yardi', 'CRM IQ'],
    workflow: 'Vacancy Recovery Protocol',
  },
  confidence: 0.78,
}

/* The Property self-correcting loop — first real self-correcting system. */
export const SELF_CORRECTING_LOOP = [
  { phase: 'Signal', icon: '📡', color: '#34d399', items: ['Occupancy drop', 'Maintenance backlog spike', 'Lease slowdown'] },
  { phase: 'Decision', icon: '🧠', color: '#f4c95d', items: ['Leasing acceleration', 'Maintenance reprioritization', 'Pricing adjustment'] },
  { phase: 'Execution', icon: '⚙️', color: '#62a8ff', items: ['CRM tasks auto-created', 'Work orders reshuffled', 'Alerts sent'] },
  { phase: 'Feedback', icon: '🔁', color: '#b58cff', items: ['Occupancy recovery tracking'] },
]

/* Export a decision object as its JSON contract. */
export function toDecisionJSON(d: DecisionObject) {
  return {
    domain: d.domain,
    signal: d.signal,
    context: d.context,
    diagnosis: d.diagnosis,
    predictions: d.predictions,
    options: d.options,
    recommended_action: d.recommendedAction,
    routing: d.routing,
    confidence: d.confidence,
  }
}
