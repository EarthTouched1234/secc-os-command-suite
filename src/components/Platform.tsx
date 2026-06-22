import { useState } from 'react'
import {
  UNIVERSAL_CAPABILITIES, UNIVERSAL_AGENTS, CONNECTORS, DOMAINS, DIFFERENTIATORS,
  PMO_PRIMITIVES, MAX_SECONDARY,
  type Domain, type PlatformProfile,
  loadProfile, saveProfile, domainById,
} from '../platform/domains'

/* ──────────────────────────────────────────────────────────────────────────
   Platform — domain composer organized by EXECUTION PATTERN.
   Customer maps to 1 primary + 0–2 secondary domains. Each domain ships a
   Domain Execution Blueprint (KPIs, agents, workflows, reports, risks,
   connectors) — the layer that turns architecture into product.
   ────────────────────────────────────────────────────────────────────────── */

const BP_SECTIONS: { key: keyof Domain['blueprint']; label: string; icon: string; accent: string }[] = [
  { key: 'kpis', label: 'Default KPIs', icon: '📈', accent: '#34d399' },
  { key: 'agents', label: 'Default Agents', icon: '🤖', accent: '#62a8ff' },
  { key: 'workflows', label: 'Default Workflows', icon: '🔄', accent: '#fbbf24' },
  { key: 'reports', label: 'Default Reports', icon: '📑', accent: '#b58cff' },
  { key: 'risks', label: 'Default Risks', icon: '⚠️', accent: '#ef4444' },
  { key: 'connectors', label: 'Priority Connectors', icon: '🔌', accent: '#64748b' },
]

