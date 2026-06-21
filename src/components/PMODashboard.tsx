import { useState, useEffect, useCallback } from 'react'
import { fetchWithRetry, syncPortfolioStatus, snapshotPortfolio, fetchTrajectory, type TrajectoryMap, type TrajectoryDirection } from '../api/n8n'

const PMO_PORTFOLIO_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/portfolio'

const RAG_COLOR: Record<string, string> = {
  Green:    '#22c55e',
  Amber:    '#f59e0b',
  Red:      '#ef4444',
  'Not Set': '#444',
}

const AGENT_COLOR: Record<string, string> = {
  HORHANiS:       '#ef4444',
  TRiO:            '#eab308',
  TiTO:            '#f97316',
  CiRO:            '#3b82f6',
  SunNi:           '#fbbf24',
  GUARDiAN:        '#64748b',
  'SunNi + Council': '#fbbf24',
}

const RISK_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#22c55e',
  Unknown:  '#444',
}

interface Program {
  id: string
  name: string
  type: string
  rag: string
  gate: string
  owner: string
  phase: string
  riskExposure: string
  healthScore: number | null
  activeWorkflows: number
  workflowIds: string
  budget: number
  onHold: boolean
  nextGateDate: string | null
  lastReview: string | null
  statusNotes: string
  strategicTheme: string
  benefitsTarget: string
}

