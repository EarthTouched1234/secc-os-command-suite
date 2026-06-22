/* ──────────────────────────────────────────────────────────────────────────
   Platform taxonomy — domains as BEHAVIORAL EXECUTION ENGINES, not labels.
   Each domain is a self-contained execution system with 4 locked components:
     1. Execution Profile     — what "good" looks like (success signals)
     2. AI Workforce          — domain agents that auto-spawn
     3. Operational Workflows — execution loops (how work flows)
     4. Domain Intelligence   — KPIs + risk triggers + forecast models (decisions)
   Customer maps to 1 primary + 0–2 secondary domains.
   ────────────────────────────────────────────────────────────────────────── */

// ── Layer 1 — Universal Intelligence Engine (always on) ──
export const UNIVERSAL_CAPABILITIES = [
  { icon: '📁', name: 'Portfolio Management' },
  { icon: '📊', name: 'Program Management' },
  { icon: '📋', name: 'Project Management' },
  { icon: '✅', name: 'Task Management' },
  { icon: '⚠️', name: 'Risk Management' },
  { icon: '💰', name: 'Financial Management' },
  { icon: '📅', name: 'Scheduling' },
  { icon: '👥', name: 'Resource Management' },
  { icon: '📑', name: 'Documentation' },
  { icon: '🤖', name: 'Automation' },
  { icon: '📈', name: 'KPI & Reporting' },
  { icon: '🔒', name: 'Governance' },
  { icon: '🧠', name: 'AI Decision Support' },
]

export const PMO_PRIMITIVES = ['Portfolio', 'Projects', 'Risk', 'Budget', 'Workforce', 'KPIs']

export const UNIVERSAL_AGENTS = [
  'Executive PMO Officer', 'Scheduler', 'Risk Analyst', 'Financial Analyst',
  'Documentation Manager', 'Quality Manager', 'Compliance Officer',
  'Communications Officer', 'Automation Engineer', 'Data Analyst',
]

export const CONNECTORS = [
  'Microsoft 365', 'Google Workspace', 'Slack', 'Teams', 'GitHub', 'Jira',
  'ServiceNow', 'Salesforce', 'SAP', 'Oracle', 'Procore', 'Yardi',
  'RealPage', 'n8n', 'Notion', 'Power BI', 'Tableau',
]

/* Every domain must answer these five questions. */
export const DOMAIN_QUESTIONS = [
  'How does work flow here?',
  'What decisions get made here?',
  'What breaks here first?',
  'What signals predict failure?',
  'Who (agent) owns intervention?',
]

// ── Execution-system schema ──
export interface ExecutionLoop { name: string; stages: string[] }
export interface RiskTrigger { signal: string; action: string; severity: 'High' | 'Medium' | 'Low' }
export interface ForecastModel { name: string; logic: string }

export interface DomainSchema {
  executionProfile: string[]      // success signals — "what good looks like"
  agents: string[]                // domain AI workforce
  workflows: ExecutionLoop[]      // execution loops
  kpis: string[]
  riskTriggers: RiskTrigger[]     // signal → action (the decision logic)
  forecastModels: ForecastModel[]
  connectors: string[]
}

export interface Domain {
  id: string
  icon: string
  name: string
  specialty?: boolean
  industries: string[]
  executionLogic: string[]
  schema: DomainSchema
}