export function Platform() {
  const [profile, setProfile] = useState<PlatformProfile>(loadProfile)
  const [flash, setFlash] = useState<string | null>(null)

  const viewed = domainById(profile.viewed) || domainById(profile.primary) || DOMAINS[6] // default to Property
  const note = (m: string) => { setFlash(m); window.setTimeout(() => setFlash(null), 1900) }
  const persist = (p: PlatformProfile) => { setProfile(p); saveProfile(p) }

  const view = (d: Domain) => persist({ ...profile, viewed: d.id })

  const setPrimary = (d: Domain) => {
    persist({
      ...profile,
      primary: d.id,
      secondary: profile.secondary.filter(s => s !== d.id), // can't be both
      viewed: d.id,
    })
    note(`${d.name} set as PRIMARY domain`)
  }

  const toggleSecondary = (d: Domain) => {
    if (profile.primary === d.id) { note('Primary domain cannot also be secondary'); return }
    const has = profile.secondary.includes(d.id)
    if (!has && profile.secondary.length >= MAX_SECONDARY) {
      note(`Max ${MAX_SECONDARY} secondary domains — remove one first`); return
    }
    persist({
      ...profile,
      secondary: has ? profile.secondary.filter(s => s !== d.id) : [...profile.secondary, d.id],
      viewed: d.id,
    })
    note(has ? `${d.name} removed from secondary` : `${d.name} added as SECONDARY`)
  }

  const roleOf = (d: Domain): 'primary' | 'secondary' | null =>
    profile.primary === d.id ? 'primary' : profile.secondary.includes(d.id) ? 'secondary' : null

  const primaryD = domainById(profile.primary)

  return (
    <div className="pf-root">
      {/* Header + active assignment */}
      <div className="pf-header">
        <div>
          <span className="pf-title">Platform Composer</span>
          <span className="pf-subtitle">10 execution domains · 1 primary + 0–2 secondary · execution blueprints</span>
        </div>
        <div className="pf-assign-summary">
          <span className="pf-assign-chip pf-assign-primary">
            ★ {primaryD ? primaryD.name : 'No primary set'}
          </span>
          {profile.secondary.map(id => {
            const d = domainById(id)
            return d ? <span key={id} className="pf-assign-chip pf-assign-secondary">+ {d.name}</span> : null
          })}
        </div>
      </div>

      {flash && <div className="pf-flash">{flash}</div>}

      {/* Mapping rule note */}
      <div className="pf-rule">
        <span className="pf-rule-label">MAPPING RULE</span>
        Every customer maps to <strong>1 primary domain + 0–2 secondary domains</strong>. Domains inherit all PMO primitives ({PMO_PRIMITIVES.join(' · ')}) and only change KPIs, workflows, agents, and connector priority.
      </div>

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

      {/* LAYER 2 — Domains */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>LAYER 2 · BUSINESS DOMAINS — BY EXECUTION PATTERN</span><span className="pf-hint">click to view blueprint</span></div>
        <div className="pf-domain-grid">
          {DOMAINS.map(d => {
            const role = roleOf(d)
            return (
              <button
                key={d.id}
                className={`pf-domain ${profile.viewed === d.id ? 'viewing' : ''} ${role ? `role-${role}` : ''}`}
                onClick={() => view(d)}
              >
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

      {/* Viewed domain — execution logic + assignment + blueprint */}
      {viewed && (
        <div className="pf-panel pf-viewed">
          <div className="pf-panel-header">
            <span>{viewed.icon} {viewed.name.toUpperCase()}{viewed.specialty ? ' · STRATEGIC ANCHOR' : ''}</span>
            <div className="pf-assign-actions">
              <button
                className={`pf-assign-btn ${profile.primary === viewed.id ? 'on-primary' : ''}`}
                onClick={() => setPrimary(viewed)}
                disabled={profile.primary === viewed.id}
              >
                {profile.primary === viewed.id ? '★ Primary' : '★ Set Primary'}
              </button>
              <button
                className={`pf-assign-btn ${profile.secondary.includes(viewed.id) ? 'on-secondary' : ''}`}
                onClick={() => toggleSecondary(viewed)}
                disabled={profile.primary === viewed.id}
              >
                {profile.secondary.includes(viewed.id) ? '− Secondary' : '+ Secondary'}
              </button>
            </div>
          </div>

          <div className="pf-pad">
            {/* execution logic + industries */}
            <div className="pf-sub">Core execution logic</div>
            <div className="pf-chip-inline">
              {viewed.executionLogic.map(l => <span key={l} className="pf-logic-chip">{l}</span>)}
            </div>
            <div className="pf-sub" style={{ marginTop: 10 }}>Industries inheriting this domain</div>
            <div className="pf-chip-inline">
              {viewed.industries.map(i => <span key={i} className="pf-ind-chip">{i}</span>)}
            </div>

            {/* Domain Execution Blueprint */}
            <div className="pf-bp-banner">DOMAIN EXECUTION BLUEPRINT — the defaults that ship with this domain</div>
            <div className="pf-bp-grid">
              {BP_SECTIONS.map(s => (
                <div key={s.key} className="pf-bp-card" style={{ borderTopColor: s.accent }}>
                  <div className="pf-bp-head"><span>{s.icon}</span><span style={{ color: s.accent }}>{s.label}</span></div>
                  <div className="pf-bp-items">
                    {viewed.blueprint[s.key].map(item => <span key={item} className="pf-bp-chip">{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Universal AI workforce */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>LAYER 4 · UNIVERSAL AI WORKFORCE</span><span className="pf-hint">every customer · always on</span></div>
        <div className="pf-chip-row">
          {UNIVERSAL_AGENTS.map(a => <span key={a} className="pf-agent-chip pf-agent-core">🤖 {a}</span>)}
        </div>
      </div>

      {/* Connectors */}
      <div className="pf-panel">
        <div className="pf-panel-header"><span>LAYER 5 · CONNECTORS</span><span className="pf-hint">{viewed ? `${viewed.name} priority highlighted` : ''}</span></div>
        <div className="pf-chip-row">
          {CONNECTORS.map(c => {
            const rel = viewed?.blueprint.connectors.includes(c)
            return <span key={c} className={`pf-conn-chip ${rel ? 'rel' : ''}`}>{rel ? '🔌 ' : ''}{c}</span>
          })}
        </div>
      </div>

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
          <div className="pf-pyr-row">Functional Modules · AI Workforce</div>
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
          <p className="pf-diff-foot">One core platform — construction firms, hospitals, property managers, software orgs, governments, manufacturers, startups — activating only the domain blueprints each organization needs.</p>
        </div>
      </div>
    </div>
  )
}
