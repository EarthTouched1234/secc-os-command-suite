import type { FeedEntry } from '../api/n8n'

interface Props { feed: FeedEntry[] }

const DOMAIN_COLOR: Record<string, string> = {
  ccos: '#c9a227', income: '#22c55e', housing: '#60a5fa',
  health: '#f472b6', business: '#a78bfa',
}

const STATUS_COLOR: Record<string, string> = {
  ESCALATE: '#ef4444', PENDING_APPROVAL: '#f59e0b', LOGGED: '#6b7280',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AgentFeed({ feed }: Props) {
  return (
    <div className="panel agent-feed">
      <div className="panel-header">
        <span className="label">LIVE AGENT FEED</span>
        <span className="feed-count">{feed.length} events</span>
      </div>
      <div className="feed-list">
        {feed.length === 0 && <div className="feed-empty">No events yet. Waiting for dispatch...</div>}
        {feed.map((entry, i) => (
          <div key={entry.n8nExecutionId ?? i} className="feed-entry">
            <div className="feed-meta">
              <span className="feed-time">{timeAgo(entry.startedAt)}</span>
              <span className="feed-domain" style={{ color: DOMAIN_COLOR[entry.domain] ?? '#c9a227' }}>
                [{entry.domain?.toUpperCase() ?? 'CCOS'}]
              </span>
              <span
                className="feed-mission-status"
                style={{ color: STATUS_COLOR[entry.missionStatus] ?? '#6b7280' }}
              >
                {entry.missionStatus}
              </span>
            </div>
            <div className="feed-content">
              <span className="feed-agent">{entry.agentName ?? 'HORHANiS'}</span>
              <span className="feed-arrow"> → </span>
              <span className="feed-workflow">{entry.workflowName}</span>
            </div>
            <div className="feed-summary">{entry.summary}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
