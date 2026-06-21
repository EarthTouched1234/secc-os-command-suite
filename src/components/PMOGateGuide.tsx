import { useState } from 'react'

export interface GateSpec {
  gate: string
  short: string
  pmbokPrinciple: string
  pmbokNum: number
  domain: string
  exitCriteria: string[]
  color: string
}

export const GATE_SPECS: GateSpec[] = [
  {
    gate:  'Gate 0 — Ideation',
    short: 'G0',
    pmbokPrinciple: 'Focus on Value',
    pmbokNum: 4,
    domain: 'Stakeholders',
    color: '#64748b',
    exitCriteria: [
      'Business case or value hypothesis documented',
      'Executive sponsor identified',
      'Strategic theme assigned',
      'Initial stakeholder list drafted',
    ],
  },
  {
    gate:  'Gate 1 — Proposal',
    short: 'G1',
    pmbokPrinciple: 'Effectively Engage Stakeholders',
    pmbokNum: 3,
    domain: 'Stakeholders · Planning',
    color: '#94a3b8',
    exitCriteria: [
      'Project charter drafted and approved',
      'Rough order-of-magnitude budget established',
      'Stakeholder register created',
      'High-level scope boundaries defined',
    ],
  },
  {
    gate:  'Gate 2 — Feasibility',
    short: 'G2',
    pmbokPrinciple: 'Navigate Complexity',
    pmbokNum: 9,
    domain: 'Development Approach & Life Cycle',
    color: '#3b82f6',
    exitCriteria: [
      'Feasibility study completed',
      'Development approach selected (Agile/Waterfall/Hybrid)',
      'Risk register initialized with top 5 risks',
      'Resource and capacity estimates validated',
    ],
  },
  {
    gate:  'Gate 3 — Planning',
    short: 'G3',
    pmbokPrinciple: 'Build Quality Into Processes',
    pmbokNum: 8,
    domain: 'Planning · Team',
    color: '#6366f1',
    exitCriteria: [
      'Project management plan approved by SunNi',
      'Work breakdown structure defined',
      'Team assembled and roles assigned',
      'Budget baseline and schedule baseline locked',
    ],
  },
  {
    gate:  'Gate 4 — Execution',
    short: 'G4',
    pmbokPrinciple: 'Create a Collaborative Team Environment',
    pmbokNum: 2,
    domain: 'Project Work · Delivery · Team',
    color: '#f97316',
    exitCriteria: [
      'MVP or first deliverable accepted',
      'n8n Workflow IDs populated and auto-sync active',
      'Baseline health score established (≥ 1 sync run)',
      'Quality checkpoints passing',
    ],
  },
  {
    gate:  'Gate 5 — Monitoring',
    short: 'G5',
    pmbokPrinciple: 'Optimize Risk Responses',
    pmbokNum: 10,
    domain: 'Measurement · Uncertainty',
    color: '#eab308',
    exitCriteria: [
      'KPIs tracking for 30+ days (3+ weekly snapshots)',
      'Trajectory signal active (velocity computable)',
      'No open Critical risks in Risk Register',
      'SLA compliance ≥ 80% over last 7-day window',
    ],
  },
  {
    gate:  'Gate 6 — Review',
    short: 'G6',
    pmbokPrinciple: 'Demonstrate Leadership Behaviors',
    pmbokNum: 6,
    domain: 'Measurement · Delivery',
    color: '#a855f7',
    exitCriteria: [
      'Value delivery measured against Benefits Target',
      'Lessons learned documented',
      'Stakeholder acceptance confirmed',
      'Go/No-Go gate decision recorded in Risk Register',
    ],
  },
  {
    gate:  'Gate 7 — Close-Out',
    short: 'G7',
    pmbokPrinciple: 'Enable Change to Achieve the Envisioned Future State',
    pmbokNum: 12,
    domain: 'Delivery · Stakeholders',
    color: '#22c55e',
    exitCriteria: [
      'Final deliverable formally accepted',
      'Closure report filed',
      'Knowledge transferred to ongoing operations',
      'Team released and resources reassigned',
    ],
  },
  {
    gate:  'Gate 8 — Governed',
    short: 'G8',
    pmbokPrinciple: 'Embrace Adaptability and Resiliency',
    pmbokNum: 11,
    domain: 'Uncertainty · Measurement',
    color: '#10b981',
    exitCriteria: [
      'Ongoing automated monitoring live (weekly snapshots active)',
      'Quarterly governance review scheduled',
      'Zero open Critical risks',
      'Health Score ≥ 80% for 90+ consecutive days',
    ],
  },
]

// Export lookup map for gate badge tooltips
export const GATE_LOOKUP: Record<string, GateSpec> = Object.fromEntries(
  GATE_SPECS.map(s => [s.gate, s])
)

const PMBOK_DOMAINS = [
  'Stakeholders', 'Team', 'Development Approach & Life Cycle',
  'Planning', 'Project Work', 'Delivery', 'Measurement', 'Uncertainty',
]

export function PMOGateGuide() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="pmog-root">
      <button className="pmog-toggle" onClick={() => setOpen(o => !o)}>
        <span>PMBOK® 8th Edition Gate Reference</span>
        <span className="pmog-framework-badge">PMBOK® 8th · 12 Principles · 8 Domains</span>
        <span className="pmog-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="pmog-body">
          <div className="pmog-header-row">
            <span className="pmog-intro">
              SECC-OS gates align to PMBOK® 8th Edition (2021) performance domains and principle-based governance.
              Each gate transition requires exit criteria to be met before human authorization.
            </span>
            <div className="pmog-domains">
              {PMBOK_DOMAINS.map(d => (
                <span key={d} className="pmog-domain-chip">{d}</span>
              ))}
            </div>
          </div>

          <div className="pmog-grid">
            {GATE_SPECS.map(spec => (
              <div
                key={spec.gate}
                className={`pmog-card ${expanded === spec.gate ? 'pmog-card-open' : ''}`}
                style={{ borderLeftColor: spec.color }}
                onClick={() => setExpanded(expanded === spec.gate ? null : spec.gate)}
              >
                <div className="pmog-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pmog-gate-badge" style={{ color: spec.color, borderColor: spec.color + '44' }}>
                      {spec.short}
                    </span>
                    <span className="pmog-gate-name">{spec.gate.replace(/Gate \d — /, '')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span className="pmog-principle">P{spec.pmbokNum} — {spec.pmbokPrinciple}</span>
                    <span className="pmog-domain">{spec.domain}</span>
                  </div>
                </div>

                {expanded === spec.gate && (
                  <div className="pmog-criteria">
                    <div className="pmog-criteria-label">EXIT CRITERIA</div>
                    {spec.exitCriteria.map((c, i) => (
                      <div key={i} className="pmog-criterion">
                        <span className="pmog-check">☐</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pmog-footer">
            <span>PMBOK® is a registered trademark of the Project Management Institute (PMI). SECC-OS implements the 12 principles from PMBOK® Guide — Eighth Edition (2021).</span>
          </div>
        </div>
      )}
    </div>
  )
}
