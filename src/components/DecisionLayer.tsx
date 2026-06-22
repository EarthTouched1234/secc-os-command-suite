import { useState } from 'react'
import {
  ARCH_STACK, DECISION_ENGINES, PROPERTY_DECISION, SELF_CORRECTING_LOOP,
  toDecisionJSON, type Grade,
} from '../decision/decisionLayer'

/* ──────────────────────────────────────────────────────────────────────────
   Decision Layer — the orchestration core, Property-first.
   Renders the architecture insertion, the 4 engines pipeline, the live
   Decision Object (atomic unit), and the self-correcting occupancy loop.
   ────────────────────────────────────────────────────────────────────────── */

const GRADE_COLOR: Record<Grade, string> = { high: '#34d399', medium: '#f59e0b', low: '#64748b' }

export function DecisionLayer() {
  const [showJSON, setShowJSON] = useState(false)
  const d = PROPERTY_DECISION

  return (
    <div className="dl-root">
      {/* Header */}
      <div className="dl-header">
        <div>
          <span className="dl-title">AI Decision Layer</span>
          <span className="dl-subtitle">the orchestration core · Property wedge · Phase 2</span>
        </div>
        <span className="dl-phase-pill">SIGNAL → REASONING → DECISION → SIMULATION</span>
      </div>

      {/* Before / After */}
      <div className="dl-shift">
        <div className="dl-shift-before"><span className="dl-shift-tag">BEFORE</span>“Here is what is happening.”</div>
        <span className="dl-shift-arrow">→</span>
        <div className="dl-shift-after"><span className="dl-shift-tag">AFTER</span>“Here is what is happening, <strong>why</strong>, what will happen <strong>next</strong>, and what you should <strong>do</strong> — executed automatically if approved.”</div>
      </div>

      {/* Architecture insertion */}
      <div className="dl-panel">
        <div className="dl-panel-header">ARCHITECTURE — DECISION LAYER INSERTION</div>
        <div className="dl-arch">
          {ARCH_STACK.map((a, i) => (
            <div key={a.name} className="dl-arch-wrap">
              <div className={`dl-arch-row ${a.isNew ? 'dl-arch-new' : ''}`} style={{ borderLeftColor: a.color }}>
                <span className="dl-arch-name" style={a.isNew ? { color: a.color } : undefined}>{a.name}</span>
                <span className="dl-arch-tag" style={{ color: a.color, borderColor: `${a.color}55` }}>{a.tag}</span>
              </div>
              {i < ARCH_STACK.length - 1 && <span className="dl-arch-down">↓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 4 engines pipeline */}
      <div className="dl-panel">
        <div className="dl-panel-header">THE 4 ENGINES</div>
        <div className="dl-engines">
          {DECISION_ENGINES.map((e, i) => (
            <div key={e.name} className="dl-engine-wrap">
              <div className="dl-engine" style={{ borderTopColor: e.color }}>
                <div className="dl-engine-top">
                  <span className="dl-engine-num" style={{ background: e.color }}>{e.n}</span>
                  <span className="dl-engine-name">{e.name}</span>
                </div>
                <div className="dl-engine-role">{e.role}</div>
                <ul className="dl-engine-bullets">
                  {e.bullets.map(b => <li key={b}><span style={{ color: e.color }}>▸</span> {b}</li>)}
                </ul>
                <div className="dl-engine-produces">→ {e.produces}</div>
              </div>
              {i < DECISION_ENGINES.length - 1 && <span className="dl-engine-arrow">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* The Decision Object */}
      <div className="dl-panel dl-do">
        <div className="dl-panel-header dl-do-header">
          <span>⬢ DECISION OBJECT · ATOMIC INTELLIGENCE UNIT</span>
          <div className="dl-do-actions">
            <span className="dl-do-domain">{d.domain}</span>
            <button className="dl-json-btn" onClick={() => setShowJSON(s => !s)}>{showJSON ? 'Hide JSON' : '⧉ JSON'}</button>
          </div>
        </div>

        {!showJSON ? (
          <div className="dl-do-body">
            {/* Signal + context */}
            <div className="dl-do-signal">
              <span className="dl-do-label" style={{ color: '#34d399' }}>📡 SIGNAL</span>
              <span className="dl-do-signal-val">{d.signal}</span>
              <div className="dl-do-context">
                {Object.entries(d.context).map(([k, v]) => (
                  <span key={k} className="dl-ctx-chip">{k} <strong>{v}</strong></span>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div className="dl-do-row">
              <span className="dl-do-label" style={{ color: '#b58cff' }}>🧠 DIAGNOSIS</span>
              <span className="dl-do-diagnosis">{d.diagnosis}</span>
            </div>

            {/* Predictions */}
            <div className="dl-do-row">
              <span className="dl-do-label" style={{ color: '#62a8ff' }}>🔮 PREDICTIONS</span>
              <div className="dl-pred-row">
                {Object.entries(d.predictions).map(([k, v]) => (
                  <div key={k} className="dl-pred"><span className="dl-pred-when">{k}</span><span className="dl-pred-what">{v}</span></div>
                ))}
                <div className="dl-confidence">confidence <strong>{Math.round(d.confidence * 100)}%</strong></div>
              </div>
            </div>

            {/* Options */}
            <div className="dl-do-row">
              <span className="dl-do-label" style={{ color: '#f4c95d' }}>⚖️ OPTIONS</span>
              <div className="dl-options">
                {d.options.map(o => (
                  <div key={o.action} className="dl-option">
                    <span className="dl-option-action">{o.action}</span>
                    <span className="dl-option-grade" style={{ color: GRADE_COLOR[o.impact] }}>impact: {o.impact}</span>
                    <span className="dl-option-grade" style={{ color: GRADE_COLOR[o.effort] }}>effort: {o.effort}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div className="dl-recommended">
              <span className="dl-do-label" style={{ color: '#050608' }}>✓ RECOMMENDED</span>
              {d.recommendedAction}
            </div>

            {/* Routing */}
            <div className="dl-routing">
              <span className="dl-do-label">🎯 ROUTING</span>
              <div className="dl-route-grid">
                <div className="dl-route"><span>Agents</span>{d.routing.agents.map(a => <span key={a} className="dl-route-chip dl-route-agent">{a}</span>)}</div>
                <div className="dl-route"><span>Systems</span>{d.routing.systems.map(s => <span key={s} className="dl-route-chip dl-route-sys">{s}</span>)}</div>
                <div className="dl-route"><span>Workflow</span><span className="dl-route-chip dl-route-wf">{d.routing.workflow}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <textarea className="dl-json" readOnly value={JSON.stringify(toDecisionJSON(d), null, 2)} onClick={e => (e.target as HTMLTextAreaElement).select()} />
        )}
      </div>

      {/* Self-correcting loop */}
      <div className="dl-panel">
        <div className="dl-panel-header">🏢 PROPERTY · FIRST SELF-CORRECTING SYSTEM</div>
        <div className="dl-loop">
          {SELF_CORRECTING_LOOP.map((p, i) => (
            <div key={p.phase} className="dl-loop-wrap">
              <div className="dl-loop-phase" style={{ borderTopColor: p.color }}>
                <div className="dl-loop-head"><span>{p.icon}</span><span style={{ color: p.color }}>{p.phase}</span></div>
                <ul className="dl-loop-items">{p.items.map(it => <li key={it}>{it}</li>)}</ul>
              </div>
              <span className="dl-loop-arrow">{i < SELF_CORRECTING_LOOP.length - 1 ? '→' : '↺'}</span>
            </div>
          ))}
        </div>
        <div className="dl-loop-foot">Occupancy recovery feeds back into the Signal Engine — the loop closes and self-corrects.</div>
      </div>

      {/* Warning + end state */}
      <div className="dl-warn">
        <span className="dl-warn-icon">🚨</span>
        <div>
          <strong>The failure mode to avoid:</strong> expanding domains, agents, and modules without this layer builds a perfect observability system that never acts. End state is not a PMO tool, dashboard, or reporting engine — it is an <strong>autonomous enterprise execution reasoning system</strong>.
        </div>
      </div>
    </div>
  )
}
