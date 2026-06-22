import { useState, useCallback } from 'react'

/* ──────────────────────────────────────────────────────────────────────────
   GUARDiAN PMO Command — Go-To-Market tool
   Source: 00_Command_Center_Core/2026-06-21__GUARDiAN-PMO-Command__Brand-Package__Active.md
   Built by Agent Council (TiTO + SunNi) · June 21, 2026
   ────────────────────────────────────────────────────────────────────────── */

type Section = 'Brand' | 'Market' | 'Services' | 'Website Copy' | 'Pricing' | 'Positioning' | 'GTM Plan'
const SECTIONS: Section[] = ['Brand', 'Market', 'Services', 'Website Copy', 'Pricing', 'Positioning', 'GTM Plan']

// Brand palette (from package)
const PALETTE = [
  { name: 'Midnight Black', hex: '#050608', role: 'Authority, premium' },
  { name: 'Solar Gold',     hex: '#f5c518', role: 'Command, excellence' },
  { name: 'Trajectory Blue', hex: '#3b82f6', role: 'Velocity, clarity' },
  { name: 'Signal Red',     hex: '#ef4444', role: 'Risk, escalation' },
  { name: 'Titanium Grey',  hex: '#64748b', role: 'Industrial trust' },
]

const MARKET = [
  { metric: 'Industry market size', figure: '$29 billion' },
  { metric: 'R&D investment (% of revenue)', figure: '~5% (~$1.45B/yr project spend)' },
  { metric: 'Workforce', figure: '~170,000 people' },
  { metric: 'Geographic reach', figure: '100+ countries' },
  { metric: 'Addressable PMO software spend', figure: '~$29M/yr in this vertical alone' },
]

const SERVICE_BRANDS = [
  { build: 'GUARDiAN Zero-Trust Layer', brand: 'Zero-Trust Ops', tagline: 'AI manages. You command.' },
  { build: 'Auto-Status Sync', brand: 'Status Scribe', tagline: 'Zero admin. Always current.' },
  { build: 'Gate Snapshot & Archive', brand: 'Mission Archive', tagline: 'Every gate. Versioned. Auditable.' },
  { build: 'Trajectory + Acceleration%', brand: 'Trajectory Control', tagline: 'Momentum intelligence.' },
  { build: 'Financial Sentinel', brand: 'Financial Sentinel', tagline: 'Burn rate. Risk. Auto-escalation.' },
  { build: 'PMBOK® Gate Mapping', brand: 'Mission Alignment', tagline: 'PMBOK® 8th. Always compliant.' },
]

const SERVICE_CARDS = [
  { n: '1', title: 'Mission Control Console', body: 'See every project, every milestone, every risk — live. Your entire PMO, visualized and prioritized in one command-grade dashboard.' },
  { n: '2', title: 'Status Scribe (Autonomous Status Engine)', body: 'No more waiting for updates or chasing teams. GUARDiAN pulls live data, assembles status reports, and notifies you — before you ever ask.' },
  { n: '3', title: 'Financial Sentinel', body: '24/7 burn rate surveillance and risk escalation. GUARDiAN scans for hidden issues, flags anomalies, and surfaces critical threats the instant they emerge — and auto-files them to the Risk Register.' },
  { n: '4', title: 'Trajectory Control', body: 'Forecasts, momentum intelligence, and velocity + acceleration on every program — automatically computed from live execution data. Know if you’re winning or drifting before the gate.' },
  { n: '5', title: 'Zero-Trust Ops', body: 'AI executes the machinery. You hold the launch key. Every protected action — financial, architectural, security — requires your authorization token before it runs. The answer to enterprise’s #1 AI fear.' },
  { n: '6', title: 'Mission Alignment (PMBOK® Gate Mapping)', body: 'Every gate aligned to PMBOK® 8th Edition principles. Exit criteria enforced. Your governance speaks the language enterprise buyers already know and trust.' },
]

const PROBLEMS = [
  { h: 'Status Blindness', b: 'You chase updates. Projects stall in silence. By the time you see red, it’s already critical.' },
  { h: 'Manual Mayhem', b: 'Status reports, risk logs, and executive decks — hours lost to copy-paste and spreadsheet herding.' },
  { h: 'Risk Ambush', b: 'Issues hide until they explode. You’re left firefighting instead of steering the ship.' },
  { h: 'Command Drift', b: 'With every new tool or consultant, your PMO grows noisier — but not wiser. No central source of truth.' },
]

