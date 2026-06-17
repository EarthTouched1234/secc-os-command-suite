import type { FeedEntry } from '../api/n8n'

interface Props { feed: FeedEntry[] }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

const DOMAIN_COLOR: Record<string, string> = {
  ccos: '#c9a227', income: '#22c55e', housing: '#60a5fa',
  health: '#f472b6', business: '#a78bfa',
}

export function TheArchives({ feed }: Props) {
  const approvals = feed.filter((e) => e.requiresApproval || e.missionStatus === 'PENDING_APPROVAL')
  const dispatches = feed.slice(0, 10)

  return (
    <div className="quadrant">
      <div className="q-header">
        <span className="q-eyebrow">IV</span>
        <span className="q-title">THE ARCHIVES</span>
        <span className="q-sub">Notion Portfolios</span>
      </div>

      <div className="archives-body">
        {approvals.length > 0 && (
          <div className="archives-section">
            <div className="archives-section-label approval-label">
              ⚠ APPROVAL QUEUE — {approvals.length} PENDING
            </div>
            {approvals.map((e, i) => (
              <div key={e.n8nExecutionId ?? i} className="archive-row approval-row">
                <span className="ar-time">{fmtTime(e.timestamp)}</span>
                <span className="ar-agent" style={{ color: '#f59e0b' }}>{e.agentName}</span>
                <span className="ar-summary">{e.summary}</span>
                <div className="ar-actions">
                  <button className="btn-approve">✓</button>
                  <button className="btn-defer">—</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="archives-section">
          <div className="archives-section-label">▸ DISPATCH LEDGER</div>
          {dispatches.length === 0 && (
            <div className="archives-empty">No dispatches on record</div>
          )}
          {dispatches.map((e, i) => (
            <div key={e.n8nExecutionId ?? i} className="archive-row">
              <span className="ar-time">{fmtTime(e.timestamp)}</span>
              <span
                className="ar-domain"
                style={{ color: DOMAIN_COLOR[e.domain] ?? '#c9a227' }}
              >
                [{e.domain?.toUpperCase() ?? 'CCOS'}]
              </span>
              <span className="ar-summary">{e.summary || e.workflowName}</span>
              <span className={`ar-ms ar-ms-${e.missionStatus}`}>{e.missionStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
