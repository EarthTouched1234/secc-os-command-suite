import { useState, useEffect, useCallback } from 'react'
import type { FeedEntry } from '../api/n8n'
import { fetchPendingActions, approveAction, type ActionRecord } from '../api/n8n'

interface Props { feed: FeedEntry[] }

const AGENT_COLOR: Record<string, string> = {
  HORHANiS: '#f5c518',
  TRiO: '#62a8ff',
  TiTO: '#bf5af2',
  CiRO: '#32d2f2',
  SunNi: '#ffd60a',
  GUARDiAN: '#ff453a',
}

const TYPE_COLOR: Record<string, string> = {
  slack_alert: '#62a8ff',
  notion_write: '#30d158',
  icloud_save: '#aaa',
  github_push: '#f5a623',
  email_file: '#ff453a',
  workflow_run: '#bf5af2',
}

export function ApprovalQueue({ feed }: Props) {
  const queue = feed.filter((e) => e.requiresApproval || e.missionStatus === 'PENDING_APPROVAL')
  const [actions, setActions] = useState<ActionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{ id: string; status: string; url?: string | null } | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPendingActions()
      setActions(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleApprove = async (actionId: string, approved: boolean) => {
    setProcessing(actionId)
    setLastResult(null)
    try {
      const receipt = await approveAction(actionId, approved)
      setLastResult({ id: actionId, status: receipt.status, url: receipt.receipt_url_or_file_path })
      await refresh()
    } catch (err) {
      setLastResult({ id: actionId, status: 'error' })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Action Store — pending approvals from agents */}
      <div className="panel approval-queue">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label">ACTION STORE</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {actions.length > 0 && <span className="queue-badge">⚡ {actions.length} PENDING</span>}
            <button
              onClick={refresh}
              disabled={loading}
              style={{ fontSize: 10, padding: '2px 8px', background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer' }}
            >
              {loading ? '⟳' : 'Refresh'}
            </button>
          </div>
        </div>

        {lastResult && (
          <div style={{ padding: '6px 12px', fontSize: 11, background: lastResult.status === 'error' ? '#2a1a1a' : '#1a2a1a', borderBottom: '1px solid #333', color: lastResult.status === 'error' ? '#ff453a' : '#30d158' }}>
            {lastResult.status === 'error' ? '✗ Action failed' : `✓ ${lastResult.status}`}
            {lastResult.url && <a href={lastResult.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: '#62a8ff', fontSize: 10 }}>→ receipt</a>}
          </div>
        )}

        <div className="queue-list">
          {actions.length === 0 && !loading && (
            <div className="queue-empty">
              <span className="queue-clear">✓ ALL CLEAR</span>
              <div className="queue-sub">No agent actions pending approval</div>
            </div>
          )}
          {actions.map((a) => (
            <div key={a.action_id} className="queue-item">
              <div className="queue-item-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: AGENT_COLOR[a.agent] || '#888', fontWeight: 700 }}>{a.agent}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#1a1a1a', color: TYPE_COLOR[a.action_type] || '#888', border: `1px solid ${TYPE_COLOR[a.action_type] || '#333'}` }}>{a.action_type}</span>
                </div>
                <span className="queue-time">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</span>
              </div>
              <div className="queue-summary" style={{ marginTop: 4 }}>{a.preview_message}</div>
              {a.destination && (
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>→ {a.destination}</div>
              )}
              <div style={{ fontSize: 9, color: '#444', marginTop: 3, fontFamily: 'monospace' }}>{a.action_id}</div>
              <div className="queue-actions" style={{ marginTop: 8 }}>
                <button
                  className="btn-approve"
                  disabled={processing === a.action_id}
                  onClick={() => handleApprove(a.action_id, true)}
                >
                  {processing === a.action_id ? '...' : 'APPROVE'}
                </button>
                <button
                  className="btn-defer"
                  disabled={processing === a.action_id}
                  onClick={() => handleApprove(a.action_id, false)}
                  style={{ color: '#ff453a' }}
                >
                  DECLINE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy approval queue — workflow-level escalations */}
      {queue.length > 0 && (
        <div className="panel approval-queue">
          <div className="panel-header">
            <span className="label">WORKFLOW ESCALATIONS</span>
            <span className="queue-badge">⚠ {queue.length} PENDING</span>
          </div>
          <div className="queue-list">
            {queue.map((entry, i) => (
              <div key={entry.n8nExecutionId ?? i} className="queue-item">
                <div className="queue-item-header">
                  <span className="queue-wf">{entry.workflowName}</span>
                  <span className="queue-agent">{entry.agentName}</span>
                </div>
                <div className="queue-summary">{entry.summary}</div>
                <div className="queue-meta">
                  <span className="queue-domain">[{entry.domain?.toUpperCase()}]</span>
                  <span className="queue-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="queue-actions">
                  <button className="btn-approve">APPROVE</button>
                  <button className="btn-defer">DEFER</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
