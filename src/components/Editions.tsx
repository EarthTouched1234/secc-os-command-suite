import { useState } from 'react'
import {
  type Edition, PRESETS, DEFAULT_EDITION, ALL_MODULES, TIERS,
  loadSavedEditions, saveSavedEditions,
} from '../editions/editions'

/* ──────────────────────────────────────────────────────────────────────────
   Editions — per-client customization surface.
   View 1 (Personalize): Tier 1 No-Code, applied LIVE.
   View 2 (Customization Tiers): the 3-tier enterprise model + governance core.
   ────────────────────────────────────────────────────────────────────────── */

const ACCENT_SWATCHES = ['#f4c95d', '#00b4d8', '#34d399', '#f59e0b', '#ef4444', '#b58cff', '#62a8ff', '#f472b6']
const BG_TONES = [
  { name: 'Midnight', hex: '#050608' },
  { name: 'Ink', hex: '#04080d' },
  { name: 'Slate', hex: '#070707' },
  { name: 'Carbon', hex: '#0a0a0a' },
]
const TERM_KEYS = ['Programs', 'Agents', 'GUARDiAN', 'Projects', 'Tasks', 'Approve']

// ── Customization Tiers model (from enterprise customization spec) ──
const TIER_CARDS = [
  {
    n: 'Tier 1', name: 'No-Code', edition: 'Included', accent: '#34d399', status: 'Live now',
    blurb: 'Brand the platform. No programming required.',
    items: ['Logo', 'Colors', 'Header', 'Footer', 'Fonts', 'Dashboard widgets', 'Navigation', 'Department names', 'Terminology', 'Home page', 'Report branding'],
  },
  {
    n: 'Tier 2', name: 'Low-Code Studio', edition: 'Professional', accent: '#62a8ff', status: 'Roadmap',
    blurb: 'SECC Studio — for internal IT teams or Business Analysts.',
    items: ['Custom dashboards', 'Forms', 'Approval workflows', 'Automations', 'Department processes', 'Custom fields', 'Layout modifications', 'Custom reports'],
  },
  {
    n: 'Tier 3', name: 'Developer Platform', edition: 'Enterprise', accent: '#b58cff', status: 'Roadmap',
    blurb: 'SDK + APIs. Extend the platform — never rewrite the engine.',
    items: ['SDK', 'REST APIs', 'GraphQL APIs', 'Webhooks', 'Plugin framework', 'Theme engine', 'Custom component library'],
  },
]

const LOCKED_CORE = [
  'PMO Governance Engine', 'Approval Engine', 'Audit Engine',
  'Security Engine', 'AI Orchestration', 'Compliance Engine',
]

const MARKETPLACE = [
  'Construction Portfolio Pack', 'Government Compliance Pack', 'Healthcare PMO Pack',
  'AI Risk Assessment Module', 'Executive Dashboard Pack', 'Financial Forecasting Module',
  'Procurement Extension', 'HR Workforce Planning Module',
]

const CERT_PIPELINE = [
  'Static code analysis', 'Security scan', 'Performance validation',
  'Compatibility testing', 'Governance compliance check',
]

const ARCH_STACK = [
  { name: 'Governance Engine', tag: 'Locked', color: '#ef4444' },
  { name: 'AI Engine', tag: 'Locked', color: '#ef4444' },
  { name: 'Security Engine', tag: 'Locked', color: '#ef4444' },
  { name: 'Automation Engine', tag: 'Protected', color: '#f59e0b' },
  { name: 'API Layer', tag: 'Open', color: '#34d399' },
  { name: 'Theme Engine', tag: 'Open', color: '#34d399' },
  { name: 'Extension Framework', tag: 'Open', color: '#34d399' },
  { name: 'Plugin SDK', tag: 'Open', color: '#34d399' },
  { name: 'Developer Portal', tag: 'Open', color: '#34d399' },
  { name: 'Professional Services', tag: 'Service', color: '#62a8ff' },
]

interface Props {
  edition: Edition
  onApply: (e: Edition) => void
}

