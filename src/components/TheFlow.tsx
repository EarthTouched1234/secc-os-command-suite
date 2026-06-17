import type { FeedEntry } from '../api/n8n'
import type { SystemExecution } from '../api/n8n'

interface Props {
  feed: FeedEntry[]
  systemExecs: SystemExecution[]
}

const STATUS_COLOR: Record<string, string> = {
  success: '#22c55e', error: '#ef4444', running: '#f59e0b', waiting: '#60a5fa',
}

const ROUTE_LABEL: Record<string, string> = {
  horhanis_direct: 'HORHANiS', tito_strategy: 'TiTO',
  ciro_integration: 'CiRO', trio_voice: 'TRiO',
  human_approval: 'SunNi ⚠', fallback: 'FALLBACK',
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function TheFlow({ feed, systemExecs }: Props) {
  const dispatches = feed.slice(0, 6)
  const allExecs = systemExecs.slice(0, 12)

  return (
    <div className="quadrant">
      <div className="q-header">
        <span className="q-eyebrow">II</span>
        <span className="q-title">THE FLOW</span>
        <span className="q-sub">n8n Automations</span>
      </div>

      <div className="flow-body">
        {dispatches.length > 0 && (
          <div className="flow-section">
            <div className="flow-section-label">▸ DISPATCH STREAM</div>
            {dispatches.map((e, i) => (
              <div key={e.n8nExecutionId ?? i} className="flow-row dispatch-row">
                <span className="flow-time">{fmtTime(e.startedAt)}</span>
                <span className="flow-agent" style={{ color: '#c9a227' }}>
                  {ROUTE_LABEL[e.routeKey ?? ''] ?? e.agentName ?? '—'}
                </span>
                <span className="flow-wf">{e.workflowName}</span>
                <span className={`flow-status ms-${e.missionStatus}`}>{e.missionStatus}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flow-section">
          <div className="flow-section-label">▸ EXECUTION LOG</div>
          {allExecs.length === 0 && <div className="flow-empty">No executions yet</div>}
          {allExecs.map((e) => (
            <div key={e.id} className="flow-row">
              <span className="flow-time">{fmtTime(e.startedAt)}</span>
              <span className="flow-dot" style={{ color: STATUS_COLOR[e.status] ?? '#6b7280' }}>●</span>
              <span className="flow-wf">{e.workflowName ?? e.workflowId}</span>
              <span className="flow-exec-status" style={{ color: STATUS_COLOR[e.status] ?? '#6b7280' }}>
                {e.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
