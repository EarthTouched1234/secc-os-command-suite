import { useState } from 'react'

interface Project {
  name: string
  status: 'active' | 'hold' | 'complete'
  description: string
  workflows: string[]
  notionId?: string
  lastUpdated: string
}

const PROJECTS: Project[] = [
  {
    name: 'SECC-OS Core',
    status: 'active',
    description: 'HORHANiS dispatch, Agent Sandbox, Voice Command Webhook, Command Chat PWA',
    workflows: ['Voice Command Webhook', 'HORHANiS Conversation', 'SECC-OS Agent Sandbox', 'Command Chat PWA'],
    lastUpdated: '2026-06-17',
  },
  {
    name: 'LIE — Leasing Intelligence Engine',
    status: 'active',
    description: '5-workflow leasing performance system: DAR, Follow-Up Alerts, TRiO Reasoning, Dashboard, Weekly Brief',
    workflows: ['DAR Generator', 'Follow-Up Gap Alert', 'TRiO Reasoning', 'Dashboard Refresh', 'Weekly Brief'],
    notionId: '7478bcb2-085a-4059-814c-73c1439a9eb0',
    lastUpdated: '2026-06-17',
  },
  {
    name: 'Revenue Engine',
    status: 'active',
    description: 'Full $3k+/week automation sales pipeline — Lead → Qualify → Close → Deliver → Retain',
    workflows: ['Lead Intake', 'Qualification Form', 'Pre-Call Brief', 'Proposal Generator', 'Close Deal', 'Nurture Reminder'],
    lastUpdated: '2026-06-15',
  },
  {
    name: 'BEATS Automation Intelligence Engine',
    status: 'active',
    description: '8-week build: Capture → Theme Intelligence → Draft → Approval → Publishing → Metrics → Optimization',
    workflows: ['Capture Engine', 'Theme Intelligence', 'Draft Generation', 'Approval Center', 'Publishing Engine', 'Metrics Engine', 'Self-Audit'],
    lastUpdated: '2026-06-15',
  },
  {
    name: 'SSIE — Social Content Engine',
    status: 'active',
    description: 'AI-powered social publishing: LinkedIn live, Instagram/Twitter/TikTok stubbed',
    workflows: ['SSIE Direct Publisher', 'SSIE Daily Brief', 'SSIE Content Calendar'],
    lastUpdated: '2026-06-15',
  },
  {
    name: 'SECC-OS Computer Use',
    status: 'active',
    description: 'Browser automation for agents via BrowserBase + Stagehand v3.5 + claude-sonnet-4-6',
    workflows: ['Computer Use Orchestrator'],
    lastUpdated: '2026-06-17',
  },
  {
    name: 'CIE — Credit Intelligence Engine',
    status: 'hold',
    description: 'Credit report intake, dispute generation, score tracking — Phase 1 MVP built',
    workflows: ['Report Intake', 'Dispute Generator', 'Dispute Tracker', 'Score Monitor', 'Client Intake'],
    lastUpdated: '2026-06-17',
  },
  {
    name: 'BRiDGE Ecosystem',
    status: 'hold',
    description: '14-component architecture: Library, Institute, Vault, Social, Badge Hub, Guardian Trust Fabric',
    workflows: [],
    lastUpdated: '2026-06-15',
  },
]

const STATUS_COLOR: Record<Project['status'], string> = {
  active: '#30d158',
  hold: '#ffb020',
  complete: '#62a8ff',
}

const STATUS_LABEL: Record<Project['status'], string> = {
  active: '● Active',
  hold: '⏸ On Hold',
  complete: '✓ Complete',
}

export function Projects() {
  const [filter, setFilter] = useState<'all' | Project['status']>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const visible = PROJECTS.filter(p => filter === 'all' || p.status === filter)

  return (
    <div className="projects-root">
      <div className="projects-header">
        <div className="filter-group">
          {(['all', 'active', 'hold', 'complete'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${PROJECTS.length})` : f === 'active' ? `Active (${PROJECTS.filter(p=>p.status==='active').length})` : f === 'hold' ? `On Hold (${PROJECTS.filter(p=>p.status==='hold').length})` : `Complete (${PROJECTS.filter(p=>p.status==='complete').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="project-grid">
        {visible.map(p => (
          <div
            key={p.name}
            className={`project-card ${expanded === p.name ? 'expanded' : ''}`}
            onClick={() => setExpanded(expanded === p.name ? null : p.name)}
          >
            <div className="project-card-header">
              <div className="project-info">
                <span className="project-name">{p.name}</span>
                <span className="project-status" style={{ color: STATUS_COLOR[p.status] }}>{STATUS_LABEL[p.status]}</span>
              </div>
              <span className="project-date">{p.lastUpdated}</span>
            </div>
            <p className="project-desc">{p.description}</p>
            {expanded === p.name && p.workflows.length > 0 && (
              <div className="project-workflows">
                <div className="workflows-label">Workflows</div>
                <div className="workflow-chips">
                  {p.workflows.map(w => <span key={w} className="workflow-chip">{w}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
