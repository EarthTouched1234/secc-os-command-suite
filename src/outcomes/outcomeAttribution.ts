/* ──────────────────────────────────────────────────────────────────────────
   CIRO Outcome Attribution Layer — the execution-outcome binding.
   Connects a decision to its real-world result and attributes the system-state
   change back to it. This is the feedback the system needs to stop being
   "deterministic but not self-improving" and start self-correcting.
   ────────────────────────────────────────────────────────────────────────── */

export interface Effectiveness {
  name: string
  score: number   // 0–100
  note: string
}

/* Outcome record — the atomic unit of the attribution layer. */
export interface OutcomeRecord {
  decision_id: string
  domain: string
  signal: string
  action_taken: string
  expected_outcome: string
  actual_outcome: string
  variance: number            // signed delta vs expectation (pts)
  variance_label: string
  cause: string               // why the variance
  system_learning: string     // what the system adjusted (the self-improvement)
  before: Record<string, string>
  after: Record<string, string>
  agent_effectiveness: Effectiveness[]
  workflow_effectiveness: Effectiveness[]
  confidence: number
  status: 'attributed' | 'pending'
}

/* The binding layer: 3 things it connects. */
export const BINDING_STEPS = [
  { n: 1, name: 'Decision Executed', icon: '⚙️', color: '#62a8ff', desc: 'The action that fired, captured from the Execution Fabric.' },
  { n: 2, name: 'Real-World Result', icon: '🌐', color: '#34d399', desc: 'The measured KPI movement after the action landed.' },
  { n: 3, name: 'State-Change Attribution', icon: '🧬', color: '#c084fc', desc: 'The before→after delta tied causally back to the decision.' },
]

/* Full self-correcting loop — Outcome Attribution is the new closing segment. */
export const CLOSED_LOOP = ['Decide', 'Execute', 'Verify', 'Outcome', 'Learn', 'Signal']
export const ATTRIBUTION_STAGE = 'Outcome'

export const SHIFT = {
  before: 'Deterministic — but not self-improving',
  after: 'Self-improving — a self-auditing enterprise execution intelligence system',
}

/* Worked example — Property occupancy decision D-182. */
export const OUTCOME_D182: OutcomeRecord = {
  decision_id: 'D-182',
  domain: 'Property, Facilities & Asset Operations',
  signal: 'Occupancy drop 2.4%',
  action_taken: 'Accelerate maintenance queue + leasing outreach',
  expected_outcome: 'Occupancy +2.0%',
  actual_outcome: 'Occupancy +1.2%',
  variance: -0.8,
  variance_label: '+1.2% actual vs +2.0% expected · −0.8 pts',
  cause: 'Maintenance backlog underestimated',
  system_learning: 'Backlog weighting model adjusted (+15% sensitivity in occupancy forecast)',
  before: { Occupancy: '89.4%', 'Maintenance backlog': '+31%', 'Tour conversion': '-12%' },
  after: { Occupancy: '90.6%', 'Maintenance backlog': '+18%', 'Tour conversion': '-4%' },
  agent_effectiveness: [
    { name: 'Maintenance Coordinator Agent', score: 72, note: 'cleared 18 of 25 backlog work orders' },
    { name: 'Leasing Optimization Agent', score: 84, note: '12 follow-ups → 5 tours booked' },
  ],
  workflow_effectiveness: [
    { name: 'Vacancy Recovery Protocol', score: 78, note: 'partial recovery — backlog drag limited upside' },
  ],
  confidence: 0.81,
  status: 'attributed',
}

export function scoreColor(s: number): string {
  return s >= 80 ? '#34d399' : s >= 60 ? '#f59e0b' : '#ef4444'
}

/* JSON contract — matches the Outcome Diff Attribution schema. */
export function toOutcomeJSON(o: OutcomeRecord) {
  return {
    decision_id: o.decision_id,
    expected_outcome: o.expected_outcome,
    actual_outcome: o.actual_outcome,
    variance: o.variance,
    cause: o.cause,
    system_learning: o.system_learning,
  }
}
