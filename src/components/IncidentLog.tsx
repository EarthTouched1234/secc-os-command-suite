import type { FeedEntry, SystemExecution } from '../api/n8n'

interface Props {
  feed: FeedEntry[]
  systemExecs: SystemExecution[]
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  })
}

export function IncidentLog({ feed, systemExecs }: Props) {
  const escalated = feed.filter((e) => e.missionStatus === 'ESCALATE' || e.escalate)
  const errorExecs = systemExecs.filter((e) => e.status === 'error').slice(0, 8)

  return (
    <div className="panel incident-log">
      <div className="panel-header">
        <span className="label">INCIDENT LOG</span>
        <span className="incident-count">
          {escalated.length} escalated · {errorExecs.length} errors
        </span>
      </div>
      <div className="incident-list">
        {escalated.length === 0 && errorExecs.length === 0 && (
          <div className="incident-empty">✓ No incidents on record</div>
        )}

        {escalated.map((e, i) => (
          <div key={`esc-${i}`} className="incident-row escalated">
            <span className="inc-badge open">ESCALATE</span>
            <span className="inc-time">{fmtTime(e.timestamp)}</span>
            <span className="inc-name">{e.workflowName}</span>
            <span className="inc-summary">{e.summary}</span>
          </div>
        ))}

        {errorExecs.map((e) => (
          <div key={e.id} className="incident-row error">
            <span className="inc-badge error">ERROR</span>
            <span className="inc-time">{fmtTime(e.startedAt)}</span>
            <span className="inc-name">{e.workflowName ?? e.workflowId}</span>
            <span className="inc-summary">Execution failed — check n8n logs</span>
          </div>
        ))}
      </div>
    </div>
  )
}
