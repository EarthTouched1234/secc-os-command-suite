import type { FeedEntry } from '../api/n8n'
import { computeDomainStatus } from '../hooks/useFeed'

interface Props { feed: FeedEntry[] }

const DOMAIN_ICONS: Record<string, string> = {
  housing: '🏠', income: '💰', health: '❤️', business: '⚡', ccos: '🛰',
}

const STATUS_COLOR: Record<string, string> = {
  NOMINAL: '#22c55e', ELEVATED: '#f59e0b', CRITICAL: '#ef4444', DEGRADED: '#f97316',
}

const DOMAINS = ['housing', 'income', 'health', 'business', 'ccos'] as const

export function PriorityMonitor({ feed }: Props) {
  const statusMap = computeDomainStatus(feed)

  return (
    <div className="panel priority-monitor">
      <div className="panel-header">
        <span className="label">PRIORITY DOMAINS</span>
      </div>
      <div className="domain-list">
        {DOMAINS.map((d) => {
          const s = statusMap[d]
          const color = STATUS_COLOR[s] ?? '#22c55e'
          return (
            <div key={d} className="domain-row">
              <span className="domain-dot" style={{ color }}>●</span>
              <span className="domain-icon">{DOMAIN_ICONS[d]}</span>
              <span className="domain-name">{d.toUpperCase()}</span>
              <span className="domain-status" style={{ color }}>{s}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
