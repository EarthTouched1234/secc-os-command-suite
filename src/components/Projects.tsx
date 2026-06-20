import { useState } from 'react'

type ProgramStatus = 'active' | 'hold' | 'complete'
type AreaStatus = 'active' | 'paused' | 'building' | 'hold'
type Agent = 'HORHANiS' | 'TRiO' | 'TiTO' | 'CiRO' | 'SunNi' | 'GUARDiAN'
type View = 'programs' | 'portfolio'

interface Program {
  name: string
  status: ProgramStatus
  description: string
  workflows: string[]
  lastUpdated: string
}

interface Area {
  id: string
  name: string
  agent: Agent
  status: AreaStatus
  outlook: boolean
  icloud: boolean
  notion: boolean
  github: boolean
}

const AGENT_COLOR: Record<Agent, string> = {
  HORHANiS: '#f5c518',
  TRiO: '#62a8ff',
  TiTO: '#bf5af2',
  CiRO: '#32d2f2',
  SunNi: '#ffd60a',
  GUARDiAN: '#ff453a',
}

const AREA_STATUS_COLOR: Record<AreaStatus, string> = {
  active: '#30d158',
  paused: '#ffb020',
  building: '#32d2f2',
  hold: '#ff453a',
}

const AREA_STATUS_LABEL: Record<AreaStatus, string> = {
  active: '● Active',
  paused: '⏸ Paused',
  building: '⟳ Building',
  hold: '✕ Hold',
}

const PROGRAMS: Program[] = [
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

const AREAS: Area[] = [
  { id: '00', name: 'Command Center Core',                    agent: 'SunNi',    status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '01', name: 'Agent Council',                          agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '02', name: 'Governance & Approval',                  agent: 'GUARDiAN', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '03', name: 'Intake, Routing & Memory',               agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '04', name: 'n8n Automation Portfolio',               agent: 'CiRO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '05', name: 'Revenue Engine',                         agent: 'TRiO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '06', name: 'SSIE Content Intelligence',              agent: 'TiTO',     status: 'paused',   outlook: true, icloud: true, notion: true, github: false },
  { id: '07', name: 'SOIE Opportunity Intelligence',          agent: 'TRiO',     status: 'building', outlook: true, icloud: true, notion: true, github: false },
  { id: '08', name: 'LIE Leasing Intelligence',               agent: 'TRiO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '09', name: 'CIE Credit Intelligence',                agent: 'HORHANiS', status: 'hold',     outlook: true, icloud: true, notion: true, github: false },
  { id: '10', name: 'BEATS PYRAMiD Intelligence',             agent: 'TiTO',     status: 'paused',   outlook: true, icloud: true, notion: true, github: false },
  { id: '11', name: 'Computer Use & Browser Automation',      agent: 'CiRO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '12', name: 'Commander Console Apps',                 agent: 'CiRO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '13', name: 'Infrastructure, Devices & Network',      agent: 'GUARDiAN', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '14', name: 'GitHub Sovereign Backup',                agent: 'CiRO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '15', name: 'Source Vault & BRiDGE Library',          agent: 'SunNi',    status: 'building', outlook: true, icloud: true, notion: true, github: false },
  { id: '16', name: 'Legal Protection Intelligence',          agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '17', name: 'Financial Intelligence',                 agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '18', name: 'Housing & Employment Protection',        agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '19', name: 'Accident, Claim & Residency',            agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '20', name: 'Probation & Court Compliance',           agent: 'GUARDiAN', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '21', name: 'Career & Job Search',                    agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '22', name: 'LinkedIn Brand & Public Voice',          agent: 'TiTO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '23', name: 'Business, Nonprofit & Grant Intel',      agent: 'TRiO',     status: 'building', outlook: true, icloud: true, notion: true, github: false },
  { id: '24', name: 'Creative Business Archive',              agent: 'TiTO',     status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '25', name: 'Education & Skill Development',          agent: 'SunNi',    status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '26', name: 'Emergency Operations',                   agent: 'HORHANiS', status: 'active',   outlook: true, icloud: true, notion: true, github: false },
  { id: '27', name: 'Audits, Reports & Executive Briefs',     agent: 'SunNi',    status: 'active',   outlook: true, icloud: true, notion: true, github: false },
]

const PROG_STATUS_COLOR: Record<ProgramStatus, string> = {
  active: '#30d158', hold: '#ffb020', complete: '#62a8ff',
}
const PROG_STATUS_LABEL: Record<ProgramStatus, string> = {
  active: '● Active', hold: '⏸ On Hold', complete: '✓ Complete',
}

function PlatformDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span title={label} style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: active ? '#30d158' : '#3a3a3a',
      marginRight: 4, border: active ? 'none' : '1px solid #555',
    }} />
  )
}

