import { useState } from 'react'
import {
  BINDING_STEPS, CLOSED_LOOP, ATTRIBUTION_STAGE, SHIFT, OUTCOME_D182,
  scoreColor, toOutcomeJSON, type Effectiveness,
} from '../outcomes/outcomeAttribution'

/* ──────────────────────────────────────────────────────────────────────────
   Outcomes — CIRO Outcome Attribution Layer.
   Decision → expected vs actual → variance → cause → system learning, plus
   before/after state attribution and agent/workflow effectiveness scoring.
   ────────────────────────────────────────────────────────────────────────── */

function EffRow({ e }: { e: Effectiveness }) {
  const c = scoreColor(e.score)
  return (
    <div className="oc-eff">
      <div className="oc-eff-top">
        <span className="oc-eff-name">{e.name}</span>
        <span className="oc-eff-score" style={{ color: c }}>{e.score}</span>
      </div>
      <div className="oc-eff-bar"><div className="oc-eff-fill" style={{ width: `${e.score}%`, background: c }} /></div>
      <div className="oc-eff-note">{e.note}</div>
    </div>
  )
}

export function Outcomes() {
  const [showJSON, setShowJSON] = useState(false)
  const o = OUTCOME_D182
  const varColor = o.variance < 0 ? '#f59e0b' : '#34d399'

  return (
    <div className="oc-root">
      {/* Header */}
      <div className="oc-header">
        <div>
          <span className="oc-title">Outcome Attribution</span>
          <span className="oc-subtitle">CIRO feedback ingestion · did the action improve the system?</span>
        </div>
        <span className="oc-phase-pill">DECISION → RESULT → LEARNING</span>
      </div>

      {/* Shift */}
      <div className="oc-shift">
        <div className="oc-shift-before"><span className="oc-shift-tag">WITHOUT</span>{SHIFT.before}</div>
        <span className="oc-shift-arrow">→</span>
        <div className="oc-shift-after"><span className="oc-shift-tag">WITH</span>{SHIFT.after}</div>
      </div>

      {/* Closed loop ribbon */}
      <div className="oc-loop-ribbon">
        {CLOSED_LOOP.map((s, i) => (
          <span key={s} className="oc-loop-step-wrap">
            <span className={`oc-loop-step ${s === ATTRIBUTION_STAGE ? 'attr' : ''}`}>{s}</span>
            <span className="oc-loop-sep">{i < CLOSED_LOOP.length - 1 ? '→' : '↺'}</span>
          </span>
        ))}
        <span className="oc-loop-caption">Outcome closes the loop — its learning feeds the next Signal</span>
      </div>

      {/* Binding layer */}
      <div className="oc-panel">
        <div className="oc-panel-header">EXECUTION OUTCOME BINDING LAYER</div>
        <div className="oc-binding">
          {BINDING_STEPS.map((b, i) => (
            <div key={b.n} className="oc-bind-wrap">
              <div className="oc-bind" style={{ borderTopColor: b.color }}>
                <div className="oc-bind-top"><span className="oc-bind-num" style={{ background: b.color }}>{b.n}</span><span className="oc-bind-icon">{b.icon}</span><span className="oc-bind-name">{b.name}</span></div>
                <div className="oc-bind-desc">{b.desc}</div>
              </div>
              {i < BINDING_STEPS.length - 1 && <span className="oc-bind-arrow">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Outcome record */}
      <div className="oc-panel oc-record">
        <div className="oc-panel-header oc-record-header">
          <span>⬣ OUTCOME RECORD · {o.decision_id}</span>
          <div className="oc-rec-actions">
            <span className="oc-rec-domain">{o.domain}</span>
            <span className="oc-rec-status">{o.status}</span>
            <button className="oc-json-btn" onClick={() => setShowJSON(s => !s)}>{showJSON ? 'Hide JSON' : '⧉ JSON'}</button>
          </div>
        </div>

        {!showJSON ? (
          <div className="oc-rec-body">
            {/* signal + action */}
            <div className="oc-rec-line"><span className="oc-rec-label">SIGNAL</span>{o.signal}</div>
            <div className="oc-rec-line"><span className="oc-rec-label">ACTION TAKEN</span>{o.action_taken}</div>

            {/* expected vs actual + variance */}
            <div className="oc-vs">
              <div className="oc-vs-cell"><span className="oc-vs-k">Expected</span><span className="oc-vs-v">{o.expected_outcome}</span></div>
              <div className="oc-vs-cell"><span className="oc-vs-k">Actual</span><span className="oc-vs-v" style={{ color: '#93c5fd' }}>{o.actual_outcome}</span></div>
              <div className="oc-vs-cell oc-vs-var" style={{ borderColor: `${varColor}55`, background: `${varColor}14` }}>
                <span className="oc-vs-k">Variance</span><span className="oc-vs-v" style={{ color: varColor }}>{o.variance > 0 ? '+' : ''}{o.variance} pts</span>
              </div>
            </div>
            <div className="oc-var-label">{o.variance_label}</div>

            {/* cause + learning */}
            <div className="oc-rec-line"><span className="oc-rec-label" style={{ color: '#f59e0b' }}>CAUSE</span>{o.cause}</div>
            <div className="oc-learning">
              <span className="oc-rec-label" style={{ color: '#050608' }}>🧠 SYSTEM LEARNING</span>
              {o.system_learning}
            </div>

            {/* before → after */}
            <div className="oc-ba-label">STATE CHANGE ATTRIBUTION · before → after</div>
            <div className="oc-ba">
              {Object.keys(o.before).map(k => (
                <div key={k} className="oc-ba-row">
                  <span className="oc-ba-k">{k}</span>
                  <span className="oc-ba-before">{o.before[k]}</span>
                  <span className="oc-ba-arrow">→</span>
                  <span className="oc-ba-after">{o.after[k]}</span>
                </div>
              ))}
            </div>

            {/* effectiveness scoring */}
            <div className="oc-eff-grid">
              <div className="oc-eff-col">
                <div className="oc-eff-head">🤖 AGENT EFFECTIVENESS</div>
                {o.agent_effectiveness.map(e => <EffRow key={e.name} e={e} />)}
              </div>
              <div className="oc-eff-col">
                <div className="oc-eff-head">🔄 WORKFLOW EFFECTIVENESS</div>
                {o.workflow_effectiveness.map(e => <EffRow key={e.name} e={e} />)}
                <div className="oc-conf">attribution confidence <strong>{Math.round(o.confidence * 100)}%</strong></div>
              </div>
            </div>
          </div>
        ) : (
          <textarea className="oc-json" readOnly value={JSON.stringify(toOutcomeJSON(o), null, 2)} onClick={e => (e.target as HTMLTextAreaElement).select()} />
        )}
      </div>

      {/* What it enables */}
      <div className="oc-panel oc-enables">
        <div className="oc-panel-header">WHAT THIS ENABLES</div>
        <div className="oc-enable-grid">
          <div className="oc-enable"><span>📊</span> Before → After decision impact tracking</div>
          <div className="oc-enable"><span>🎯</span> KPI delta attribution</div>
          <div className="oc-enable"><span>🤖</span> Agent effectiveness scoring</div>
          <div className="oc-enable"><span>🔄</span> Workflow effectiveness scoring</div>
        </div>
        <p className="oc-enable-foot">CIRO ingests each outcome record → the system can finally answer <strong>“did the action improve the system?”</strong> and adjust its own models. This is the self-correcting layer.</p>
      </div>
    </div>
  )
}
