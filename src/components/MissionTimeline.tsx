import { useState, useEffect, useCallback } from 'react'
import { fetchWithRetry } from '../api/n8n'

const MILESTONE_URL = 'https://sunnicommandcenter.app.n8n.cloud/webhook/pmo/milestones'

type MilestoneStatus = 'Not Started' | 'In Progress' | 'At Risk' | 'Blocked' | 'Complete'
type Phase = 'Initiation' | 'Planning' | 'Execution' | 'Monitoring & Controlling' | 'Closure'

interface Milestone {
  id: string
  name: string
  program: string
  program_id: string
  phase: Phase
  gate: string
  status: MilestoneStatus
  priority: string
  owner: string
  due_date: string
  deliverable: string
  notes: string
}

interface Resource {
  id: string
  name: string
  role: string
  agent: string
  phase: string
  allocation: number
  status: string
}

interface PhaseSummary { phase: string; total: number; complete: number; at_risk: number; blocked: number }

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  'Complete':    '#22c55e',
  'In Progress': '#3b82f6',
  'At Risk':     '#f97316',
  'Blocked':     '#ef4444',
  'Not Started': '#444',
}
const STATUS_DOT: Record<MilestoneStatus, string> = {
  'Complete': '●', 'In Progress': '◐', 'At Risk': '⚠', 'Blocked': '✕', 'Not Started': '○',
}
const PHASE_COLOR: Record<string, string> = {
  'Initiation': '#64748b', 'Planning': '#3b82f6',
  'Execution': '#f97316', 'Monitoring & Controlling': '#eab308', 'Closure': '#22c55e',
}
const PRIORITY_COLOR: Record<string, string> = {
  'Critical': '#ef4444', 'High': '#f97316', 'Medium': '#f59e0b', 'Low': '#22c55e',
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function isOverdue(iso: string, status: MilestoneStatus) {
  if (!iso || status === 'Complete') return false
  return new Date(iso) < new Date()
}

export function MissionTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [phaseSummary, setPhaseSummary] = useState<PhaseSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [program, setProgram] = useState('SCADA')
  const [filterPhase, setFilterPhase] = useState<string>('All')
  const [view, setView] = useState<'timeline' | 'resources'>('timeline')
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchWithRetry(`${MILESTONE_URL}?program=${encodeURIComponent(program)}`, { method: 'GET' })
      if (!res.ok) return
      const data = await res.json()
      setMilestones(data.milestones || [])
      // Dedupe resources by id
      const seen = new Set<string>()
      const unique = (data.resources || []).filter((r: Resource) => {
        if (seen.has(r.id)) return false
        seen.add(r.id); return true
      })
      setResources(unique)
      setPhaseSummary(data.phase_summary || [])
      setLastFetch(new Date())
    } finally {
      setLoading(false)
    }
  }, [program])

  useEffect(() => { load() }, [load])

  const phases = ['All', 'Initiation', 'Planning', 'Execution', 'Monitoring & Controlling', 'Closure']
  const filtered = filterPhase === 'All' ? milestones : milestones.filter(m => m.phase === filterPhase)
  const complete  = milestones.filter(m => m.status === 'Complete').length
  const atRisk    = milestones.filter(m => m.status === 'At Risk').length
  const blocked   = milestones.filter(m => m.status === 'Blocked').length
  const overdue   = milestones.filter(m => isOverdue(m.due_date, m.status)).length
  const pct       = milestones.length ? Math.round((complete / milestones.length) * 100) : 0

  return (
    <div className="mt-root">

      {/* Header */}
      <div className="mt-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mt-title">Mission Timeline</span>
          <input
            className="mt-search"
            value={program}
            onChange={e => setProgram(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Program name..."
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lastFetch && <span style={{ fontSize: 9, color: '#444' }}>{lastFetch.toLocaleTimeString()}</span>}
          <button className={`mt-view-btn ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>Timeline</button>
          <button className={`mt-view-btn ${view === 'resources' ? 'active' : ''}`} onClick={() => setView('resources')}>Resources</button>
          <button className="mt-refresh" onClick={load} disabled={loading}>{loading ? '⟳' : 'Refresh'}</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-kpi-strip">
        <div className="mt-kpi"><span style={{ color: '#22c55e' }}>{complete}</span><span>Complete</span></div>
        <div className="mt-kpi"><span style={{ color: '#888' }}>{milestones.length - complete}</span><span>Remaining</span></div>
        <div className="mt-kpi"><span style={{ color: '#f97316' }}>{atRisk}</span><span>At Risk</span></div>
        <div className="mt-kpi"><span style={{ color: '#ef4444' }}>{blocked}</span><span>Blocked</span></div>
        <div className="mt-kpi"><span style={{ color: '#ef4444' }}>{overdue}</span><span>Overdue</span></div>
        <div className="mt-kpi" style={{ flex: 2 }}>
          <div className="mt-progress-bar">
            <div className="mt-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ color: '#888' }}>{pct}% complete</span>
        </div>
      </div>

      {/* Phase summary chips */}
      <div className="mt-phase-strip">
        {phases.map(ph => {
          const s = phaseSummary.find(p => p.phase === ph)
          return (
            <button
              key={ph}
              className={`mt-phase-chip ${filterPhase === ph ? 'active' : ''}`}
              style={{ borderColor: ph === 'All' ? '#333' : (PHASE_COLOR[ph] || '#333') + '66',
                       color: filterPhase === ph ? (PHASE_COLOR[ph] || '#888') : '#555' }}
              onClick={() => setFilterPhase(ph)}
            >
              {ph === 'All' ? `All (${milestones.length})` : `${ph.replace('Monitoring & Controlling','M&C')} ${s ? `(${s.complete}/${s.total})` : ''}`}
            </button>
          )
        })}
      </div>

      {view === 'timeline' && (
        <div className="mt-list">
          {filtered.length === 0 && !loading && (
            <div style={{ padding: 20, color: '#444', fontSize: 12, textAlign: 'center' }}>No milestones found for "{program}"</div>
          )}
          {filtered.map(m => {
            const od = isOverdue(m.due_date, m.status)
            return (
              <div key={m.id} className={`mt-row ${m.status === 'Blocked' ? 'mt-row-blocked' : od ? 'mt-row-overdue' : ''}`}>
                <div className="mt-row-left">
                  <span className="mt-status-dot" style={{ color: STATUS_COLOR[m.status] }}>{STATUS_DOT[m.status]}</span>
                  <div className="mt-row-body">
                    <div className="mt-row-name">{m.name}</div>
                    <div className="mt-row-meta">
                      <span className="mt-phase-tag" style={{ color: PHASE_COLOR[m.phase] || '#888' }}>{m.phase}</span>
                      <span style={{ color: '#444' }}>·</span>
                      <span style={{ color: '#555' }}>{m.gate}</span>
                      <span style={{ color: '#444' }}>·</span>
                      <span style={{ color: '#666' }}>{m.owner}</span>
                    </div>
                    {m.deliverable && <div className="mt-deliverable">→ {m.deliverable.slice(0, 100)}{m.deliverable.length > 100 ? '…' : ''}</div>}
                  </div>
                </div>
                <div className="mt-row-right">
                  <span className="mt-priority" style={{ color: PRIORITY_COLOR[m.priority] || '#888' }}>{m.priority}</span>
                  <span className={`mt-due ${od ? 'mt-due-late' : ''}`}>{od ? '⚠ ' : ''}{fmtDate(m.due_date)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'resources' && (
        <div className="mt-list">
          {resources.map(r => (
            <div key={r.id} className="mt-row">
              <div className="mt-row-left">
                <span className="mt-status-dot" style={{ color: r.status === 'Active' ? '#22c55e' : '#555' }}>
                  {r.status === 'Active' ? '●' : r.status === 'Standby' ? '◐' : '○'}
                </span>
                <div className="mt-row-body">
                  <div className="mt-row-name">{r.name}</div>
                  <div className="mt-row-meta">
                    <span style={{ color: '#555' }}>{r.role}</span>
                    <span style={{ color: '#444' }}>·</span>
                    <span style={{ color: '#666' }}>{r.phase}</span>
                  </div>
                </div>
              </div>
              <div className="mt-row-right">
                <span className="mt-alloc">{r.allocation}%</span>
                <span style={{ fontSize: 9, color: r.status === 'Active' ? '#22c55e' : '#555' }}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
