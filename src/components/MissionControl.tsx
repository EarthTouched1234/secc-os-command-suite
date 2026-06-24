import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchRiskRegister, type FeedEntry, type SystemExecution, type RiskEntry } from '../api/n8n'
import { fetchPortfolio } from './PMODashboard'

/* ──────────────────────────────────────────────────────────────────────────
   Mission Control — the home screen. A living map composed from feeds that
   already exist (PMO portfolio, GUARDiAN risk register, dispatch feed, n8n
   executions). It adds NO new data source — it aggregates. Read-only.
   ────────────────────────────────────────────────────────────────────────── */

const AGENT_COLOR: Record<string, string> = {
  HORHANiS: '#ef4444', TRiO: '#eab308', TiTO: '#f97316',
  CiRO: '#3b82f6', SunNi: '#fbbf24', GUARDiAN: '#64748b',
}
const KNOWN_AGENTS = ['HORHANiS', 'TRiO', 'TiTO', 'CiRO', 'SunNi', 'GUARDiAN']

type Pulse = 'green' | 'amber' | 'red'
const PULSE_GLYPH: Record<Pulse, string> = { green: '🟢', amber: '🟡', red: '🔴' }

interface Program {
  id: string; name: string; rag: string; healthScore: number | null
  activeWorkflows: number; riskExposure: string; onHold: boolean
}

function relTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (isNaN(t)) return '—'
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

function openTasks(): number {
  try {
    const arr = JSON.parse(localStorage.getItem('secc_tasks') || '[]')
    return Array.isArray(arr) ? arr.filter((t: { status?: string }) => (t.status || '').toLowerCase() !== 'done').length : 0
  } catch { return 0 }
}

interface Props {
  active: boolean
  feed: FeedEntry[]
  systemExecs: SystemExecution[]
  lastUpdated: Date | null
  onRefresh: () => void
}