function gateShort(gate: string) {
  const m = gate.match(/Gate (\d)/)
  return m ? `G${m[1]}` : '?'
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isPastGate(iso: string | null) {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

export async function fetchPortfolio(): Promise<Program[]> {
  try {
    const res = await fetchWithRetry(PMO_PORTFOLIO_URL, { method: 'GET' })
    if (!res.ok) return []
    const data = await res.json()
    return data.programs || []
  } catch {
    return []
  }
}

interface Props { active: boolean }

export function PMODashboard({ active }: Props) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<{ at: Date; updated: number } | null>(null)
  const [trajectories, setTrajectories] = useState<TrajectoryMap>({})

  const load = useCallback(async () => {
    if (lastFetch && Date.now() - lastFetch.getTime() < 60_000) return
    setLoading(true)
    setError(null)
    try {
      // Load portfolio + trajectory in parallel
      const [data, traj] = await Promise.all([fetchPortfolio(), fetchTrajectory()])
      setPrograms(data)
      setTrajectories(traj)
      setLastFetch(new Date())
    } catch {
      setError('Failed to load portfolio data. Check n8n PMO Portfolio API.')
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      const result = await syncPortfolioStatus()
      setLastSync({ at: new Date(result.synced_at), updated: result.programs_updated })
      // Chain: snapshot → trajectory (fire-and-forget, don't block)
      await snapshotPortfolio('post_sync').catch(() => {})
      const traj = await fetchTrajectory().catch(() => ({}))
      setTrajectories(traj as TrajectoryMap)
      // Refresh portfolio data so health scores update in UI
      setLastFetch(null)
      await load()
    } catch {
      // Sync failed — don't block UI
    } finally {
      setSyncing(false)
    }
  }, [load])

  useEffect(() => { if (active) load() }, [active, load])

  const green  = programs.filter(p => p.rag === 'Green').length
  const amber  = programs.filter(p => p.rag === 'Amber').length
  const red    = programs.filter(p => p.rag === 'Red').length
  const pastGate = programs.filter(p => isPastGate(p.nextGateDate) && p.rag !== 'Not Set').length
  const totalBudget = programs.reduce((s, p) => s + (p.budget || 0), 0)

  const topRisks = [...programs]
    .filter(p => p.riskExposure !== 'Unknown' && p.riskExposure !== 'Low')
    .sort((a, b) => {
      const ord = { Critical: 4, High: 3, Medium: 2, Low: 1, Unknown: 0 }
      return (ord[b.riskExposure as keyof typeof ord] || 0) - (ord[a.riskExposure as keyof typeof ord] || 0)
    })
    .slice(0, 5)

  const recentGate = [...programs]
    .filter(p => p.lastReview)
    .sort((a, b) => new Date(b.lastReview!).getTime() - new Date(a.lastReview!).getTime())
    .slice(0, 8)

  if (!active) return null

  return (
    <div className="pmo-root">
      {/* Header */}
      <div className="pmo-header">
        <span className="pmo-title">PMO — Portfolio Governance</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastSync && (
            <span className="pmo-sync-badge">
              ✓ Auto-synced {lastSync.updated} program{lastSync.updated !== 1 ? 's' : ''} · {lastSync.at.toLocaleTimeString()}
            </span>
          )}
          <span className="pmo-last-fetch">
            {lastFetch ? `Data ${Math.round((Date.now() - lastFetch.getTime()) / 60000)}m ago` : ''}
          </span>
          <button
            className="pmo-sync-btn"
            onClick={handleSync}
            disabled={syncing || loading}
            title="Pull live execution data from n8n and update health scores"
          >
            {syncing ? '⟳ Syncing...' : '⚡ Sync Now'}
          </button>
          <button className="pmo-refresh" onClick={() => { setLastFetch(null); load() }} disabled={loading}>
            {loading ? '⟳' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="pmo-error">{error}</div>}

      {/* KPI Strip */}
      <div className="pmo-kpi-strip">
        <div className="pmo-kpi">
          <span className="pmo-kpi-value">{programs.length}</span>
          <span className="pmo-kpi-label">Programs</span>
        </div>
        <div className="pmo-kpi" style={{ color: RAG_COLOR.Green }}>
          <span className="pmo-kpi-value">{green}</span>
          <span className="pmo-kpi-label">Green</span>
        </div>
        <div className="pmo-kpi" style={{ color: RAG_COLOR.Amber }}>
          <span className="pmo-kpi-value">{amber}</span>
          <span className="pmo-kpi-label">Amber</span>
        </div>
        <div className="pmo-kpi" style={{ color: red > 0 ? RAG_COLOR.Red : undefined }}>
          <span className="pmo-kpi-value">{red}</span>
          <span className="pmo-kpi-label">Red</span>
        </div>
        <div className="pmo-kpi" style={{ color: pastGate > 0 ? RAG_COLOR.Red : undefined }}>
          <span className="pmo-kpi-value">{pastGate}</span>
          <span className="pmo-kpi-label">Past Gate</span>
        </div>
        <div className="pmo-kpi">
          <span className="pmo-kpi-value">${totalBudget > 0 ? (totalBudget / 1000).toFixed(0) + 'k' : '—'}</span>
          <span className="pmo-kpi-label">Budget</span>
        </div>
      </div>

      {/* Portfolio Health Heatmap */}
      <div className="panel pmo-section">
        <div className="panel-header">
          <span className="label">PORTFOLIO HEALTH</span>
          <span style={{ fontSize: 10, color: '#555' }}>{programs.length} programs tracked</span>
        </div>
        {loading && programs.length === 0 ? (
          <div className="pmo-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pmo-skeleton-cell" />
            ))}
          </div>
        ) : (
          <div className="pmo-heatmap">
            {programs.map(p => {
              const ragColor = RAG_COLOR[p.rag] || '#444'
              const ownerColor = AGENT_COLOR[p.owner] || '#888'
              const past = isPastGate(p.nextGateDate)
              return (
                <div
                  key={p.id}
                  className="pmo-cell"
                  style={{ borderLeftColor: ragColor }}
                  title={`${p.name}\n${p.statusNotes}`}
                >
                  <div className="pmo-cell-top">
                    <span className="pmo-cell-name">{p.name}</span>
                    {p.onHold && <span className="pmo-hold-chip">HOLD</span>}
                  </div>
                  <div className="pmo-cell-meta">
                    <span className="pmo-gate-badge" style={{ color: ragColor, border: `1px solid ${ragColor}44` }}>
                      {gateShort(p.gate)}
                    </span>
                    <span className="pmo-owner-chip" style={{ color: ownerColor, border: `1px solid ${ownerColor}44` }}>
                      {p.owner}
                    </span>
                    <span className="pmo-wf-count">⚙ {p.activeWorkflows}</span>
                  </div>
                  {p.healthScore !== null && (
                    <div className="pmo-health-bar">
                      <div
                        className="pmo-health-fill"
                        style={{ width: `${p.healthScore}%`, background: ragColor }}
                      />
                    </div>
                  )}
                  {(() => {
                    const tEntry = trajectories[p.id]
                    const dir: TrajectoryDirection = tEntry?.direction ?? 'Unknown'
                    const TRAJ: Record<TrajectoryDirection, { arrow: string; cls: string; tip: string }> = {
                      Improving: { arrow: '↑', cls: 'pmo-traj-up',      tip: `Improving · ${tEntry?.scores?.join(' → ')}` },
                      Stable:    { arrow: '→', cls: 'pmo-traj-stable',  tip: `Stable · ${tEntry?.scores?.join(' → ')}` },
                      Declining: { arrow: '↓', cls: 'pmo-traj-down',    tip: `Declining · ${tEntry?.scores?.join(' → ')}` },
                      Unknown:   { arrow: '?', cls: 'pmo-traj-unknown', tip: 'Trajectory: not enough data yet' },
                    }
                    const t = TRAJ[dir]
                    return (
                      <span className={`pmo-traj-badge ${t.cls}`} title={t.tip}>
                        {t.arrow}
                      </span>
                    )
                  })()}
                  {p.nextGateDate && (
                    <div className="pmo-cell-date" style={{ color: past ? RAG_COLOR.Red : '#555' }}>
                      {past ? '⚠ ' : ''}Next: {fmtDate(p.nextGateDate)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Two-column: Risks + Gate Activity */}
      <div className="pmo-two-col">
        {/* Top Risks */}
        <div className="panel pmo-section">
          <div className="panel-header">
            <span className="label">TOP RISKS</span>
            <span style={{ fontSize: 10, color: '#555' }}>by exposure</span>
          </div>
          <div className="pmo-risk-list">
            {topRisks.length === 0 ? (
              <div className="pmo-empty">No high/critical risks — all programs Green or Low</div>
            ) : (
              topRisks.map(p => (
                <div key={p.id} className="pmo-risk-row">
                  <span
                    className="pmo-risk-chip"
                    style={{ background: `${RISK_COLOR[p.riskExposure]}22`, color: RISK_COLOR[p.riskExposure], border: `1px solid ${RISK_COLOR[p.riskExposure]}44` }}
                  >
                    {p.riskExposure}
                  </span>
                  <span className="pmo-risk-name">{p.name}</span>
                  <span className="pmo-risk-owner" style={{ color: AGENT_COLOR[p.owner] || '#888' }}>{p.owner}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gate Activity */}
        <div className="panel pmo-section">
          <div className="panel-header">
            <span className="label">GATE ACTIVITY</span>
            <span style={{ fontSize: 10, color: '#555' }}>recent reviews</span>
          </div>
          <div className="pmo-gate-list">
            {recentGate.length === 0 ? (
              <div className="pmo-empty">No recent gate reviews recorded</div>
            ) : (
              recentGate.map(p => (
                <div key={p.id} className="pmo-gate-row">
                  <span className="pmo-gate-prog">{p.name}</span>
                  <span className="pmo-gate-arrow">→ {gateShort(p.gate)}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{fmtDate(p.lastReview)}</span>
                  <span className="pmo-rag-dot" style={{ background: RAG_COLOR[p.rag] || '#444' }} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
