import { useState, useEffect, useCallback } from 'react'
import {
  fetchRiskRegister,
  PROTECTED_ACTION_TYPES,
  type RiskEntry,
} from '../api/n8n'

const RISK_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#22c55e',
}

const STATUS_COLOR: Record<string, string> = {
  Intercepted:       '#f97316',
  'Pending Approval': '#f59e0b',
  Authorized:        '#22c55e',
  Declined:          '#ef4444',
  Logged:            '#64748b',
}

function fmtTime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function GUARDiAN() {
  const [entries, setEntries] = useState<RiskEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchRiskRegister()
      setEntries(data)
      setLastFetch(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const intercepted  = entries.filter(e => e.status === 'Intercepted' || e.status === 'Pending Approval').length
  const authorized   = entries.filter(e => e.status === 'Authorized').length
  const declined     = entries.filter(e => e.status === 'Declined').length
  const critical     = entries.filter(e => e.risk_level === 'Critical').length

  const criticalTypes  = Object.entries(PROTECTED_ACTION_TYPES).filter(([, v]) => v.riskLevel === 'Critical')
  const highTypes      = Object.entries(PROTECTED_ACTION_TYPES).filter(([, v]) => v.riskLevel === 'High')
  const mediumTypes    = Object.entries(PROTECTED_ACTION_TYPES).filter(([, v]) => v.riskLevel === 'Medium')

  return (
    <div className="guardian-root">

      {/* Header */}
      <div className="guardian-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="guardian-title">GUARDiAN</span>
          <span className="guardian-subtitle">Zero-Trust Enforcement Layer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="guardian-golden-rule">
            <span className="guardian-rule-dot" />
            GOLDEN RULE ACTIVE
          </div>
          <button
            className="guardian-refresh"
            onClick={load}
            disabled={loading}
          >
            {loading ? '⟳' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Golden Rule statement */}
      <div className="guardian-doctrine">
        <span className="guardian-doctrine-label">DOCTRINE</span>
        <span className="guardian-doctrine-text">
          AI agents operate the machinery. Cartez Harris holds exclusive launch authority.
          No financial, architectural, or security action executes without a human authorization token.
        </span>
      </div>

      {/* KPI strip */}
      <div className="guardian-kpi-strip">
        <div className="guardian-kpi">
          <span className="guardian-kpi-value" style={{ color: '#f59e0b' }}>{intercepted}</span>
          <span className="guardian-kpi-label">Pending</span>
        </div>
        <div className="guardian-kpi">
          <span className="guardian-kpi-value" style={{ color: '#22c55e' }}>{authorized}</span>
          <span className="guardian-kpi-label">Authorized</span>
        </div>
        <div className="guardian-kpi">
          <span className="guardian-kpi-value" style={{ color: '#ef4444' }}>{declined}</span>
          <span className="guardian-kpi-label">Declined</span>
        </div>
        <div className="guardian-kpi">
          <span className="guardian-kpi-value" style={{ color: '#ef4444' }}>{critical}</span>
          <span className="guardian-kpi-label">Critical</span>
        </div>
        <div className="guardian-kpi">
          <span className="guardian-kpi-value" style={{ color: '#888' }}>{entries.length}</span>
          <span className="guardian-kpi-label">Total Logged</span>
        </div>
      </div>

      <div className="guardian-body">

        {/* Enforcement Ruleset */}
        <div className="guardian-panel">
          <div className="guardian-panel-header">ENFORCEMENT RULESET — {Object.keys(PROTECTED_ACTION_TYPES).length} PROTECTED TYPES</div>

          {[['Critical', criticalTypes], ['High', highTypes], ['Medium', mediumTypes]] .map(([level, types]) => (
            <div key={level as string} className="guardian-rule-group">
              <div className="guardian-rule-level" style={{ color: RISK_COLOR[level as string] }}>
                ▸ {level as string}
              </div>
              {(types as [string, { riskLevel: string; reason: string }][]).map(([key, val]) => (
                <div key={key} className="guardian-rule-row">
                  <span className="guardian-rule-key">{key}</span>
                  <span className="guardian-rule-reason">{val.reason}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="guardian-rule-group">
            <div className="guardian-rule-level" style={{ color: '#22c55e' }}>▸ Low — Non-Protected (pass-through)</div>
            <div className="guardian-rule-row">
              <span className="guardian-rule-key">slack_alert, notion_write, icloud_save</span>
              <span className="guardian-rule-reason">Standard operational actions — no block</span>
            </div>
          </div>
        </div>

        {/* Risk & Decision Register */}
        <div className="guardian-panel">
          <div className="guardian-panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>RISK & DECISION REGISTER</span>
            {lastFetch && (
              <span style={{ color: '#444', fontWeight: 400 }}>
                fetched {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </div>

          {entries.length === 0 && !loading && (
            <div className="guardian-empty">
              <span style={{ color: '#22c55e', fontSize: 13 }}>✓ Register clear</span>
              <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>No entries logged yet — n8n workflow needed to activate live feed</div>
            </div>
          )}

          {entries.map((e) => (
            <div key={e.id} className="guardian-entry">
              <div className="guardian-entry-header">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    className="guardian-risk-badge"
                    style={{ color: RISK_COLOR[e.risk_level] || '#888', borderColor: RISK_COLOR[e.risk_level] || '#333' }}
                  >
                    {e.risk_level}
                  </span>
                  <span style={{ fontSize: 10, color: '#888', fontWeight: 700 }}>{e.agent}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{e.action_type}</span>
                </div>
                <span
                  className="guardian-status-badge"
                  style={{ color: STATUS_COLOR[e.status] || '#888' }}
                >
                  {e.status}
                </span>
              </div>
              <div className="guardian-entry-title">{e.title}</div>
              <div className="guardian-entry-meta">
                {e.program && <span>Program: {e.program}</span>}
                <span>{fmtTime(e.logged_at)}</span>
                {e.authorized_by && <span style={{ color: '#22c55e' }}>✓ {e.authorized_by}</span>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