export const DOMAINS: Domain[] = [
  {
    id: 'built', icon: '🏗', name: 'Built Environment & Physical Assets',
    industries: ['Construction', 'Real Estate Development', 'Facilities Management', 'Infrastructure', 'Utilities', 'Urban Planning', 'Asset Lifecycle Management'],
    executionLogic: ['Capital delivery', 'Project controls', 'Asset performance', 'Maintenance cycles'],
    schema: {
      executionProfile: ['On-time capital delivery', 'Budget adherence', 'Asset uptime', 'Safety compliance', 'Maintenance currency'],
      agents: ['Superintendent AI', 'Estimator AI', 'Safety Officer AI', 'Project Controls AI'],
      workflows: [
        { name: 'Capital Delivery', stages: ['Design', 'Permit', 'Procure', 'Build', 'Commission'] },
        { name: 'Change Control', stages: ['RFI', 'Review', 'Change Order', 'Approve', 'Execute'] },
        { name: 'Asset Maintenance', stages: ['Inspect', 'Detect', 'Schedule', 'Repair', 'Verify'] },
      ],
      kpis: ['Capital delivery %', 'Schedule variance', 'Cost variance (CPI)', 'Asset performance index', 'Maintenance backlog'],
      riskTriggers: [
        { signal: 'CPI < 0.90', action: 'Cost-recovery review', severity: 'High' },
        { signal: 'Schedule variance > 10%', action: 'Critical-path recovery plan', severity: 'High' },
        { signal: 'Permit aging > 30 days', action: 'Escalate to authority liaison', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Earned-value completion (EAC)', logic: 'Project final cost/date from CPI + SPI trend' },
        { name: 'Maintenance failure forecast', logic: 'Asset age + condition index → failure probability' },
      ],
      connectors: ['Procore', 'Microsoft 365', 'n8n', 'Power BI'],
    },
  },
  {
    id: 'digital', icon: '💻', name: 'Digital Systems & Software Execution',
    industries: ['Software Development', 'DevOps', 'Cybersecurity Operations', 'Cloud Infrastructure', 'Platform Engineering', 'Data Engineering', 'AI / ML Operations'],
    executionLogic: ['Release cycles', 'System uptime', 'Deployment velocity', 'Engineering throughput'],
    schema: {
      executionProfile: ['High deployment velocity', 'Strong uptime vs SLO', 'Low MTTR', 'Low escaped defects', 'Secure posture'],
      agents: ['Sprint Master AI', 'DevOps Engineer AI', 'Security Analyst AI', 'Reliability AI'],
      workflows: [
        { name: 'Delivery', stages: ['Backlog', 'Sprint', 'Build', 'Test', 'Deploy'] },
        { name: 'Incident', stages: ['Detect', 'Triage', 'Mitigate', 'Resolve', 'Postmortem'] },
        { name: 'Security', stages: ['Scan', 'Triage', 'Patch', 'Verify', 'Close'] },
      ],
      kpis: ['Deployment velocity', 'System uptime %', 'MTTR', 'Engineering throughput', 'Escaped defects'],
      riskTriggers: [
        { signal: 'Uptime < SLO', action: 'Reliability freeze + incident review', severity: 'High' },
        { signal: 'MTTR rising 2 sprints', action: 'On-call + runbook audit', severity: 'Medium' },
        { signal: 'Critical CVE open > 48h', action: 'Emergency patch protocol', severity: 'High' },
      ],
      forecastModels: [
        { name: 'Release forecast', logic: 'Sprint velocity → projected ship date' },
        { name: 'Incident-rate trend', logic: 'Rolling incident frequency → reliability risk' },
      ],
      connectors: ['GitHub', 'Jira', 'ServiceNow', 'Slack'],
    },
  },
  {
    id: 'human', icon: '🏥', name: 'Human Services & Care Systems',
    industries: ['Healthcare (Clinical + Operational)', 'Hospitals & Clinics', 'Public Health Systems', 'Education Systems', 'Social Services', 'Mental Health Programs'],
    executionLogic: ['Capacity vs demand', 'Compliance-heavy workflows', 'Staffing sensitivity', 'Service delivery timelines'],
    schema: {
      executionProfile: ['Capacity meets demand', 'Compliance maintained', 'Adequate staffing', 'On-time service', 'Positive outcomes'],
      agents: ['Clinical Coordinator AI', 'Compliance Nurse AI', 'Capacity Planner AI'],
      workflows: [
        { name: 'Care Delivery', stages: ['Intake', 'Triage', 'Schedule', 'Deliver', 'Follow-up'] },
        { name: 'Compliance', stages: ['Credential', 'Audit', 'Remediate', 'Attest', 'Renew'] },
        { name: 'Capacity', stages: ['Forecast', 'Staff', 'Allocate', 'Monitor', 'Rebalance'] },
      ],
      kpis: ['Capacity vs demand', 'Service delivery time', 'Staffing ratio', 'Compliance rate', 'Client outcomes'],
      riskTriggers: [
        { signal: 'Capacity utilization > 90%', action: 'Surge staffing protocol', severity: 'High' },
        { signal: 'Compliance rate < 100%', action: 'Remediation + audit hold', severity: 'High' },
        { signal: 'Staffing ratio below floor', action: 'Agency backfill trigger', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Demand forecast', logic: 'Seasonality + referral inflow → expected load' },
        { name: 'Staffing-gap forecast', logic: 'Projected demand vs roster → gap alert' },
      ],
      connectors: ['Microsoft 365', 'ServiceNow', 'Notion'],
    },
  },
  {
    id: 'industrial', icon: '🏭', name: 'Industrial & Supply Chain Systems',
    industries: ['Manufacturing', 'Logistics', 'Warehousing', 'Supply Chain', 'Procurement Operations', 'Automotive', 'Aerospace', 'Robotics Operations'],
    executionLogic: ['Throughput optimization', 'Downtime reduction', 'Quality control', 'Inventory flow'],
    schema: {
      executionProfile: ['High throughput', 'Low downtime', 'Quality in spec', 'Inventory balanced', 'On-time delivery'],
      agents: ['Production Planner AI', 'Quality Manager AI', 'Supply Chain Analyst AI'],
      workflows: [
        { name: 'Production', stages: ['Plan', 'Schedule', 'Produce', 'Inspect', 'Ship'] },
        { name: 'Quality', stages: ['Detect', 'Contain', 'Root-cause', 'Correct', 'Verify'] },
        { name: 'Replenishment', stages: ['Forecast', 'Order', 'Receive', 'Stock', 'Consume'] },
      ],
      kpis: ['Throughput', 'OEE', 'Downtime %', 'Quality defect rate', 'Inventory turns'],
      riskTriggers: [
        { signal: 'OEE < target', action: 'Line optimization protocol', severity: 'High' },
        { signal: 'Defect rate > threshold', action: 'Quality hold + containment', severity: 'High' },
        { signal: 'Stock cover < lead time', action: 'Expedite reorder', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Inventory forecast', logic: 'Demand signal → reorder point + safety stock' },
        { name: 'Downtime/OEE trend', logic: 'Rolling OEE → maintenance scheduling' },
      ],
      connectors: ['SAP', 'Oracle', 'Power BI'],
    },
  },
  {
    id: 'governance', icon: '🏛', name: 'Governance & Public Systems',
    industries: ['Federal / State / Local Government', 'Defense / Military Systems', 'Public Safety', 'Transportation Authorities', 'Regulatory Agencies'],
    executionLogic: ['Compliance enforcement', 'Budget execution', 'Policy-to-action tracking', 'Public KPI accountability'],
    schema: {
      executionProfile: ['Budget executed on plan', 'Compliance enforced', 'Policy delivered', 'Public KPIs met', 'Audit-clean'],
      agents: ['Compliance Officer AI', 'Grants Manager AI', 'Budget Analyst AI'],
      workflows: [
        { name: 'Budget', stages: ['Appropriate', 'Allocate', 'Obligate', 'Spend', 'Report'] },
        { name: 'Grant', stages: ['Apply', 'Award', 'Disburse', 'Monitor', 'Close'] },
        { name: 'Policy', stages: ['Mandate', 'Plan', 'Execute', 'Track', 'Report'] },
      ],
      kpis: ['Budget execution %', 'Policy-to-action rate', 'Compliance rate', 'Public accountability score', 'Cycle time'],
      riskTriggers: [
        { signal: 'Budget execution < plan / quarter', action: 'Reallocation review', severity: 'High' },
        { signal: 'Compliance finding open', action: 'Corrective action plan', severity: 'High' },
        { signal: 'Grant disbursement stalled > 30d', action: 'Escalation', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Budget burn-rate', logic: 'Obligation pace → year-end execution forecast' },
        { name: 'Grant utilization', logic: 'Disbursement rate → underspend risk' },
      ],
      connectors: ['Microsoft 365', 'ServiceNow', 'Tableau'],
    },
  },
  {
    id: 'enterprise', icon: '💼', name: 'Enterprise Business Operations',
    industries: ['Finance', 'Accounting', 'HR / Workforce Management', 'Legal Operations', 'Marketing Operations', 'Sales Operations', 'Customer Success', 'Procurement'],
    executionLogic: ['Internal efficiency', 'Revenue alignment', 'Workforce optimization', 'Cost control'],
    schema: {
      executionProfile: ['Efficient operations', 'Revenue aligned', 'Costs controlled', 'Workforce optimized', 'Fast cycle time'],
      agents: ['Financial Analyst AI', 'HR Coordinator AI', 'Legal Reviewer AI', 'RevOps AI'],
      workflows: [
        { name: 'Revenue', stages: ['Lead', 'Qualify', 'Propose', 'Close', 'Onboard'] },
        { name: 'Budget', stages: ['Plan', 'Approve', 'Spend', 'Track', 'Reforecast'] },
        { name: 'Contract', stages: ['Draft', 'Review', 'Negotiate', 'Sign', 'Renew'] },
      ],
      kpis: ['Internal efficiency', 'Revenue alignment', 'Cost control', 'Workforce utilization', 'Cycle time'],
      riskTriggers: [
        { signal: 'Cost variance > budget', action: 'Spend freeze review', severity: 'High' },
        { signal: 'Pipeline coverage < 3x', action: 'Demand-gen acceleration', severity: 'Medium' },
        { signal: 'Attrition > threshold', action: 'Retention protocol', severity: 'High' },
      ],
      forecastModels: [
        { name: 'Pipeline/revenue forecast', logic: 'Stage-weighted pipeline → bookings projection' },
        { name: 'Cost-trend forecast', logic: 'Spend run-rate → budget variance projection' },
      ],
      connectors: ['Salesforce', 'Microsoft 365', 'SAP'],
    },
  },
  {
    id: 'property', icon: '🏢', name: 'Property, Facilities & Asset Operations', specialty: true,
    industries: ['Multifamily Housing', 'Commercial Real Estate', 'Hospitality', 'Asset Management', 'Leasing Operations', 'Resident / Customer Lifecycle', 'Maintenance & Facilities Ops'],
    executionLogic: ['Occupancy', 'Asset yield', 'Turnover efficiency', 'Service response time', 'Revenue per asset'],
    schema: {
      executionProfile: ['Occupancy stability', 'Turnover velocity', 'Maintenance SLA adherence', 'Rent collection rate', 'Unit readiness time'],
      agents: ['Leasing Optimization Agent', 'Maintenance Coordinator Agent', 'Resident Experience Agent', 'Asset Performance Analyst Agent'],
      workflows: [
        { name: 'Leasing', stages: ['Lead', 'Tour', 'Application', 'Lease', 'Renewal'] },
        { name: 'Work Order', stages: ['Work Order', 'Dispatch', 'Completion', 'QA', 'Close'] },
        { name: 'Turn', stages: ['Vacancy', 'Turn', 'Ready', 'Market', 'Lease'] },
      ],
      kpis: ['Occupancy %', 'Turnover velocity', 'Maintenance SLA adherence', 'Rent collection rate', 'Unit readiness time', 'Lead → Lease conversion'],
      riskTriggers: [
        { signal: 'Occupancy < 92%', action: 'Trigger leasing acceleration protocol', severity: 'High' },
        { signal: 'Maintenance backlog > threshold', action: 'Delay leasing readiness flag', severity: 'Medium' },
        { signal: 'Renewal drop > X%', action: 'Pricing review trigger', severity: 'High' },
        { signal: 'Delinquency > threshold', action: 'Collections escalation', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Occupancy forecast', logic: 'Leasing velocity vs notice-to-vacate → projected occupancy' },
        { name: 'Revenue-per-asset projection', logic: 'Rent roll + renewal + turn cost → NOI trajectory' },
      ],
      connectors: ['Yardi', 'RealPage', 'CRM IQ', 'n8n', 'Notion'],
    },
  },
  {
    id: 'innovation', icon: '🚀', name: 'Innovation, Venture & Product Systems',
    industries: ['Startups', 'Venture Capital Portfolios', 'Product Launches', 'R&D Labs', 'Incubators / Accelerators', 'Innovation Programs'],
    executionLogic: ['Hypothesis testing', 'Portfolio risk balancing', 'Speed-to-validation', 'Iteration cycles'],
    schema: {
      executionProfile: ['Fast validation', 'Balanced portfolio risk', 'Healthy runway', 'High iteration speed', 'Positive experiment win rate'],
      agents: ['Product Strategist AI', 'Fundraising Analyst AI', 'Experiment Designer AI'],
      workflows: [
        { name: 'Validation', stages: ['Hypothesis', 'Experiment', 'Measure', 'Learn', 'Decide'] },
        { name: 'Fundraising', stages: ['Pipeline', 'Pitch', 'Diligence', 'Term', 'Close'] },
        { name: 'Roadmap', stages: ['Idea', 'Prioritize', 'Build', 'Launch', 'Iterate'] },
      ],
      kpis: ['Speed-to-validation', 'Iteration cycle time', 'Portfolio risk balance', 'Burn vs runway', 'Experiment win rate'],
      riskTriggers: [
        { signal: 'Runway < 6 months', action: 'Fundraising acceleration / burn cut', severity: 'High' },
        { signal: 'Validation failure rate high', action: 'Pivot review', severity: 'Medium' },
        { signal: 'Portfolio concentration > threshold', action: 'Rebalance', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Runway forecast', logic: 'Burn vs cash → months remaining' },
        { name: 'Validation-throughput', logic: 'Experiment cadence → time-to-product-market-fit' },
      ],
      connectors: ['Notion', 'Slack', 'GitHub'],
    },
  },
  {
    id: 'energy', icon: '🌍', name: 'Energy & Environmental Systems',
    industries: ['Oil & Gas', 'Renewable Energy', 'Solar / Wind Operations', 'Utilities (Water, Power)', 'Environmental Programs', 'Climate Infrastructure'],
    executionLogic: ['Resource optimization', 'Regulatory compliance', 'Infrastructure uptime', 'Sustainability metrics'],
    schema: {
      executionProfile: ['Infrastructure uptime', 'Resources optimized', 'Regulatory compliant', 'Sustainability targets met', 'Low outage frequency'],
      agents: ['SCADA Operator AI', 'Compliance Officer AI', 'Environmental Analyst AI', 'Asset Performance AI'],
      workflows: [
        { name: 'Operations', stages: ['Monitor', 'Detect', 'Dispatch', 'Restore', 'Review'] },
        { name: 'Compliance', stages: ['Measure', 'Report', 'Audit', 'Remediate', 'Attest'] },
        { name: 'Sustainability', stages: ['Baseline', 'Target', 'Track', 'Optimize', 'Report'] },
      ],
      kpis: ['Infrastructure uptime', 'Resource optimization', 'Regulatory compliance', 'Sustainability metrics', 'Outage frequency'],
      riskTriggers: [
        { signal: 'Uptime < threshold', action: 'Outage response protocol', severity: 'High' },
        { signal: 'Emissions > permit limit', action: 'Environmental escalation', severity: 'High' },
        { signal: 'Compliance report overdue', action: 'Regulatory filing alert', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Load/outage forecast', logic: 'Demand + asset health → outage probability' },
        { name: 'Sustainability trajectory', logic: 'Emissions trend vs target → gap projection' },
      ],
      connectors: ['n8n', 'Power BI', 'SAP'],
    },
  },
  {
    id: 'knowledge', icon: '🎓', name: 'Knowledge & Institutional Systems',
    industries: ['Universities', 'Schools', 'Research Institutions', 'Nonprofits', 'Foundations', 'Think Tanks'],
    executionLogic: ['Program outcomes', 'Funding efficiency', 'Research throughput', 'Curriculum / program delivery'],
    schema: {
      executionProfile: ['Strong program outcomes', 'Efficient funding use', 'High research throughput', 'On-time program delivery', 'Healthy enrollment / retention'],
      agents: ['Research Coordinator AI', 'Grants Manager AI', 'Program Outcomes AI'],
      workflows: [
        { name: 'Program', stages: ['Design', 'Enroll', 'Deliver', 'Assess', 'Improve'] },
        { name: 'Grant', stages: ['Apply', 'Award', 'Execute', 'Report', 'Renew'] },
        { name: 'Research', stages: ['Propose', 'Approve', 'Conduct', 'Publish', 'Archive'] },
      ],
      kpis: ['Program outcomes', 'Funding efficiency', 'Research throughput', 'Program delivery', 'Enrollment / retention'],
      riskTriggers: [
        { signal: 'Funding utilization < plan', action: 'Grant compliance review', severity: 'Medium' },
        { signal: 'Outcome metrics below target', action: 'Program intervention', severity: 'High' },
        { signal: 'Enrollment decline > X%', action: 'Recruitment protocol', severity: 'Medium' },
      ],
      forecastModels: [
        { name: 'Enrollment forecast', logic: 'Applications + yield → projected enrollment' },
        { name: 'Funding-utilization', logic: 'Spend pace vs award → underspend risk' },
      ],
      connectors: ['Google Workspace', 'Microsoft 365', 'Notion'],
    },
  },
]

export const DIFFERENTIATORS = [
  { icon: '🧠', text: 'Executive intelligence' },
  { icon: '📊', text: 'Portfolio governance' },
  { icon: '🤖', text: 'AI workforce orchestration' },
  { icon: '🔄', text: 'Process automation' },
  { icon: '📚', text: 'Organizational knowledge management' },
  { icon: '📈', text: 'Predictive analytics' },
  { icon: '🛡', text: 'Compliance and governance' },
  { icon: '🌐', text: 'Cross-industry adaptability' },
]

// ── Customer profile: 1 primary + 0–2 secondary domains ──
export const MAX_SECONDARY = 2

export interface PlatformProfile {
  primary: string | null
  secondary: string[]
  viewed: string | null
}

const KEY = 'secc-os.platform.profile'

export function loadProfile(): PlatformProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { primary: null, secondary: [], viewed: null, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { primary: null, secondary: [], viewed: null }
}

export function saveProfile(p: PlatformProfile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

export function domainById(id: string | null): Domain | undefined {
  return DOMAINS.find(d => d.id === id)
}

/* Export a domain as the Domain Execution Schema Template (the JSON contract). */
export function toExecutionSchema(d: Domain) {
  return {
    domain: d.name,
    execution_profile: d.schema.executionProfile,
    agents: d.schema.agents,
    workflows: d.schema.workflows.map(w => ({ name: w.name, loop: w.stages })),
    kpis: d.schema.kpis,
    risk_triggers: d.schema.riskTriggers.map(t => ({ signal: t.signal, action: t.action, severity: t.severity })),
    forecast_models: d.schema.forecastModels,
    connectors: d.schema.connectors,
  }
}