const SOLUTIONS = [
  { h: 'Status Blindness, Eliminated', b: 'Real-time, AI-driven project visibility. Every status, every change, surfaced — no chasing, no surprises.' },
  { h: 'Manual Mayhem, Obliterated', b: 'The platform writes your reports, tracks your risks, and completes audit trails — autonomously.' },
  { h: 'Risk Ambush, Neutralized', b: 'Continuous monitoring flags risk patterns and emerging threats before they derail delivery.' },
  { h: 'Command Drift, Resolved', b: 'One central mission dashboard — your entire project universe, unified for decisive action.' },
]

const TESTIMONIALS = [
  { q: 'GUARDiAN didn’t just automate our PMO — it gave us real command. I see project risks before they happen and surface wins instantly.', who: 'SCADA Program Director, Global Energy Firm' },
  { q: 'The time savings are staggering. I went from drowning in status reports to leading the transformation agenda.', who: 'Director of Enterprise Transformation, Fortune 100' },
  { q: 'We finally have a single source of project truth — no more tool sprawl or status lag. GUARDiAN made our PMO proactive.', who: 'Head of PMO, Financial Services' },
]

const PRICING = [
  {
    name: 'FLIGHT DECK', price: '$2,000/mo', year: '$20,000/yr', accent: '#64748b',
    who: 'For growing PMO teams (up to 10 programs)',
    feats: ['Autonomous status reporting (Status Scribe)', 'Mission Control dashboard', 'Risk Sentinel basic monitoring', 'Standard executive brief templates', 'Email & chat support · Secure data vault'],
  },
  {
    name: 'TRAJECTORY', price: '$5,000/mo', year: '$50,000/yr', accent: '#3b82f6',
    who: 'For scaling organizations (up to 50 programs)',
    feats: ['Everything in Flight Deck', 'Trajectory Control + Acceleration% intelligence', 'Advanced risk modeling + Financial Sentinel', 'Zero-Trust Ops enforcement', 'Integrations (Jira, SAP, ServiceNow, Ignition, etc.)', 'Priority onboarding + dedicated PMO success manager'],
  },
  {
    name: 'SOVEREIGN', price: '$15,000/mo', year: '$150,000/yr', accent: '#f5c518', featured: true,
    who: 'For enterprise and regulated industries (unlimited programs)',
    feats: ['Everything in Trajectory', 'Unlimited programs and teams', 'Full Sovereign Data Vault (dedicated, encrypted)', 'Custom compliance + audit trails (SOC 2, ISO 27001 ready)', 'Mission Alignment (PMBOK® custom gate framework)', 'AI-driven forecasting and simulation', 'Custom AI agents for your org', 'Onsite / virtual executive workshop · Enterprise SLA'],
  },
  {
    name: 'CRITICAL INFRASTRUCTURE', price: 'Custom', year: 'from $250,000/yr', accent: '#ef4444',
    who: 'For energy, utilities, defense, and regulated critical systems (100+ countries)',
    feats: ['Everything in Sovereign', 'Multi-region deployment with data residency controls', 'Safety-critical integration (OPC-UA, Modbus, SCADA protocols)', 'Dedicated GUARDiAN enforcement council', 'Regulatory compliance (NERC CIP, IEC 62443, etc.)', 'On-site implementation team', 'Executive sponsor-level SLA', 'Custom AI agent training on your operational data'],
  },
]

const OBJECTIONS = [
  {
    q: 'Can we trust AI to handle real governance? What about compliance?',
    a: 'GUARDiAN PMO Command is built on zero-trust architecture: every action is logged, every status is auditable, every decision traceable — by design. GUARDiAN enforces human authorization on every protected action. Full compliance, always.',
  },
  {
    q: 'We already have tools (Jira, Asana, ServiceNow). Why add another?',
    a: 'GUARDiAN sits above your tools — not another tracker, but the command layer that unifies, audits, and elevates every status across your stack. No rip and replace. Amplify what you have.',
  },
  {
    q: 'How do we know this is different from every other AI-PMO tool?',
    a: 'Name one tool that shows you velocity AND acceleration on every program — whether your momentum is building or dying — before the gate misses. We’re the only one. That’s not a feature. That’s a different category.',
  },
]