export function Projects() {
  const [view, setView] = useState<View>('portfolio')
  const [filter, setFilter] = useState<'all' | ProgramStatus>('all')
  const [agentFilter, setAgentFilter] = useState<'all' | Agent>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AreaStatus>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const visiblePrograms = PROGRAMS.filter(p => filter === 'all' || p.status === filter)
  const visibleAreas = AREAS.filter(a =>
    (agentFilter === 'all' || a.agent === agentFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  )

  const agents: Agent[] = ['HORHANiS', 'TRiO', 'TiTO', 'CiRO', 'SunNi', 'GUARDiAN']
  const areaStatuses: AreaStatus[] = ['active', 'paused', 'building', 'hold']

  const syncCounts = {
    outlook: AREAS.filter(a => a.outlook).length,
    icloud: AREAS.filter(a => a.icloud).length,
    notion: AREAS.filter(a => a.notion).length,
    github: AREAS.filter(a => a.github).length,
  }

  return (
    <div className="projects-root">
      <div className="projects-header">
        <div className="filter-group">
          <button className={`filter-btn ${view === 'portfolio' ? 'active' : ''}`} onClick={() => setView('portfolio')}>
            Portfolio ({AREAS.length})
          </button>
          <button className={`filter-btn ${view === 'programs' ? 'active' : ''}`} onClick={() => setView('programs')}>
            Programs ({PROGRAMS.length})
          </button>
        </div>

        {view === 'programs' && (
          <div className="filter-group" style={{ marginTop: 8 }}>
            {(['all', 'active', 'hold', 'complete'] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `All` : f === 'active' ? `Active (${PROGRAMS.filter(p => p.status === 'active').length})` : f === 'hold' ? `Hold (${PROGRAMS.filter(p => p.status === 'hold').length})` : `Done`}
              </button>
            ))}
          </div>
        )}

        {view === 'portfolio' && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div className="filter-group">
              <button className={`filter-btn ${agentFilter === 'all' ? 'active' : ''}`} onClick={() => setAgentFilter('all')}>All Agents</button>
              {agents.map(a => (
                <button key={a} className={`filter-btn ${agentFilter === a ? 'active' : ''}`}
                  style={agentFilter === a ? { borderColor: AGENT_COLOR[a], color: AGENT_COLOR[a] } : {}}
                  onClick={() => setAgentFilter(agentFilter === a ? 'all' : a)}>
                  {a}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All Status</button>
              {areaStatuses.map(s => (
                <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}>
                  {AREA_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'portfolio' && (
        <>
          <div style={{ display: 'flex', gap: 16, padding: '8px 0 12px', fontSize: 11, color: '#888' }}>
            <span>SYNC STATUS —</span>
            <span><PlatformDot active={true} label="Outlook" />Outlook {syncCounts.outlook}/28</span>
            <span><PlatformDot active={true} label="iCloud" />iCloud {syncCounts.icloud}/28</span>
            <span><PlatformDot active={true} label="Notion" />Notion {syncCounts.notion}/28</span>
            <span><PlatformDot active={syncCounts.github > 0} label="GitHub" />GitHub {syncCounts.github}/28</span>
          </div>
          <div className="project-grid">
            {visibleAreas.map(a => (
              <div key={a.id} className="project-card" style={{ cursor: 'default' }}>
                <div className="project-card-header">
                  <div className="project-info">
                    <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', marginRight: 6 }}>{a.id}</span>
                    <span className="project-name" style={{ fontSize: 13 }}>{a.name}</span>
                  </div>
                  <span style={{ fontSize: 10, color: AGENT_COLOR[a.agent], fontWeight: 600, whiteSpace: 'nowrap' }}>{a.agent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: AREA_STATUS_COLOR[a.status] }}>{AREA_STATUS_LABEL[a.status]}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PlatformDot active={a.outlook} label="Outlook" />
                    <PlatformDot active={a.icloud} label="iCloud" />
                    <PlatformDot active={a.notion} label="Notion" />
                    <PlatformDot active={a.github} label="GitHub" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'programs' && (
        <div className="project-grid">
          {visiblePrograms.map(p => (
            <div
              key={p.name}
              className={`project-card ${expanded === p.name ? 'expanded' : ''}`}
              onClick={() => setExpanded(expanded === p.name ? null : p.name)}
            >
              <div className="project-card-header">
                <div className="project-info">
                  <span className="project-name">{p.name}</span>
                  <span className="project-status" style={{ color: PROG_STATUS_COLOR[p.status] }}>{PROG_STATUS_LABEL[p.status]}</span>
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
      )}
    </div>
  )
}
