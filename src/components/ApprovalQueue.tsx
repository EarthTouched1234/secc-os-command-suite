import type { FeedEntry } from '../api/n8n'

interface Props { feed: FeedEntry[] }

export function ApprovalQueue({ feed }: Props) {
  const queue = feed.filter((e) => e.requiresApproval || e.missionStatus === 'PENDING_APPROVAL')

  return (
    <div className="panel approval-queue">
      <div className="panel-header">
        <span className="label">APPROVAL QUEUE</span>
        {queue.length > 0 && (
          <span className="queue-badge">⚠ {queue.length} PENDING</span>
        )}
      </div>
      <div className="queue-list">
        {queue.length === 0 && (
          <div className="queue-empty">
            <span className="queue-clear">✓ ALL CLEAR</span>
            <div className="queue-sub">No items require approval</div>
          </div>
        )}
        {queue.map((entry, i) => (
          <div key={entry.n8nExecutionId ?? i} className="queue-item">
            <div className="queue-item-header">
              <span className="queue-wf">{entry.workflowName}</span>
              <span className="queue-agent">{entry.agentName}</span>
            </div>
            <div className="queue-summary">{entry.summary}</div>
            <div className="queue-meta">
              <span className="queue-domain">[{entry.domain?.toUpperCase()}]</span>
              <span className="queue-time">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="queue-actions">
              <button className="btn-approve">APPROVE</button>
              <button className="btn-defer">DEFER</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
