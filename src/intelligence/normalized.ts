// NIL — Normalized Intelligence Layer contract (the Step-0 foundation).
// Every intelligence output the VSS can render must normalize to this shape.
// The truth-layer (LIVE/PARTIAL/INFERRED) enforces the no-overclaim doctrine in code:
// no structure → no visualization; no confidence → no authority; no ingestion → no KPI.

export type SourceState = 'LIVE' | 'PARTIAL' | 'INFERRED'

export interface NormalizedOutput {
  id: string
  type: 'PMO' | 'SEIS' | 'REPORT' | 'AGENT'
  title: string
  content: string
  metrics?: Record<string, number>
  timeline?: unknown[]
  nodes?: unknown[]
  sourceState: SourceState
  confidence: number // 0–1, computed (never assigned)
  sourceBreakdown?: { crmIq: string; notion: string; yardi: string }
  timestamp: number
}

export interface TruthBadge {
  label: SourceState
  color: string
  note: string
}

export function getTruthBadge(state: SourceState): TruthBadge {
  switch (state) {
    case 'LIVE':
      return { label: 'LIVE', color: '#30d158', note: 'Verified across connected operational sources.' }
    case 'PARTIAL':
      return { label: 'PARTIAL', color: '#ffb020', note: 'Real internal data (Notion PMO Register). Upgrades to LIVE when CRM IQ / Yardi are connected and agree.' }
    case 'INFERRED':
      return { label: 'INFERRED', color: '#8a8f98', note: 'Insufficient live data — no KPI authority rendered.' }
  }
}
