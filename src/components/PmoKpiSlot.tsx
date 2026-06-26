// PMO KPI Slot — the VSS proving slice.
// LIVE PMO Portfolio API → NIL normalize → Truth Engine → SRSM resolve → rendered KPI panel.
// Zero mock: every number comes from the real /webhook/pmo/portfolio feed. Badge is computed,
// not assigned — a single internal source renders PARTIAL until CRM IQ / Yardi verify (LOL-1).

import { useState, useEffect } from 'react'
import { fetchWithRetry } from '../api/n8n'
import { evaluateTruthState } from '../intelligence/truthEngine'
import { resolveSlots } from '../intelligence/slotResolver'
import { getTruthBadge, type NormalizedOutput } from '../intelligence/normalized'

const PMO_PORTFOLIO_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/portfolio'

interface Prog {
  rag: string
  healthScore: number | null
  riskExposure: string
}

function normalize(programs: Prog[]): NormalizedOutput {
  const n = programs.length
  const withHealth = programs.filter(p => typeof p.healthScore === 'number')
  const avgHealth = withHealth.length
    ? Math.round(withHealth.reduce((s, p) => s + (p.healthScore || 0), 0) / withHealth.length)
    : 0
  const green = programs.filter(p => /green/i.test(p.rag || '')).length
  const red = programs.filter(p => /red/i.test(p.rag || '')).length
  const atRisk = programs.filter(p => /high/i.test(p.riskExposure || '')).length

  // Truth signals: single internal source (Notion PMO Register), not externally verified.
  const completeness = n === 0 ? 0 : withHealth.length / n
  const { state, confidence } = evaluateTruthState({
    completeness,
    freshness: 1,
    conflictDensity: 0,
    externallyVerified: false, // flips true when CRM IQ / Yardi agree (LOL-1)
  })

  return {
    id: 'pmo-portfolio-live',
    type: 'PMO',
    title: 'Portfolio Health',
    content: `${n} active programs · avg health ${avgHealth}`,
    metrics: { programs: n, avgHealth, green, red, atRisk },
    sourceState: state,
    confidence,
    sourceBreakdown: { crmIq: 'OFFLINE', notion: 'LIVE', yardi: 'OFFLINE' },
    timestamp: Date.now(),
  }
}

export function PmoKpiSlot() {
  const [output, setOutput] = useState<NormalizedOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetchWithRetry(PMO_PORTFOLIO_URL, { method: 'GET' })
        const data = await res.json()
        const programs: Prog[] = data.programs || []
        if (alive) setOutput(normalize(programs))
      } catch {
        if (alive) setErr(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (loading) return <div className="vss-slot vss-muted">Resolving intelligence…</div>
  if (err || !output) return <div className="vss-slot vss-muted">⚠ INFERRED · no live PMO data — text-first, no KPI authority</div>

  const badge = getTruthBadge(output.sourceState)
  const slots = resolveSlots(output)
  const m = output.metrics!
  // Doctrine: KPIs render ONLY if the resolver earned a KPI_panel slot.
  // INFERRED → resolver returns [] → no authority rendered (text-only).
  const hasKpi = slots.some(s => s.type === 'KPI_panel')

  return (
    <div className="vss-slot" style={{ borderColor: badge.color + '44' }}>
      <div className="vss-head">
        <span className="vss-title">{output.title}</span>
        <span
          className="vss-badge"
          style={{ color: badge.color, borderColor: badge.color + '66', background: badge.color + '14' }}
          title={badge.note}
        >
          ● {badge.label} · {Math.round(output.confidence * 100)}%
        </span>
      </div>
      {hasKpi ? (
        <div className="vss-kpis">
          <div className="vss-kpi"><div className="n">{m.programs}</div><div className="l">Programs</div></div>
          <div className="vss-kpi"><div className="n">{m.avgHealth}</div><div className="l">Avg health</div></div>
          <div className="vss-kpi"><div className="n" style={{ color: '#30d158' }}>{m.green}</div><div className="l">Green</div></div>
          <div className="vss-kpi"><div className="n" style={{ color: '#ff453a' }}>{m.red}</div><div className="l">Red</div></div>
          <div className="vss-kpi"><div className="n" style={{ color: '#ffb020' }}>{m.atRisk}</div><div className="l">At risk</div></div>
        </div>
      ) : (
        <div className="vss-textonly">
          {m.programs} programs tracked, but health isn't scored yet — KPIs withheld.
          The truth-layer won't render authority it can't source. Run the PMO RAG Scorer to populate health, then this panel earns its KPI slot.
        </div>
      )}
      <div className="vss-foot">
        <span className="vss-slots">resolver → {slots.map(s => s.type).join(' · ') || 'text-only (INFERRED)'}</span>
        <span className="vss-note">{badge.note}</span>
      </div>
    </div>
  )
}
