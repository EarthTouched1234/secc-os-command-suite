import type { FeedEntry } from '../api/n8n'

interface Props { feed: FeedEntry[] }

const AGENTS = [
  { name: 'HORHANiS', role: 'Executive Guardian & Chief of Staff', acoustic: 'Deep Baritone · High Stability', icon: '𓂀', color: '#c9a227' },
  { name: 'SunNi',    role: 'Intent & Strategy Engine',            acoustic: 'Mid-Range Warmth · Conversational', icon: '☀',  color: '#f5e9c0' },
  { name: 'TiTO',     role: 'Execution & Operations Engine',        acoustic: 'Crisp Treble · Fast-Paced',         icon: '⚡', color: '#60a5fa' },
  { name: 'TRiO',     role: 'Validation & Oversight Engine',        acoustic: 'Harmonized · Polyphonic',           icon: '⚖', color: '#a78bfa' },
  { name: 'CiRO',     role: 'Reflection & Improvement Engine',      acoustic: 'Rich & Mellow · Scholarly',         icon: '𓏏', color: '#22c55e' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function TheCouncil({ feed }: Props) {
  const recent = feed.slice(0, 20)

  return (
    <div className="quadrant">
      <div className="q-header">
        <span className="q-eyebrow">I</span>
        <span className="q-title">THE COUNCIL</span>
        <span className="q-sub">Engine Mandates</span>
      </div>
      <div className="council-grid">
        {AGENTS.map((agent) => {
          const entries = recent.filter((e) => e.agentName === agent.name)
          const latest = entries[0]
          const isEscalated = entries.some((e) => e.missionStatus === 'ESCALATE')
          const isActive = entries.length > 0
          const statusLabel = isEscalated ? 'ESCALATED' : isActive ? 'ACTIVE' : 'STANDBY'
          const statusColor = isEscalated ? '#ef4444' : isActive ? '#22c55e' : '#4a4a5a'

          return (
            <div key={agent.name} className="agent-card" style={{ borderColor: isActive ? agent.color + '44' : 'var(--border)' }}>
              <div className="agent-card-top">
                <span className="agent-icon" style={{ color: agent.color }}>{agent.icon}</span>
                <div className="agent-info">
                  <span className="agent-name" style={{ color: agent.color }}>{agent.name}</span>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <span className="agent-status-dot" style={{ color: statusColor, borderColor: statusColor }}>
                  {statusLabel}
                </span>
              </div>
              <div className="agent-card-bot">
                <span className="agent-acoustic">♪ {agent.acoustic}</span>
                {latest && (
                  <span className="agent-last">↪ {latest.workflowName} · {timeAgo(latest.startedAt)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