const GTM_STEPS = [
  { h: 'SCADA as the anchor case study', b: 'Safety-critical industrial integration. First enterprise proof point. Document every gate transition, health score, and risk intercept. Package as a case study before Gate 2.' },
  { h: 'Direct outreach to PMO Directors', b: 'LinkedIn (via SSIE Direct Publisher), targeted to Head of PMO and Dir of Enterprise Transformation. Lead with the trajectory signal — "Do you know if your projects are improving or just staying the same?"' },
  { h: 'Pilot offer', b: 'First 3 clients get Flight Deck at $0 for 90 days in exchange for a testimonial and case study. Convert to Trajectory tier after 90 days.' },
  { h: 'Revenue target', b: '3 clients at $2K/mo = $6K MRR → upgrade 1 to Trajectory at $5K = $13K MRR → 1 Sovereign at $12K = $25K MRR. Hit $100K ARR within 6 months of first client.' },
  { h: 'Enterprise inbound', b: 'PMBOK® alignment means every PMP certification holder is a potential referral. Conference presence at PMI Global Summit.' },
]

const NASA_ROLES = [
  { role: 'Mission Director', who: 'Cartez Harris', note: 'Launch authority — approves all protected actions' },
  { role: 'Flight Director', who: 'GUARDiAN PMO Command', note: 'Sees the full board, coordinates everything' },
  { role: 'Flight Controllers', who: 'AI Agents', note: 'Each owns a domain: status, risk, finance, trajectory' },
  { role: 'Active Missions', who: 'Client Programs', note: 'The live portfolio under command' },
]

// Reusable copy-to-clipboard button
function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(() => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }, [text])
  return (
    <button className="gtm-copy-btn" onClick={onCopy} title="Copy to clipboard">
      {copied ? '✓ Copied' : `⧉ ${label}`}
    </button>
  )
}