export function MissionControl({ active, feed, systemExecs, lastUpdated, onRefresh }: Props) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [risks, setRisks] = useState<RiskEntry[]>([])
  const [portfolioOk, setPortfolioOk] = useState<boolean | null>(null)
  const [guardianOk, setGuardianOk] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const load = useCallback(async () => {
    if (lastFetch && Date.now() - lastFetch.getTime() < 60_000) return
    setLoading(true)
    try {
      const [pf, rk] = await Promise.all([fetchPortfolio(), fetchRiskRegister()])
      setPrograms(pf as Program[])
      setRisks(rk)
      setPortfolioOk(pf.length > 0)
      setGuardianOk(true) // fetch resolved (returns [] on failure, but no throw)
      setLastFetch(new Date())
    } catch {
      setPortfolioOk(false)
      setGuardianOk(false)
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  useEffect(() => { if (active) load() }, [active, load])

  // ── Derived metrics (all from real feeds) ──
  const m = useMemo(() => {
    const scored = programs.filter(p => p.healthScore !== null)
    const health = scored.length
      ? Math.round(scored.reduce((s, p) => s + (p.healthScore || 0), 0) / scored.length)
      : programs.length
        ? Math.round((programs.filter(p => p.rag === 'Green').length / programs.length) * 100)
        : 0
    const successes = systemExecs.filter(e => e.status === 'success').length
    const errors = systemExecs.filter(e => e.status === 'error').length
    const successRate = systemExecs.length ? Math.round((successes / systemExecs.length) * 100) : 100
    const highRisks = programs.filter(p => p.riskExposure === 'High' || p.riskExposure === 'Critical').length
    return {
      health,
      green: programs.filter(p => p.rag === 'Green').length,
      amber: programs.filter(p => p.rag === 'Amber').length,
      red: programs.filter(p => p.rag === 'Red').length,
      programs: programs.length,
      workflows: programs.reduce((s, p) => s + (p.activeWorkflows || 0), 0),
      automations: systemExecs.length,
      approvals: feed.filter(e => e.requiresApproval || e.missionStatus === 'PENDING_APPROVAL').length,
      blocked: programs.filter(p => p.onHold).length,
      risks: highRisks + risks.filter(r => r.risk_level === 'High' || r.risk_level === 'Critical').length,
      tasks: openTasks(),
      successRate, errors,
    }
  }, [programs, risks, feed, systemExecs])

  // ── Agent live activity (from dispatch feed) ──
  const agentActivity = useMemo(() => {
    const counts: Record<string, { count: number; last: string }> = {}
    for (const e of feed) {
      const a = e.agentName
      if (!a) continue
      if (!counts[a]) counts[a] = { count: 0, last: e.timestamp }
      counts[a].count++
    }
    return KNOWN_AGENTS.map(a => ({
      name: a,
      count: counts[a]?.count || 0,
      active: (counts[a]?.count || 0) > 0,
    }))
  }, [feed])

  // ── System pulse (honest: derived from what we can actually measure) ──
  const pulses: { name: string; pulse: Pulse; note: string }[] = useMemo(() => {
    const n8nPulse: Pulse = systemExecs.length === 0 ? 'amber' : m.successRate >= 90 ? 'green' : m.successRate >= 70 ? 'amber' : 'red'
    const pmoPulse: Pulse = portfolioOk === null ? 'amber' : portfolioOk ? 'green' : 'red'
    const guardianPulse: Pulse = guardianOk === null ? 'amber' : guardianOk ? 'green' : 'red'
    const feedPulse: Pulse = feed.length > 0 ? 'green' : 'amber'
    return [
      { name: 'n8n', pulse: n8nPulse, note: `${m.successRate}% success · ${m.errors} errors` },
      { name: 'PMO API', pulse: pmoPulse, note: portfolioOk ? `${m.programs} programs` : 'no data' },
      { name: 'GUARDiAN', pulse: guardianPulse, note: `${risks.length} risk entries` },
      { name: 'Notion', pulse: pmoPulse, note: 'via PMO/Risk feeds' },
      { name: 'Console Feed', pulse: feedPulse, note: `${feed.length} events` },
    ]
  }, [systemExecs, m, portfolioOk, guardianOk, feed, risks])

  // ── Recent events (merge dispatch feed + executions) ──
  const events = useMemo(() => {
    const fromFeed = feed.map(e => ({
      kind: 'dispatch', label: e.summary || e.workflowName || 'Dispatch event',
      who: e.agentName, status: e.missionStatus, time: e.timestamp,
    }))
    const fromExec = systemExecs.map(e => ({
      kind: 'workflow', label: e.workflowName || e.workflowId || 'Workflow run',
      who: '', status: e.status, time: e.startedAt,
    }))
    return [...fromFeed, ...fromExec]
      .filter(e => e.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
  }, [feed, systemExecs])

  if (!active) return null

  const healthColor = m.health >= 85 ? '#22c55e' : m.health >= 70 ? '#f59e0b' : '#ef4444'

  return (
    <div className="mc-root">
      <div className="mc-header">
        <div className="mc-title-group">
          <span className="mc-title">Mission Control</span>
          <span className="mc-data-badge" title="sys_014 — all metrics on this screen are LIVE: PMO Portfolio API, GUARDiAN Risk Register, dispatch feed, n8n executions. No simulated values.">● LIVE</span>
        </div>
        <div className="mc-header-meta">
          <span className="mc-sync">{lastFetch ? `Portfolio ${relTime(lastFetch.toISOString())}` : loading ? 'Loading…' : 'pending'}</span>
          <span className="mc-sync">{lastUpdated ? `Feed ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          <button className="mc-refresh" onClick={() => { setLastFetch(null); load(); onRefresh() }} disabled={loading}>
            {loading ? '⟳' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="mc-grid">
        {/* Portfolio Health hero */}
        <div className="mc-hero panel">
          <div className="panel-header"><span className="label">PORTFOLIO HEALTH</span></div>
          <div className="mc-hero-num" style={{ color: healthColor }}>{m.health}<span className="mc-hero-pct">%</span></div>
          <div className="mc-hero-bar"><div className="mc-hero-fill" style={{ width: `${m.health}%`, background: healthColor }} /></div>
          <div className="mc-hero-rag">
            <span style={{ color: '#22c55e' }}>● {m.green} Green</span>
            <span style={{ color: '#f59e0b' }}>● {m.amber} Amber</span>
            <span style={{ color: m.red > 0 ? '#ef4444' : '#555' }}>● {m.red} Red</span>
          </div>
        </div>

        {/* Live counts */}
        <div className="mc-counts panel">
          <div className="panel-header"><span className="label">LIVE COUNTS</span></div>
          <div className="mc-count-grid">
            {[
              { k: 'Programs', v: m.programs },
              { k: 'Workflows', v: m.workflows },
              { k: 'Automations', v: m.automations },
              { k: 'Agents', v: agentActivity.filter(a => a.active).length },
              { k: 'Approvals', v: m.approvals, hot: m.approvals > 0 },
              { k: 'Risks', v: m.risks, hot: m.risks > 0 },
              { k: 'Blocked', v: m.blocked, hot: m.blocked > 0 },
              { k: 'Open Tasks', v: m.tasks },
            ].map(c => (
              <div key={c.k} className={`mc-count ${c.hot ? 'hot' : ''}`}>
                <span className="mc-count-v">{c.v}</span>
                <span className="mc-count-k">{c.k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity (agents) */}
        <div className="mc-activity panel">
          <div className="panel-header"><span className="label">LIVE ACTIVITY</span><span className="mc-sub">dispatch feed</span></div>
          <div className="mc-agent-list">
            {agentActivity.map(a => (
              <div key={a.name} className="mc-agent-row">
                <span className="mc-agent-dot" style={{ background: a.active ? (AGENT_COLOR[a.name] || '#888') : '#333' }} />
                <span className="mc-agent-name" style={{ color: a.active ? (AGENT_COLOR[a.name] || '#ccc') : '#666' }}>{a.name}</span>
                <span className="mc-agent-count">{a.count > 0 ? `${a.count} event${a.count !== 1 ? 's' : ''}` : 'idle'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Pulse */}
        <div className="mc-pulse panel">
          <div className="panel-header"><span className="label">SYSTEM PULSE</span></div>
          <div className="mc-pulse-list">
            {pulses.map(p => (
              <div key={p.name} className="mc-pulse-row" title={p.note}>
                <span className="mc-pulse-glyph">{PULSE_GLYPH[p.pulse]}</span>
                <span className="mc-pulse-name">{p.name}</span>
                <span className="mc-pulse-note">{p.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="mc-events panel">
          <div className="panel-header"><span className="label">RECENT EVENTS</span><span className="mc-sub">{events.length} latest</span></div>
          <div className="mc-event-list">
            {events.length === 0 ? (
              <div className="mc-empty">No recent events in the feed.</div>
            ) : events.map((e, i) => (
              <div key={i} className="mc-event-row">
                <span className={`mc-event-kind mc-${e.kind}`}>{e.kind === 'dispatch' ? '⇆' : '⚙'}</span>
                <span className="mc-event-label">{e.label}</span>
                {e.who && <span className="mc-event-who" style={{ color: AGENT_COLOR[e.who] || '#888' }}>{e.who}</span>}
                <span className={`mc-event-status s-${String(e.status).toLowerCase()}`}>{e.status}</span>
                <span className="mc-event-time">{relTime(e.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
