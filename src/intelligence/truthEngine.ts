// Truth Engine — sourceState is COMPUTED from measurable signals, never assigned.
// score = completeness·0.4 + freshness·0.3 + (1 − conflictDensity)·0.3
// Doctrine guard: without external verification the state can never reach LIVE — caps at PARTIAL.
// (A single internal source like the Notion PMO Register is real, but unverified → PARTIAL.)

import type { SourceState } from './normalized'

export interface TruthSignals {
  completeness: number      // 0–1 fraction of expected fields present
  freshness: number         // 0–1 (1 = fresh, 0 = stale)
  conflictDensity: number   // 0–1 (0 = no cross-source disagreement)
  externallyVerified: boolean // true only when ≥2 independent sources agree
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function evaluateTruthState(s: TruthSignals): { state: SourceState; confidence: number } {
  if (s.completeness === 0) return { state: 'INFERRED', confidence: 0 }
  const score = s.completeness * 0.4 + s.freshness * 0.3 + (1 - s.conflictDensity) * 0.3
  const confidence = round2(score)
  if (score >= 0.8 && s.externallyVerified) return { state: 'LIVE', confidence }
  if (score >= 0.5) return { state: 'PARTIAL', confidence }
  return { state: 'INFERRED', confidence }
}
