import { useState } from 'react'
import {
  UNIVERSAL_CAPABILITIES, UNIVERSAL_AGENTS, CONNECTORS, DOMAINS, DIFFERENTIATORS,
  PMO_PRIMITIVES, DOMAIN_QUESTIONS, MAX_SECONDARY,
  type Domain, type PlatformProfile,
  loadProfile, saveProfile, domainById, toExecutionSchema,
} from '../platform/domains'

/* ──────────────────────────────────────────────────────────────────────────
   Platform — domains as BEHAVIORAL EXECUTION ENGINES.
   Each domain renders as a self-contained execution system:
   Execution Profile · AI Workforce · Operational Workflows (loops) ·
   Domain Intelligence Model (KPIs + risk triggers + forecasts) · Connectors.
   ────────────────────────────────────────────────────────────────────────── */

const SEV_COLOR: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }

export function Platform() {
  const [profile, setProfile] = useState<PlatformProfile>(loadProfile)
  const [flash, setFlash] = useState<string | null>(null)
  const [schemaJSON, setSchemaJSON] = useState<string>('')

  const viewed = domainById(profile.viewed) || domainById(profile.primary) || DOMAINS[6] // default: Property
  const note = (m: string) => { setFlash(m); window.setTimeout(() => setFlash(null), 1900) }
  const persist = (p: PlatformProfile) => { setProfile(p); saveProfile(p) }

  const view = (d: Domain) => { persist({ ...profile, viewed: d.id }); setSchemaJSON('') }

  const setPrimary = (d: Domain) => {
    persist({ ...profile, primary: d.id, secondary: profile.secondary.filter(s => s !== d.id), viewed: d.id })
    note(`${d.name} set as PRIMARY`)
  }
  const toggleSecondary = (d: Domain) => {
    if (profile.primary === d.id) { note('Primary cannot also be secondary'); return }
    const has = profile.secondary.includes(d.id)
    if (!has && profile.secondary.length >= MAX_SECONDARY) { note(`Max ${MAX_SECONDARY} secondary domains`); return }
    persist({ ...profile, secondary: has ? profile.secondary.filter(s => s !== d.id) : [...profile.secondary, d.id], viewed: d.id })
    note(has ? `${d.name} removed from secondary` : `${d.name} added as SECONDARY`)
  }
  const roleOf = (d: Domain) => profile.primary === d.id ? 'primary' : profile.secondary.includes(d.id) ? 'secondary' : null
  const primaryD = domainById(profile.primary)

  const exportSchema = () => {
    setSchemaJSON(JSON.stringify(toExecutionSchema(viewed), null, 2))
    note('Execution schema generated below')
  }

  return (
    <div className="pf-root">
      {/* Header + assignment */}
      <div className="pf-header">
        <div>
          <span className="pf-title">Execution Domains</span>
          <span className="pf-subtitle">behavioral execution engines · 1 primary + 0–2 secondary</span>
        </div>
        <div className="pf-assign-summary">
          <span className="pf-assign-chip pf-assign-primary">★ {primaryD ? primaryD.name : 'No primary set'}</span>
          {profile.secondary.map(id => { const d = domainById(id); return d ? <span key={id} className="pf-assign-chip pf-assign-secondary">+ {d.name}</span> : null })}
        </div>
      </div>

      {flash && <div className="pf-flash">{flash}</div>}

      <div className="pf-rule">
        <span className="pf-rule-label">EXECUTION ENGINE</span>
        Each domain is a self-contained execution system — not a label. It inherits all PMO primitives ({PMO_PRIMITIVES.join(' · ')}) and defines its own profile, agents, workflow loops, and decision logic. Customer maps to <strong>1 primary + 0–2 secondary</strong> domains.
      </div>

      {/* LAYER 1 — Universal Engine */}
      <div className="pf-panel pf-core">
        <div className="pf-panel-header"><span>LAYER 1 · UNIVERSAL INTELLIGENCE ENGINE</span><span className="pf-always">● ALWAYS ON</span></div>
        <div className="pf-cap-grid">
          {UNIVERSAL_CAPABILITIES.map(c => <div key={c.name} className="pf-cap"><span className="pf-cap-icon">{c.icon}</span>{c.name}</div>)}
        </div>
      </div>

      {/* LAYER 2 — Domains */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>EXECUTION DOMAINS</span><span className="pf-hint">click to open execution system</span></div>
        <div className="pf-domain-grid">
          {DOMAINS.map(d => {
            const role = roleOf(d)
            return (
              <button key={d.id} className={`pf-domain ${profile.viewed === d.id ? 'viewing' : ''} ${role ? `role-${role}` : ''}`} onClick={() => view(d)}>
                <div className="pf-domain-top">
                  <span className="pf-domain-icon">{d.icon}</span>
                  {role === 'primary' && <span className="pf-badge pf-badge-primary">★ PRIMARY</span>}
                  {role === 'secondary' && <span className="pf-badge pf-badge-secondary">SECONDARY</span>}
                  {d.specialty && !role && <span className="pf-spec">anchor</span>}
                </div>
                <span className="pf-domain-name">{d.name}</span>
                <span className="pf-domain-logic">{d.executionLogic.slice(0, 2).join(' · ')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Viewed domain — full execution system */}
      {viewed && (
        <div className="pf-panel pf-viewed">
          <div className="pf-panel-header">
            <span>{viewed.icon} {viewed.name.toUpperCase()} · EXECUTION SYSTEM{viewed.specialty ? ' · ANCHOR' : ''}</span>
            <div className="pf-assign-actions">
              <button className={`pf-assign-btn ${profile.primary === viewed.id ? 'on-primary' : ''}`} onClick={() => setPrimary(viewed)} disabled={profile.primary === viewed.id}>{profile.primary === viewed.id ? '★ Primary' : '★ Set Primary'}</button>
              <button className={`pf-assign-btn ${profile.secondary.includes(viewed.id) ? 'on-secondary' : ''}`} onClick={() => toggleSecondary(viewed)} disabled={profile.primary === viewed.id}>{profile.secondary.includes(viewed.id) ? '− Secondary' : '+ Secondary'}</button>
              <button className="pf-assign-btn" onClick={exportSchema}>⧉ Schema</button>
            </div>
          </div>

          <div className="pf-pad">
            {/* 1 · Execution Profile */}
            <div className="pf-comp-label"><span className="pf-comp-num">1</span> EXECUTION PROFILE <span className="pf-comp-sub">what "good" looks like</span></div>
            <div className="pf-chip-inline">
              {viewed.schema.executionProfile.map(s => <span key={s} className="pf-signal-chip">✓ {s}</span>)}
            </div>

            {/* 2 · AI Workforce */}
            <div className="pf-comp-label"><span className="pf-comp-num">2</span> AI WORKFORCE <span className="pf-comp-sub">domain agents that auto-spawn</span></div>
            <div className="pf-chip-inline">
              {viewed.schema.agents.map(a => <span key={a} className="pf-agent-chip pf-agent-dom">🤖 {a}</span>)}
            </div>

            {/* 3 · Operational Workflows (loops) */}
            <div className="pf-comp-label"><span className="pf-comp-num">3</span> OPERATIONAL WORKFLOWS <span className="pf-comp-sub">execution loops</span></div>
            <div className="pf-loops">
              {viewed.schema.workflows.map(w => (
                <div key={w.name} className="pf-loop">
                  <span className="pf-loop-name">{w.name}</span>
                  <div className="pf-loop-chain">
                    {w.stages.map((s, i) => (
                      <span key={s} className="pf-loop-stage-wrap">
                        <span className="pf-loop-stage">{s}</span>
                        {i < w.stages.length - 1 && <span className="pf-loop-arrow">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 4 · Domain Intelligence Model */}
            <div className="pf-comp-label"><span className="pf-comp-num">4</span> DOMAIN INTELLIGENCE MODEL <span className="pf-comp-sub">how decisions are made</span></div>
            <div className="pf-intel-grid">
              <div className="pf-intel-card">
                <div className="pf-intel-head" style={{ color: '#34d399' }}>📈 KPIs</div>
                <div className="pf-bp-items">{viewed.schema.kpis.map(k => <span key={k} className="pf-bp-chip">{k}</span>)}</div>
              </div>
              <div className="pf-intel-card">
                <div className="pf-intel-head" style={{ color: '#b58cff' }}>🔮 Forecast Models</div>
                <div className="pf-forecast-list">
                  {viewed.schema.forecastModels.map(f => (
                    <div key={f.name} className="pf-forecast"><span className="pf-forecast-name">{f.name}</span><span className="pf-forecast-logic">{f.logic}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk triggers — the decision logic */}
            <div className="pf-trigger-banner">⚡ RISK TRIGGERS · signal → automated action</div>
            <div className="pf-triggers">
              {viewed.schema.riskTriggers.map(t => (
                <div key={t.signal} className="pf-trigger" style={{ borderLeftColor: SEV_COLOR[t.severity] }}>
                  <span className="pf-trigger-sev" style={{ background: `${SEV_COLOR[t.severity]}22`, color: SEV_COLOR[t.severity], borderColor: `${SEV_COLOR[t.severity]}55` }}>{t.severity}</span>
                  <span className="pf-trigger-signal">{t.signal}</span>
                  <span className="pf-trigger-arrow">→</span>
                  <span className="pf-trigger-action">{t.action}</span>
                </div>
              ))}
            </div>

            {/* Connectors */}
            <div className="pf-comp-label"><span className="pf-comp-num">5</span> PRIORITY CONNECTORS</div>
            <div className="pf-chip-inline">
              {CONNECTORS.map(c => { const rel = viewed.schema.connectors.includes(c); return <span key={c} className={`pf-conn-chip ${rel ? 'rel' : ''}`}>{rel ? '🔌 ' : ''}{c}</span> })}
            </div>

            {schemaJSON && (
              <>
                <div className="pf-comp-label" style={{ marginTop: 14 }}>DOMAIN EXECUTION SCHEMA <span className="pf-comp-sub">JSON contract</span></div>
                <textarea className="pf-schema" readOnly value={schemaJSON} onClick={e => (e.target as HTMLTextAreaElement).select()} />
              </>
            )}
          </div>
        </div>
      )}

      {/* 5 questions every domain must answer */}
      <div className="pf-panel pf-questions">
        <div className="pf-panel-header"><span>EVERY DOMAIN MUST ANSWER</span></div>
        <div className="pf-q-grid">
          {DOMAIN_QUESTIONS.map((q, i) => <div key={q} className="pf-q"><span className="pf-q-num">{i + 1}</span>{q}</div>)}
        </div>
      </div>

      {/* Universal workforce + pyramid + differentiator */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>UNIVERSAL AI WORKFORCE</span><span className="pf-hint">every customer · always on</span></div>
        <div className="pf-chip-row">{UNIVERSAL_AGENTS.map(a => <span key={a} className="pf-agent-chip pf-agent-core">🤖 {a}</span>)}</div>
      </div>

      <div className="pf-panel">
        <div className="pf-panel-header"><span>ENTERPRISE INTELLIGENCE OS</span></div>
        <div className="pf-pyramid">
          <div className="pf-pyr-row pf-pyr-top">ENTERPRISE INTELLIGENCE OS</div>
          <div className="pf-pyr-row">Universal Intelligence Engine</div>
          <div className="pf-pyr-row">Execution Domains (Behavior Systems) <span className="pf-pyr-domains">{DOMAINS.map(d => d.icon).join(' ')}</span></div>
          <div className="pf-pyr-row">AI Workforce · Workflow Engine</div>
          <div className="pf-pyr-row pf-pyr-base">Insight + Decision Engine</div>
        </div>
      </div>

      <div className="pf-panel pf-diff">
        <div className="pf-panel-header"><span>A MULTI-DOMAIN EXECUTION SIMULATOR FOR ORGANIZATIONS</span></div>
        <div className="pf-pad">
          <p className="pf-diff-lead">Not PMO software. Not a BI dashboard. Each domain is a mini operating system with its own rules, agents, and decision logic:</p>
          <div className="pf-diff-grid">{DIFFERENTIATORS.map(d => <div key={d.text} className="pf-diff-item"><span>{d.icon}</span> {d.text}</div>)}</div>
          <p className="pf-diff-foot">Next evolution → <strong>Phase 2: AI Decision Layer</strong> — the system stops reporting and starts intervening, recommending, auto-triggering workflows, and simulating outcomes.</p>
        </div>
      </div>
    </div>
  )
}
