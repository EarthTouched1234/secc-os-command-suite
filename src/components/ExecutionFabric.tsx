import {
  ARCH_STACK, CLOSED_LOOP, FABRIC_STAGES, FABRIC_FUNCTIONS, EXAMPLE_ACTION,
  ORCHESTRATION, DECISION_ACTION_MAP, PROPERTY_EXEC_MAP, GUARDRAILS, STRATEGIC,
  toActionJSON, type ExecStatus,
} from '../execution/executionFabric'

/* ──────────────────────────────────────────────────────────────────────────
   Execution Fabric — the actuator layer. Renders the closed loop, the
   architecture insertion, the 4 fabric functions, the Action Object, the
   multi-system orchestration with verification, mapping tables, and guardrails.
   ────────────────────────────────────────────────────────────────────────── */

const STATUS: Record<ExecStatus, { label: string; color: string; icon: string }> = {
  verified:  { label: 'verified',  color: '#34d399', icon: '✓' },
  pending:   { label: 'pending',   color: '#f59e0b', icon: '⟳' },
  recovered: { label: 'recovered', color: '#62a8ff', icon: '↻' },
  failed:    { label: 'failed',    color: '#ef4444', icon: '✗' },
}

export function ExecutionFabric() {
  return (
    <div className="xf-root">
      {/* Header */}
      <div className="xf-header">
        <div>
          <span className="xf-title">Execution Fabric</span>
          <span className="xf-subtitle">the actuator layer · Decision Object → real system actions</span>
        </div>
        <span className="xf-phase-pill">INTELLIGENCE → OPERATING SYSTEM</span>
      </div>

      {/* Full closed loop ribbon */}
      <div className="xf-loop-ribbon">
        {CLOSED_LOOP.map((s, i) => (
          <span key={s} className="xf-loop-step-wrap">
            <span className={`xf-loop-step ${FABRIC_STAGES.includes(s) ? 'fabric' : ''}`}>{s}</span>
            <span className="xf-loop-sep">{i < CLOSED_LOOP.length - 1 ? '→' : '↺'}</span>
          </span>
        ))}
        <span className="xf-loop-caption">the self-correcting enterprise loop · Execute + Verify are the Fabric</span>
      </div>

      {/* Architecture insertion */}
      <div className="xf-panel">
        <div className="xf-panel-header">ARCHITECTURE — EXECUTION FABRIC INSERTION</div>
        <div className="xf-arch">
          {ARCH_STACK.map((a, i) => (
            <div key={a.name} className="xf-arch-wrap">
              <div className={`xf-arch-row ${a.isNew ? 'xf-arch-new' : ''}`} style={{ borderLeftColor: a.color }}>
                <span className="xf-arch-name" style={a.isNew ? { color: a.color } : undefined}>{a.name}</span>
                {a.isNew && <span className="xf-arch-tag">NEW · critical</span>}
              </div>
              {i < ARCH_STACK.length - 1 && <span className="xf-arch-down">↓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 4 fabric functions */}
      <div className="xf-panel">
        <div className="xf-panel-header">THE 4 FUNCTIONS OF THE FABRIC</div>
        <div className="xf-fn-grid">
          {FABRIC_FUNCTIONS.map(f => (
            <div key={f.name} className="xf-fn" style={{ borderTopColor: f.color }}>
              <div className="xf-fn-top"><span className="xf-fn-num" style={{ background: f.color }}>{f.n}</span><span className="xf-fn-icon">{f.icon}</span><span className="xf-fn-name">{f.name}</span></div>
              <div className="xf-fn-desc">{f.desc}</div>
              <ul className="xf-fn-bullets">{f.bullets.map(b => <li key={b}><span style={{ color: f.color }}>▸</span> {b}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>

      <div className="xf-two-col">
        {/* Action Object */}
        <div className="xf-panel">
          <div className="xf-panel-header">⬡ ACTION OBJECT · EXECUTABLE COMMAND</div>
          <textarea className="xf-json" readOnly value={JSON.stringify(toActionJSON(EXAMPLE_ACTION), null, 2)} onClick={e => (e.target as HTMLTextAreaElement).select()} />
        </div>

        {/* Guardrails */}
        <div className="xf-panel xf-guard">
          <div className="xf-panel-header" style={{ color: '#fca5a5' }}>⚠️ GUARDRAILS — OR IT GOES ROGUE</div>
          <div className="xf-pad">
            <p className="xf-warn-note">Unconstrained, the fabric causes action duplication, system conflicts, and runaway loops. It must enforce:</p>
            {GUARDRAILS.map(g => (
              <div key={g.name} className="xf-guard-row"><span className="xf-guard-icon">{g.icon}</span><span className="xf-guard-name">{g.name}</span><span className="xf-guard-desc">{g.desc}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-system orchestration + verification */}
      <div className="xf-panel">
        <div className="xf-panel-header">🏢 PROPERTY · OCCUPANCY DROP — ONE DECISION → MANY SYSTEMS</div>
        <div className="xf-orch">
          {ORCHESTRATION.map(a => {
            const st = STATUS[a.status]
            return (
              <div key={a.system} className="xf-orch-row" style={{ borderLeftColor: st.color }}>
                <span className="xf-orch-sys"><span className="xf-orch-icon">{a.icon}</span>{a.system}</span>
                <span className="xf-orch-action">{a.action}</span>
                <span className="xf-orch-detail">{a.detail}</span>
                <span className="xf-orch-status" style={{ color: st.color, borderColor: `${st.color}55`, background: `${st.color}18` }}>{st.icon} {st.label}</span>
              </div>
            )
          })}
        </div>
        <div className="xf-orch-foot">Verification loop confirms each landed; the Power BI call failed once and auto-recovered on retry.</div>
      </div>

      {/* Decision → Action mapping */}
      <div className="xf-panel">
        <div className="xf-panel-header">DECISION → ACTION MAPPING · TYPE → SYSTEM ACTION → AGENT → WORKFLOW</div>
        <div className="xf-table">
          <div className="xf-tr xf-th"><span>Decision</span><span>System Action</span><span>Agent</span><span>Workflow</span></div>
          {DECISION_ACTION_MAP.map(r => (
            <div key={r.decision} className="xf-tr">
              <span className="xf-td-decision">{r.decision}</span>
              <span className="xf-td-mono">{r.systemAction}</span>
              <span className="xf-td-agent">{r.agent}</span>
              <span className="xf-td-wf">{r.workflow}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Property decision → execution */}
      <div className="xf-two-col">
        <div className="xf-panel">
          <div className="xf-panel-header">PROPERTY · DECISION → EXECUTION</div>
          <div className="xf-map">
            {PROPERTY_EXEC_MAP.map(r => (
              <div key={r.decision} className="xf-map-row">
                <span className="xf-map-dec">{r.decision}</span>
                <span className="xf-map-arrow">→</span>
                <span className="xf-map-exec">{r.execution}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic before/now/next */}
        <div className="xf-panel">
          <div className="xf-panel-header">THE SHIFT</div>
          <div className="xf-pad">
            {STRATEGIC.map(s => (
              <div key={s.stage} className="xf-strat-row" style={{ borderLeftColor: s.color }}>
                <span className="xf-strat-stage" style={{ color: s.color }}>{s.stage}</span>
                <span className="xf-strat-label">{s.label}</span>
              </div>
            ))}
            <p className="xf-strat-foot">With the Fabric: <strong>AI decides, the system acts, humans supervise exceptions only.</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
