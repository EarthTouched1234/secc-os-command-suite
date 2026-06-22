import { useState } from 'react'
import {
  UNIVERSAL_CAPABILITIES, UNIVERSAL_AGENTS, CONNECTORS, DOMAINS, DIFFERENTIATORS,
  type Domain, type PlatformProfile,
  loadProfile, saveProfile, defaultActivation,
} from '../platform/domains'

/* ──────────────────────────────────────────────────────────────────────────
   Platform — 5-layer Domain Composer for the AI PMO.
   Layer 1 Universal Engine (always on) → Layer 2 Domain → Layer 3 Modules
   → Layer 4 AI Workforce → Layer 5 Connectors. Plus product pyramid +
   differentiator positioning. Activation profile persists per client.
   ────────────────────────────────────────────────────────────────────────── */

interface Props { onPick?: (domainName: string) => void }

export function Platform(_: Props) {
  const [profile, setProfile] = useState<PlatformProfile>(loadProfile)
  const [flash, setFlash] = useState<string | null>(null)

  const activeDomain: Domain | undefined = DOMAINS.find(d => d.id === profile.activeDomain)
  const act = activeDomain ? (profile.activations[activeDomain.id] || defaultActivation(activeDomain)) : null

  const note = (m: string) => { setFlash(m); window.setTimeout(() => setFlash(null), 1800) }

  const persist = (p: PlatformProfile) => { setProfile(p); saveProfile(p) }

  const selectDomain = (d: Domain) => {
    const activations = { ...profile.activations }
    if (!activations[d.id]) activations[d.id] = defaultActivation(d)
    persist({ activeDomain: d.id, activations })
    note(`Composing ${d.name} — saved`)
  }

  const toggle = (kind: 'modules' | 'agents', val: string) => {
    if (!activeDomain || !act) return
    const cur = act[kind]
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]
    persist({
      ...profile,
      activations: { ...profile.activations, [activeDomain.id]: { ...act, [kind]: next } },
    })
  }

  const totalModulesOn = act ? act.modules.length : 0
  const totalAgentsOn = act ? UNIVERSAL_AGENTS.length + act.agents.length : UNIVERSAL_AGENTS.length

  return (
    <div className="pf-root">
      {/* Header */}
      <div className="pf-header">
        <div>
          <span className="pf-title">Platform Composer</span>
          <span className="pf-subtitle">Universal engine · 10 domains · modules · AI workforce · connectors</span>
        </div>
        {activeDomain && (
          <div className="pf-active-pill">
            <span className="pf-active-icon">{activeDomain.icon}</span>
            {activeDomain.name}
            <span className="pf-active-stats">{totalModulesOn} modules · {totalAgentsOn} agents</span>
          </div>
        )}
      </div>

      {flash && <div className="pf-flash">{flash}</div>}

      {/* LAYER 1 — Universal Intelligence Engine */}
      <div className="pf-panel pf-core">
        <div className="pf-panel-header">
          <span>LAYER 1 · UNIVERSAL INTELLIGENCE ENGINE</span>
          <span className="pf-always">● ALWAYS ON · EVERY CUSTOMER</span>
        </div>
        <div className="pf-cap-grid">
          {UNIVERSAL_CAPABILITIES.map(c => (
            <div key={c.name} className="pf-cap"><span className="pf-cap-icon">{c.icon}</span>{c.name}</div>
          ))}
        </div>
      </div>

      {/* LAYER 2 — Business Domains */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>LAYER 2 · BUSINESS DOMAINS</span><span className="pf-hint">select one to compose</span></div>
        <div className="pf-domain-grid">
          {DOMAINS.map(d => (
            <button
              key={d.id}
              className={`pf-domain ${profile.activeDomain === d.id ? 'active' : ''}`}
              onClick={() => selectDomain(d)}
            >
              <span className="pf-domain-icon">{d.icon}</span>
              <span className="pf-domain-name">{d.name}{d.specialty && <span className="pf-spec">specialty</span>}</span>
              <span className="pf-domain-ind">{d.industries.length} industries</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected domain composition */}
      {activeDomain && act && (
        <>
          {/* Industries inherited */}
          <div className="pf-panel">
            <div className="pf-panel-header"><span>{activeDomain.icon} {activeDomain.name.toUpperCase()} · INDUSTRIES INHERITING THIS DOMAIN</span></div>
            <div className="pf-chip-row">
              {activeDomain.industries.map(i => <span key={i} className="pf-ind-chip">{i}</span>)}
            </div>
          </div>

          <div className="pf-two-col">
            {/* LAYER 3 — Functional Modules */}
            <div className="pf-panel">
              <div className="pf-panel-header"><span>LAYER 3 · FUNCTIONAL MODULES</span><span className="pf-hint">{act.modules.length}/{activeDomain.modules.length} on</span></div>
              <div className="pf-toggle-list">
                {activeDomain.modules.map(m => {
                  const on = act.modules.includes(m)
                  return (
                    <button key={m} className={`pf-toggle ${on ? 'on' : ''}`} onClick={() => toggle('modules', m)}>
                      <span className="pf-toggle-box">{on ? '✓' : ''}</span>{m}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LAYER 4 — AI Workforce */}
            <div className="pf-panel">
              <div className="pf-panel-header"><span>LAYER 4 · AI WORKFORCE</span></div>
              <div className="pf-pad">
                <div className="pf-sub">Universal team · always on</div>
                <div className="pf-chip-row">
                  {UNIVERSAL_AGENTS.map(a => <span key={a} className="pf-agent-chip pf-agent-core">🤖 {a}</span>)}
                </div>
                <div className="pf-sub" style={{ marginTop: 10 }}>{activeDomain.name} specialists · toggle</div>
                <div className="pf-toggle-list">
                  {activeDomain.agents.map(a => {
                    const on = act.agents.includes(a)
                    return (
                      <button key={a} className={`pf-toggle ${on ? 'on' : ''}`} onClick={() => toggle('agents', a)}>
                        <span className="pf-toggle-box">{on ? '✓' : ''}</span>{a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 5 — Connectors */}
          <div className="pf-panel">
            <div className="pf-panel-header"><span>LAYER 5 · CONNECTORS</span><span className="pf-hint">domain-relevant highlighted</span></div>
            <div className="pf-chip-row">
              {CONNECTORS.map(c => {
                const rel = activeDomain.connectors.includes(c)
                return <span key={c} className={`pf-conn-chip ${rel ? 'rel' : ''}`}>{rel ? '🔌 ' : ''}{c}</span>
              })}
            </div>
          </div>
        </>
      )}

      {/* Product pyramid */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>THE PRODUCT PYRAMID</span></div>
        <div className="pf-pyramid">
          <div className="pf-pyr-row pf-pyr-top">AI PMO ENTERPRISE PLATFORM</div>
          <div className="pf-pyr-row">Universal Intelligence Engine</div>
          <div className="pf-pyr-row">
            Business Domains
            <span className="pf-pyr-domains">{DOMAINS.map(d => d.icon).join(' ')}</span>
          </div>
          <div className="pf-pyr-row">Functional Modules</div>
          <div className="pf-pyr-row">AI Workforce</div>
          <div className="pf-pyr-row pf-pyr-base">Enterprise Integrations</div>
        </div>
      </div>

      {/* Differentiator */}
      <div className="pf-panel pf-diff">
        <div className="pf-panel-header"><span>BEYOND PROJECT MANAGEMENT — AN OPERATING SYSTEM FOR ENTERPRISE EXECUTION</span></div>
        <div className="pf-pad">
          <p className="pf-diff-lead">Most PMO software manages projects. This combines:</p>
          <div className="pf-diff-grid">
            {DIFFERENTIATORS.map(d => (
              <div key={d.text} className="pf-diff-item"><span>{d.icon}</span> {d.text}</div>
            ))}
          </div>
          <p className="pf-diff-foot">One core platform — serving construction firms, hospitals, property managers, software orgs, governments, manufacturers, and startups — activating only the domain modules each organization needs.</p>
        </div>
      </div>
    </div>
  )
}
