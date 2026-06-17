import type { FeedEntry } from '../api/n8n'
import type { SystemExecution } from '../api/n8n'
import { computeMissionStatus, computeDomainStatus } from '../hooks/useFeed'

interface Props {
  feed: FeedEntry[]
  systemExecs: SystemExecution[]
  lastUpdated: Date | null
}

const MISSION_COLOR = { NOMINAL: '#22c55e', ELEVATED: '#f59e0b', CRITICAL: '#ef4444' }
const DOMAIN_ICON: Record<string, string> = {
  housing: '🏠', income: '💰', health: '❤', business: '⚡', ccos: '𓂀',
}
const DOMAIN_STATUS_COLOR: Record<string, string> = {
  NOMINAL: '#22c55e', ELEVATED: '#f59e0b', CRITICAL: '#ef4444', DEGRADED: '#f97316',
}

export function ThePulse({ feed, systemExecs, lastUpdated }: Props) {
  const missionStatus = computeMissionStatus(feed)
  const domainStatus = computeDomainStatus(feed)
  const missionColor = MISSION_COLOR[missionStatus]

  const total = systemExecs.length
  const errors = systemExecs.filter((e) => e.status === 'error').length
  const successes = systemExecs.filter((e) => e.status === 'success').length
  const successRate = total > 0 ? Math.round((successes / total) * 100) : 100
  const escalated = feed.filter((e) => e.missionStatus === 'ESCALATE').length
  const pending = feed.filter((e) => e.requiresApproval).length

  const chakraSteps = [
    { name: 'Root', label: 'INITIATION' },
    { name: 'Sacral', label: 'PLANNING' },
    { name: 'Solar', label: 'EXECUTION' },
    { name: 'Heart', label: 'MONITORING' },
    { name: 'Throat', label: 'CLOSING' },
  ]

  return (
    <div className="quadrant">
      <div className="q-header">
        <span className="q-eyebrow">III</span>
        <span className="q-title">THE PULSE</span>
        <span className="q-sub">System Health</span>
      </div>

      <div className="pulse-body">
        <div className="pulse-mission" style={{ borderColor: missionColor, color: missionColor }}>
          <span className="pulse-mission-dot">◉</span>
          <span className="pulse-mission-label">CASTLE STATUS</span>
          <span className="pulse-mission-value">{missionStatus}</span>
        </div>

        <div className="pulse-stats">
          <div className="pulse-stat">
            <span className="ps-value">{total}</span>
            <span className="ps-label">EXECUTIONS</span>
          </div>
          <div className="pulse-stat">
            <span className="ps-value" style={{ color: successRate < 80 ? '#ef4444' : '#22c55e' }}>{successRate}%</span>
            <span className="ps-label">SUCCESS RATE</span>
          </div>
          <div className="pulse-stat">
            <span className="ps-value" style={{ color: errors > 0 ? '#ef4444' : '#22c55e' }}>{errors}</span>
            <span className="ps-label">ERRORS</span>
          </div>
          <div className="pulse-stat">
            <span className="ps-value" style={{ color: escalated > 0 ? '#ef4444' : '#22c55e' }}>{escalated}</span>
            <span className="ps-label">ESCALATED</span>
          </div>
          <div className="pulse-stat">
            <span className="ps-value" style={{ color: pending > 0 ? '#f59e0b' : '#22c55e' }}>{pending}</span>
            <span className="ps-label">PENDING APPROVAL</span>
          </div>
          <div className="pulse-stat">
            <span className="ps-value">{feed.length}</span>
            <span className="ps-label">DISPATCHES</span>
          </div>
        </div>

        <div className="pulse-domains">
          <div className="pulse-section-label">PRIORITY SECTORS</div>
          {(['housing', 'income', 'health', 'business', 'ccos'] as const).map((d) => {
            const s = domainStatus[d]
            const c = DOMAIN_STATUS_COLOR[s] ?? '#22c55e'
            return (
              <div key={d} className="pulse-domain-row">
                <span>{DOMAIN_ICON[d]}</span>
                <span className="pd-name">{d.toUpperCase()}</span>
                <div className="pd-bar-wrap">
                  <div className="pd-bar" style={{ backgroundColor: c, opacity: 0.3, width: '100%' }} />
                </div>
                <span className="pd-status" style={{ color: c }}>{s}</span>
              </div>
            )
          })}
        </div>

        <div className="pulse-chakras">
          <div className="pulse-section-label">PMI CHAKRA MATRIX</div>
          <div className="chakra-row">
            {chakraSteps.map((c, i) => (
              <div key={c.name} className="chakra-step">
                <div className="chakra-dot" style={{ background: `hsl(${i * 50 + 20}, 80%, 55%)` }} />
                <span className="chakra-name">{c.name}</span>
                <span className="chakra-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {lastUpdated && (
          <div className="pulse-footer">
            LAST SYNC {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
