import type { FeedEntry } from '../api/n8n'
import { computeMissionStatus } from '../hooks/useFeed'

interface Props {
  feed: FeedEntry[]
  lastUpdated: Date | null
}

const STATUS_COLOR = { NOMINAL: '#22c55e', ELEVATED: '#f59e0b', CRITICAL: '#ef4444' }

export function MissionStatus({ feed, lastUpdated }: Props) {
  const status = computeMissionStatus(feed)
  const color = STATUS_COLOR[status]

  const agents = ['HORHANiS', 'TiTO', 'CiRO', 'SunNi AI']
  const activeAgents = new Set(feed.slice(0, 10).map((e) => e.agentName))

  return (
    <div className="panel mission-status" style={{ borderColor: color }}>
      <div className="panel-header">
        <span className="label">MISSION STATUS</span>
        <span className="status-badge" style={{ color, borderColor: color }}>
          ◉ {status}
        </span>
      </div>
      <div className="mission-body">
        <div className="agent-status">
          {agents.map((a) => (
            <span key={a} className={`agent-chip ${activeAgents.has(a) ? 'active' : 'idle'}`}>
              {a} {activeAgents.has(a) ? '✓' : '○'}
            </span>
          ))}
        </div>
        <div className="last-updated">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          {' · '}
          {feed.length} events on record
        </div>
      </div>
    </div>
  )
}