export function Editions({ edition, onApply }: Props) {
  const [view, setView] = useState<'Personalize' | 'Customization Tiers'>('Personalize')
  const [draft, setDraft] = useState<Edition>(edition)
  const [saved, setSaved] = useState<Edition[]>(loadSavedEditions())
  const [io, setIo] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const set = (patch: Partial<Edition>) => setDraft(d => ({ ...d, ...patch }))
  const flash = (m: string) => { setMsg(m); window.setTimeout(() => setMsg(null), 1800) }

  const loadInto = (e: Edition) => { setDraft({ ...e }); flash(`Loaded "${e.name}" into editor`) }

  const toggleModule = (m: string) => {
    setDraft(d => d.modules.includes(m)
      ? { ...d, modules: d.modules.filter(x => x !== m) }
      : { ...d, modules: [...d.modules, m] })
  }
  const moveModule = (m: string, dir: -1 | 1) => {
    setDraft(d => {
      const i = d.modules.indexOf(m)
      const j = i + dir
      if (i < 0 || j < 0 || j >= d.modules.length) return d
      const next = [...d.modules]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...d, modules: next }
    })
  }
  const setTerm = (key: string, val: string) => {
    setDraft(d => {
      const t = { ...d.terminology }
      if (val.trim()) t[key] = val.trim(); else delete t[key]
      return { ...d, terminology: t }
    })
  }

  const applyLive = () => { onApply(draft); flash('Applied live ✓ — header & navigation updated') }

  const saveEdition = () => {
    const id = draft.preset === 'Custom' || draft.id.startsWith('custom-')
      ? (draft.id.startsWith('custom-') ? draft.id : `custom-${Date.now()}`)
      : `custom-${Date.now()}`
    const e: Edition = { ...draft, id, preset: 'Custom' }
    const next = [...saved.filter(s => s.id !== id), e]
    setSaved(next); saveSavedEditions(next); setDraft(e)
    flash(`Saved edition "${e.name}"`)
  }
  const deleteSaved = (id: string) => {
    const next = saved.filter(s => s.id !== id)
    setSaved(next); saveSavedEditions(next)
  }

  const exportJSON = () => { setIo(JSON.stringify(draft, null, 2)); flash('Exported — copy the JSON below') }
  const importJSON = () => {
    try {
      const e = JSON.parse(io)
      setDraft({ ...DEFAULT_EDITION, ...e })
      flash('Imported into editor')
    } catch { flash('Invalid JSON') }
  }

  return (
    <div className="ed-root" data-density={draft.density}>
      {/* Header */}
      <div className="ed-header">
        <div>
          <span className="ed-title">Editions</span>
          <span className="ed-subtitle">Per-client customization · personalize theme &amp; layout</span>
        </div>
        <div className="ed-viewnav">
          {(['Personalize', 'Customization Tiers'] as const).map(v => (
            <button key={v} className={v === view ? 'active' : ''} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      {msg && <div className="ed-flash">{msg}</div>}

      {/* ── PERSONALIZE (Tier 1, live) ─────────────────────────────── */}
      {view === 'Personalize' && (
        <div className="ed-body">

          {/* Preset / saved selector */}
          <div className="ed-panel">
            <div className="ed-panel-header">START FROM A PRESET</div>
            <div className="ed-preset-row">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`ed-preset ${draft.id === p.id ? 'active' : ''}`}
                  style={{ borderTopColor: p.accent }}
                  onClick={() => loadInto(p)}
                >
                  <span className="ed-preset-name">{p.name}</span>
                  <span className="ed-preset-mark" style={{ color: p.accent }}>{p.productMark}</span>
                  <span className="ed-preset-tier">{p.tier}</span>
                </button>
              ))}
              {saved.map(p => (
                <button
                  key={p.id}
                  className={`ed-preset ed-preset-saved ${draft.id === p.id ? 'active' : ''}`}
                  style={{ borderTopColor: p.accent }}
                  onClick={() => loadInto(p)}
                >
                  <span className="ed-preset-name">{p.name}</span>
                  <span className="ed-preset-mark" style={{ color: p.accent }}>{p.productMark}</span>
                  <span className="ed-preset-tier">★ saved</span>
                  <span className="ed-preset-del" onClick={(ev) => { ev.stopPropagation(); deleteSaved(p.id) }} title="Delete">×</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ed-two-col">
            {/* THEME */}
            <div className="ed-panel">
              <div className="ed-panel-header">THEME &amp; BRAND</div>
              <div className="ed-pad">
                <label className="ed-field"><span>Edition name</span>
                  <input value={draft.name} onChange={e => set({ name: e.target.value })} />
                </label>
                <label className="ed-field"><span>Wordmark (header)</span>
                  <input value={draft.productMark} onChange={e => set({ productMark: e.target.value })} />
                </label>
                <label className="ed-field"><span>Product name</span>
                  <input value={draft.productName} onChange={e => set({ productName: e.target.value })} />
                </label>
                <label className="ed-field"><span>Tagline</span>
                  <input value={draft.tagline} onChange={e => set({ tagline: e.target.value })} />
                </label>
                <label className="ed-field"><span>Tier</span>
                  <select value={draft.tier} onChange={e => set({ tier: e.target.value })}>
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                <div className="ed-field-label">Accent color</div>
                <div className="ed-swatch-row">
                  {ACCENT_SWATCHES.map(c => (
                    <button key={c} className={`ed-swatch ${draft.accent === c ? 'active' : ''}`} style={{ background: c }} onClick={() => set({ accent: c })} title={c} />
                  ))}
                  <input className="ed-color-input" type="color" value={draft.accent} onChange={e => set({ accent: e.target.value })} />
                </div>

                <div className="ed-field-label">Background tone</div>
                <div className="ed-tone-row">
                  {BG_TONES.map(t => (
                    <button key={t.hex} className={`ed-tone ${draft.bg === t.hex ? 'active' : ''}`} onClick={() => set({ bg: t.hex })}>
                      <span className="ed-tone-chip" style={{ background: t.hex }} />{t.name}
                    </button>
                  ))}
                </div>

                <div className="ed-field-label">Density</div>
                <div className="ed-tone-row">
                  {(['comfortable', 'compact'] as const).map(d => (
                    <button key={d} className={`ed-tone ${draft.density === d ? 'active' : ''}`} onClick={() => set({ density: d })}>{d}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* LAYOUT / NAVIGATION */}
            <div className="ed-panel">
              <div className="ed-panel-header">LAYOUT · NAVIGATION</div>
              <div className="ed-pad">
                <div className="ed-field-label">Modules shown to client (toggle + reorder)</div>
                <div className="ed-modules">
                  {ALL_MODULES.map(m => {
                    const on = draft.modules.includes(m)
                    return (
                      <div key={m} className={`ed-module ${on ? 'on' : ''}`}>
                        <label className="ed-module-toggle">
                          <input type="checkbox" checked={on} onChange={() => toggleModule(m)} />
                          <span>{draft.terminology[m] || m}</span>
                        </label>
                        {on && (
                          <span className="ed-module-order">
                            <button onClick={() => moveModule(m, -1)} title="Move up">▲</button>
                            <button onClick={() => moveModule(m, 1)} title="Move down">▼</button>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="ed-field-label" style={{ marginTop: 12 }}>Terminology / department renames</div>
                <div className="ed-terms">
                  {TERM_KEYS.map(k => (
                    <div key={k} className="ed-term-row">
                      <span className="ed-term-key">{k}</span>
                      <span className="ed-term-arrow">→</span>
                      <input
                        placeholder={k}
                        value={draft.terminology[k] || ''}
                        onChange={e => setTerm(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live preview of header */}
          <div className="ed-panel">
            <div className="ed-panel-header">LIVE PREVIEW</div>
            <div className="ed-preview" style={{ background: draft.bg }}>
              <div className="ed-preview-header">
                <span className="ed-preview-mark" style={{ color: draft.accent }}>{draft.productMark}</span>
                <span className="ed-preview-name">{draft.productName}</span>
              </div>
              <div className="ed-preview-tabs">
                {['Dashboard', ...draft.modules.slice(0, 6)].map(t => (
                  <span key={t} className="ed-preview-tab" style={t === 'Dashboard' ? { color: draft.accent, borderColor: draft.accent } : undefined}>
                    {draft.terminology[t] || t}
                  </span>
                ))}
                {draft.modules.length > 6 && <span className="ed-preview-tab">+{draft.modules.length - 6}</span>}
              </div>
              <div className="ed-preview-tagline">{draft.tagline}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="ed-actions">
            <button className="ed-btn ed-btn-primary" onClick={applyLive}>⚡ Apply Live</button>
            <button className="ed-btn" onClick={saveEdition}>★ Save as Edition</button>
            <button className="ed-btn" onClick={exportJSON}>⧉ Export JSON</button>
            <button className="ed-btn" onClick={importJSON}>↥ Import JSON</button>
            <button className="ed-btn ed-btn-ghost" onClick={() => loadInto(DEFAULT_EDITION)}>↺ Reset to Native</button>
          </div>
          <textarea
            className="ed-io"
            placeholder="Edition JSON appears here on Export. Paste a client edition here and click Import JSON to load it."
            value={io}
            onChange={e => setIo(e.target.value)}
          />
        </div>
      )}

      {/* ── CUSTOMIZATION TIERS (the model) ────────────────────────── */}
      {view === 'Customization Tiers' && (
        <div className="ed-body">
          <div className="ed-tier-grid">
            {TIER_CARDS.map(t => (
              <div key={t.n} className="ed-tier-card" style={{ borderTopColor: t.accent }}>
                <div className="ed-tier-top">
                  <span className="ed-tier-n" style={{ color: t.accent }}>{t.n}</span>
                  <span className={`ed-tier-status ${t.status === 'Live now' ? 'live' : ''}`}>{t.status}</span>
                </div>
                <div className="ed-tier-name">{t.name}</div>
                <div className="ed-tier-edition">{t.edition}</div>
                <p className="ed-tier-blurb">{t.blurb}</p>
                <ul className="ed-tier-items">
                  {t.items.map(i => <li key={i}><span style={{ color: t.accent }}>▸</span> {i}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Locked governance core */}
          <div className="ed-panel ed-locked">
            <div className="ed-panel-header" style={{ color: '#ef4444' }}>🔒 GOVERNANCE CORE — LOCKED</div>
            <div className="ed-pad">
              <p className="ed-note">Even Enterprise developers extend through published APIs &amp; extension points — never by modifying these. This preserves upgrade compatibility and platform stability.</p>
              <div className="ed-core-grid">
                {LOCKED_CORE.map(c => (
                  <div key={c} className="ed-core-chip">🔒 {c}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="ed-two-col">
            {/* Professional services */}
            <div className="ed-panel">
              <div className="ed-panel-header">PROFESSIONAL SERVICES</div>
              <div className="ed-pad">
                <div className="ed-ps-opt"><strong>Option A — Customer-Built.</strong> Client's own developers build on the SDK + APIs.</div>
                <div className="ed-ps-opt"><strong>Option B — SECC Professional Services.</strong> Our team designs &amp; builds to spec.</div>
                <div className="ed-field-label" style={{ marginTop: 10 }}>Industry PMO engagements</div>
                <div className="ed-core-grid">
                  {['Healthcare PMO', 'Construction PMO', 'Government PMO', 'Manufacturing PMO', 'Financial PMO'].map(i => (
                    <div key={i} className="ed-core-chip ed-chip-blue">{i}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certification pipeline */}
            <div className="ed-panel">
              <div className="ed-panel-header">CERTIFICATION PIPELINE</div>
              <div className="ed-pad">
                <p className="ed-note">Every custom extension passes certification before it can deploy to production.</p>
                <div className="ed-cert">
                  {CERT_PIPELINE.map((c, i) => (
                    <div key={c} className="ed-cert-step">
                      <span className="ed-cert-num">{i + 1}</span>
                      <span>{c}</span>
                      <span className="ed-cert-arrow">{i < CERT_PIPELINE.length - 1 ? '→' : '✓'}</span>
                    </div>
                  ))}
                </div>
                <div className="ed-cert-gate">Only certified extensions install into production.</div>
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div className="ed-panel">
            <div className="ed-panel-header">SECC MARKETPLACE</div>
            <div className="ed-market">
              {MARKETPLACE.map(m => (
                <div key={m} className="ed-market-item"><span className="ed-market-check">✓</span> {m}</div>
              ))}
            </div>
          </div>

          {/* Architecture stack */}
          <div className="ed-panel">
            <div className="ed-panel-header">RECOMMENDED ARCHITECTURE</div>
            <div className="ed-pad">
              <div className="ed-arch-sponsor">Executive Sponsor ▾</div>
              <div className="ed-arch-core-label">SECC Core Platform</div>
              <div className="ed-arch-stack">
                {ARCH_STACK.map(a => (
                  <div key={a.name} className="ed-arch-row" style={{ borderLeftColor: a.color }}>
                    <span className="ed-arch-name">{a.name}</span>
                    <span className="ed-arch-tag" style={{ color: a.color, borderColor: `${a.color}44` }}>{a.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
