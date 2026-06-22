/* ──────────────────────────────────────────────────────────────────────────
   Custom Editions — per-client personalization of the Command Suite.
   Drives platform THEME (brand, accent, background) and LAYOUT/PAGE DESIGN
   (visible modules, order, density, terminology). Applied live via CSS vars.
   ────────────────────────────────────────────────────────────────────────── */

export type Density = 'comfortable' | 'compact'

export interface Edition {
  id: string
  name: string            // edition label, e.g. "Helios Energy Edition"
  preset: string          // which preset it derives from ('Custom' for hand-built)
  // ── Theme ──
  productMark: string     // header wordmark (left, accented), e.g. "HELIOS"
  productName: string     // header subtitle, e.g. "Grid Command"
  tagline: string         // executive-brief kicker line
  accent: string          // brand accent hex — recolors chrome live
  bg: string              // background base tone hex
  density: Density
  // ── Layout / page design ──
  modules: string[]       // visible modules (tabs), in display order
  terminology: Record<string, string> // label overrides, e.g. { Programs: "Missions" }
  tier: string            // pricing tier this edition maps to
}

/* Modules a client edition can show/hide/reorder.
   'Dashboard' and 'Editions' are always available and not listed here. */
export const ALL_MODULES = [
  'PMO', 'Platform', 'Decisions', 'Fabric', 'Timeline', 'GUARDiAN', 'GTM', 'ChatBridge', 'Documents',
  'Projects', 'Tasks', 'Connectors', 'Execute', 'Approve', 'Critical', 'Agents', 'Inbox',
] as const

export const TIERS = ['Flight Deck', 'Trajectory', 'Sovereign', 'Critical Infrastructure'] as const

/* SECC-OS native look — the default, unchanged experience. */
export const DEFAULT_EDITION: Edition = {
  id: 'secc-os-native',
  name: 'SECC-OS Native',
  preset: 'SECC-OS Native',
  productMark: 'HORHANiS',
  productName: 'Commander Console',
  tagline: 'Command Center is live and watching the work.',
  accent: '#f4c95d',
  bg: '#050608',
  density: 'comfortable',
  modules: [...ALL_MODULES],
  terminology: {},
  tier: 'Sovereign',
}

export const PRESETS: Edition[] = [
  DEFAULT_EDITION,
  {
    id: 'preset-energy',
    name: 'Energy / SCADA Edition',
    preset: 'Energy / SCADA',
    productMark: 'HELIOS',
    productName: 'Grid Command',
    tagline: 'Grid operations under autonomous command.',
    accent: '#00b4d8',
    bg: '#04080d',
    density: 'comfortable',
    modules: ['PMO', 'Timeline', 'GUARDiAN', 'ChatBridge', 'Approve', 'Critical'],
    terminology: { Programs: 'Missions', Agents: 'Controllers', GUARDiAN: 'Zero-Trust' },
    tier: 'Critical Infrastructure',
  },
  {
    id: 'preset-financial',
    name: 'Financial Services Edition',
    preset: 'Financial Services',
    productMark: 'MERIDIAN',
    productName: 'Portfolio Command',
    tagline: 'Governed delivery for regulated portfolios.',
    accent: '#34d399',
    bg: '#05080a',
    density: 'compact',
    modules: ['PMO', 'GUARDiAN', 'Timeline', 'Approve', 'ChatBridge'],
    terminology: { Programs: 'Mandates' },
    tier: 'Sovereign',
  },
  {
    id: 'preset-defense',
    name: 'Defense / Gov Edition',
    preset: 'Defense / Gov',
    productMark: 'AEGIS',
    productName: 'Mission Command',
    tagline: 'Mission assurance with sovereign control.',
    accent: '#f59e0b',
    bg: '#070707',
    density: 'compact',
    modules: ['PMO', 'GUARDiAN', 'Timeline', 'Critical'],
    terminology: { Programs: 'Operations', Agents: 'Operators' },
    tier: 'Critical Infrastructure',
  },
]

const ACTIVE_KEY = 'secc-os.edition.active'
const SAVED_KEY = 'secc-os.edition.saved'

export function loadActiveEdition(): Edition {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw) return { ...DEFAULT_EDITION, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_EDITION
}

export function saveActiveEdition(e: Edition) {
  try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(e)) } catch { /* ignore */ }
}

export function loadSavedEditions(): Edition[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

export function saveSavedEditions(list: Edition[]) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

/* Lighten/darken a hex by a percentage (-100..100) for derived shades. */
function shade(hex: string, pct: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return hex
  const num = parseInt(h, 16)
  const amt = Math.round(2.55 * pct)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amt)
  const g = clamp(((num >> 8) & 0xff) + amt)
  const b = clamp((num & 0xff) + amt)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/* Apply an edition's theme to the running app via CSS custom properties.
   Recolors the chrome that reads --gold / --bg / --panel. */
export function applyEditionTheme(e: Edition) {
  const root = document.documentElement
  root.style.setProperty('--gold', e.accent)
  root.style.setProperty('--accent', e.accent)
  root.style.setProperty('--accent-dim', shade(e.accent, -30))
  root.style.setProperty('--bg', e.bg)
  root.style.setProperty('--panel', shade(e.bg, 6))
  root.style.setProperty('--panel-2', shade(e.bg, 11))
  root.style.setProperty('--panel-3', shade(e.bg, 12))
  // density flag for layout spacing
  if (e.density === 'compact') root.setAttribute('data-density', 'compact')
  else root.removeAttribute('data-density')
}

/* Display label for a tab, honoring an edition's terminology overrides. */
export function labelFor(tab: string, e: Edition): string {
  return e.terminology[tab] || tab
}

/* Ordered, de-duplicated visible tabs for an edition.
   Dashboard is always first; Editions is always available to the operator. */
export function visibleTabs(allTabs: string[], e: Edition): string[] {
  const wanted = new Set(['Dashboard', 'Editions', ...e.modules])
  const ordered: string[] = []
  // Dashboard first
  ordered.push('Dashboard')
  // edition module order next (only valid ones)
  for (const m of e.modules) if (allTabs.includes(m) && !ordered.includes(m)) ordered.push(m)
  // Editions tab always reachable
  if (!ordered.includes('Editions')) ordered.push('Editions')
  // anything else the edition wanted but wasn't ordered
  for (const t of allTabs) if (wanted.has(t) && !ordered.includes(t)) ordered.push(t)
  return ordered
}