export function GTM() {
  const [section, setSection] = useState<Section>('Brand')

  return (
    <div className="gtm-root">
      {/* Header */}
      <div className="gtm-header">
        <div className="gtm-brandmark">
          <span className="gtm-product">GUARDiAN PMO Command</span>
          <span className="gtm-tagline">Status Writes Itself. You Command the Mission.</span>
        </div>
        <div className="gtm-voice-pill">SOVEREIGN · RELENTLESS · DECISIVE</div>
      </div>

      {/* Section nav */}
      <div className="gtm-nav">
        {SECTIONS.map(s => (
          <button key={s} className={s === section ? 'active' : ''} onClick={() => setSection(s)}>{s}</button>
        ))}
      </div>

      <div className="gtm-body">

        {/* ── BRAND ─────────────────────────────────────────────── */}
        {section === 'Brand' && (
          <>
            <div className="gtm-panel">
              <div className="gtm-panel-header">BRAND IDENTITY</div>
              <div className="gtm-pad">
                <div className="gtm-id-row"><span className="gtm-id-label">Product</span><span className="gtm-id-val">GUARDiAN PMO Command</span></div>
                <div className="gtm-id-row"><span className="gtm-id-label">Tagline</span><span className="gtm-id-val gtm-gold">"Status Writes Itself. You Command the Mission."</span></div>
                <div className="gtm-id-row"><span className="gtm-id-label">Voice</span><span className="gtm-id-val">Sovereign. Relentless. Decisive.</span></div>
                <div className="gtm-id-row"><span className="gtm-id-label">Category</span><span className="gtm-id-val">AI PMO Governance Intelligence Engine</span></div>
              </div>
            </div>

            <div className="gtm-panel">
              <div className="gtm-panel-header">COLOR PALETTE</div>
              <div className="gtm-swatches">
                {PALETTE.map(c => (
                  <div key={c.name} className="gtm-swatch">
                    <div className="gtm-swatch-chip" style={{ background: c.hex, border: c.hex === '#050608' ? '1px solid #333' : 'none' }} />
                    <div className="gtm-swatch-name">{c.name}</div>
                    <div className="gtm-swatch-hex">{c.hex}</div>
                    <div className="gtm-swatch-role">{c.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gtm-panel gtm-positioning-banner">
              <div className="gtm-panel-header">POSITIONING STATEMENT</div>
              <div className="gtm-pad">
                <p className="gtm-quote">"Command every project, every status, every risk — autonomously. GUARDiAN PMO Command delivers unbreakable project governance, real-time control, and zero-trust intelligence, so you write the mission, not the report."</p>
                <CopyBtn text='Command every project, every status, every risk — autonomously. GUARDiAN PMO Command delivers unbreakable project governance, real-time control, and zero-trust intelligence, so you write the mission, not the report.' label="Copy statement" />
              </div>
            </div>
          </>
        )}

        {/* ── MARKET ────────────────────────────────────────────── */}
        {section === 'Market' && (
          <>
            <div className="gtm-panel">
              <div className="gtm-panel-header">MARKET INTELLIGENCE — SCADA / ENERGY MANAGEMENT &amp; AUTOMATION</div>
              <div className="gtm-table">
                {MARKET.map(m => (
                  <div key={m.metric} className="gtm-table-row">
                    <span className="gtm-table-metric">{m.metric}</span>
                    <span className="gtm-table-figure">{m.figure}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gtm-callout">
              <span className="gtm-callout-kicker">THE BEACHHEAD</span>
              <p>Energy management and automation companies operate regulated, safety-critical, multi-country programs at industrial scale. They don't buy $12K/mo SaaS — they buy <strong>$150K–$500K/yr enterprise contracts</strong> with SLAs, dedicated support, and audit-grade compliance.</p>
              <p className="gtm-callout-punch">SCADA is not a test project. SCADA is the beachhead into a $29B market.</p>
            </div>
          </>
        )}

        {/* ── SERVICES ──────────────────────────────────────────── */}
        {section === 'Services' && (
          <>
            <div className="gtm-panel">
              <div className="gtm-panel-header">6 SERVICE BRANDS — BUILD → BRAND</div>
              <div className="gtm-service-map">
                {SERVICE_BRANDS.map(s => (
                  <div key={s.brand} className="gtm-service-map-row">
                    <span className="gtm-svc-build">{s.build}</span>
                    <span className="gtm-svc-arrow">→</span>
                    <span className="gtm-svc-brand">{s.brand}</span>
                    <span className="gtm-svc-tagline">{s.tagline}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gtm-panel">
              <div className="gtm-panel-header">SERVICE CARDS — SALES-READY COPY</div>
              <div className="gtm-card-grid">
                {SERVICE_CARDS.map(c => (
                  <div key={c.n} className="gtm-svc-card">
                    <div className="gtm-svc-card-top">
                      <span className="gtm-svc-num">{c.n}</span>
                      <span className="gtm-svc-card-title">{c.title}</span>
                    </div>
                    <p className="gtm-svc-card-body">{c.body}</p>
                    <CopyBtn text={`${c.title}\n\n${c.body}`} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── WEBSITE COPY ──────────────────────────────────────── */}
        {section === 'Website Copy' && (
          <>
            <div className="gtm-panel gtm-hero-panel">
              <div className="gtm-panel-header">HERO SECTION</div>
              <div className="gtm-pad">
                <h2 className="gtm-hero-headline">Status Writes Itself.<br />You Command the Mission.</h2>
                <p className="gtm-hero-sub">The world's first autonomous PMO command platform. Real-time project clarity, risk detection, and executive reporting — without the grind. Step onto the Flight Deck and take control.</p>
                <div className="gtm-cta-row">
                  <span className="gtm-cta-primary">Activate Command Now</span>
                  <span className="gtm-cta-secondary">Book a Flight Deck Demo</span>
                  <span className="gtm-cta-secondary">Talk to the Council</span>
                </div>
                <CopyBtn text={'Status Writes Itself. You Command the Mission.\n\nThe world’s first autonomous PMO command platform. Real-time project clarity, risk detection, and executive reporting — without the grind. Step onto the Flight Deck and take control.\n\n[Activate Command Now]'} label="Copy hero" />
              </div>
            </div>

            <div className="gtm-two-col">
              <div className="gtm-panel">
                <div className="gtm-panel-header" style={{ color: '#ef4444' }}>THE PROBLEM</div>
                <div className="gtm-pad gtm-stack">
                  {PROBLEMS.map(p => (
                    <div key={p.h} className="gtm-pain-row gtm-pain">
                      <span className="gtm-pain-h">{p.h}</span>
                      <span className="gtm-pain-b">{p.b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gtm-panel">
                <div className="gtm-panel-header" style={{ color: '#22c55e' }}>THE SOLUTION</div>
                <div className="gtm-pad gtm-stack">
                  {SOLUTIONS.map(p => (
                    <div key={p.h} className="gtm-pain-row gtm-gain">
                      <span className="gtm-pain-h">{p.h}</span>
                      <span className="gtm-pain-b">{p.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="gtm-panel">
              <div className="gtm-panel-header">SOCIAL PROOF — TEMPLATES (SCADA + NEXT CLIENTS)</div>
              <div className="gtm-pad gtm-stack">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="gtm-testimonial">
                    <p>"{t.q}"</p>
                    <span className="gtm-testimonial-who">— {t.who}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gtm-callout gtm-final-cta">
              <span className="gtm-callout-kicker">FINAL CTA</span>
              <p className="gtm-callout-punch">"Your mission is too important to run on status reports."</p>
              <p>The world's most sophisticated PMO teams don't chase updates — they command outcomes. GUARDiAN PMO Command gives you the Flight Deck to do exactly that.</p>
            </div>
          </>
        )}

        {/* ── PRICING ───────────────────────────────────────────── */}
        {section === 'Pricing' && (
          <div className="gtm-pricing-grid">
            {PRICING.map(t => (
              <div key={t.name} className={`gtm-price-card ${t.featured ? 'gtm-price-featured' : ''}`} style={{ borderTopColor: t.accent }}>
                {t.featured && <div className="gtm-price-flag">MOST POPULAR</div>}
                <div className="gtm-price-name" style={{ color: t.accent }}>{t.name}</div>
                <div className="gtm-price-amount">{t.price}</div>
                <div className="gtm-price-year">{t.year}</div>
                <div className="gtm-price-who">{t.who}</div>
                <ul className="gtm-price-feats">
                  {t.feats.map((f, i) => <li key={i}><span style={{ color: t.accent }}>▸</span> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ── POSITIONING ───────────────────────────────────────── */}
        {section === 'Positioning' && (
          <>
            <div className="gtm-panel">
              <div className="gtm-panel-header">BUYER PERSONA</div>
              <div className="gtm-pad">
                <div className="gtm-id-row"><span className="gtm-id-label">Titles</span><span className="gtm-id-val">Head of PMO · Director of Enterprise Transformation · Chief Project Officer · VP of Operations · PMO Technology Lead</span></div>
                <div className="gtm-persona-pains">
                  <span className="gtm-id-label">Pain Points</span>
                  <ul>
                    <li>Status reporting is manual, error-prone, slow ("Status debt")</li>
                    <li>Governance is fragmented — shadow ops and data leaks</li>
                    <li>Compliance and trust lag behind project velocity</li>
                  </ul>
                </div>
                <div className="gtm-id-row"><span className="gtm-id-label">Buying Trigger</span><span className="gtm-id-val gtm-gold">Failed audit, near-miss incident, or board mandate for radical transparency</span></div>
              </div>
            </div>

            <div className="gtm-panel">
              <div className="gtm-panel-header">TOP 3 OBJECTIONS + PRE-EMPTIONS</div>
              <div className="gtm-pad gtm-stack">
                {OBJECTIONS.map((o, i) => (
                  <div key={i} className="gtm-objection">
                    <div className="gtm-objection-q">"{o.q}"</div>
                    <div className="gtm-objection-a">→ {o.a}</div>
                    <CopyBtn text={o.a} label="Copy rebuttal" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── GTM PLAN ──────────────────────────────────────────── */}
        {section === 'GTM Plan' && (
          <>
            <div className="gtm-panel">
              <div className="gtm-panel-header">GO-TO-MARKET — FIRST $100K</div>
              <div className="gtm-steps">
                {GTM_STEPS.map((s, i) => (
                  <div key={i} className="gtm-step">
                    <span className="gtm-step-num">{i + 1}</span>
                    <div className="gtm-step-body">
                      <span className="gtm-step-h">{s.h}</span>
                      <span className="gtm-step-b">{s.b}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gtm-panel">
              <div className="gtm-panel-header">ARCHITECTURE METAPHOR — THE NASA FLIGHT DIRECTOR MODEL</div>
              <div className="gtm-nasa">
                {NASA_ROLES.map(r => (
                  <div key={r.role} className="gtm-nasa-row">
                    <span className="gtm-nasa-role">{r.role}</span>
                    <span className="gtm-nasa-who">{r.who}</span>
                    <span className="gtm-nasa-note">{r.note}</span>
                  </div>
                ))}
              </div>
              <div className="gtm-nasa-quote">"We don't give AI the keys. We give AI the instruments and humans the launch button."</div>
            </div>
          </>
        )}

      </div>

      <div className="gtm-footer">
        Package built by Agent Council (TiTO + SunNi) · June 21, 2026 · Session: pmo-brand-20260621
      </div>
    </div>
  )
}
