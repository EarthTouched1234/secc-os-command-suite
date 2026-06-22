/* ──────────────────────────────────────────────────────────────────────────
   Platform taxonomy — AI PMO organized by EXECUTION PATTERN, not industry.
   Every customer gets the Universal Intelligence Engine. Domains only change
   KPIs, workflows, agents, and connector priority. Each customer maps to
   1 primary domain + 0–2 secondary domains (the simplification rule).
   Domain Execution Blueprints are the product layer: default KPIs, agents,
   workflows, reports, risks, and connectors per domain.
   ────────────────────────────────────────────────────────────────────────── */

// ── Layer 1 — Universal Intelligence Engine (always on, never changes) ──
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

// PMO primitives that are always relevant regardless of domain.
export const PMO_PRIMITIVES = ['Portfolio', 'Projects', 'Risk', 'Budget', 'Workforce', 'KPIs']

// ── Layer 4 — Universal AI workforce (every customer gets these) ──
export const UNIVERSAL_AGENTS = [
  'Executive PMO Officer', 'Scheduler', 'Risk Analyst', 'Financial Analyst',
  'Documentation Manager', 'Quality Manager', 'Compliance Officer',
  'Communications Officer', 'Automation Engineer', 'Data Analyst',
]

// ── Layer 5 — Enterprise connectors ──
export const CONNECTORS = [
  'Microsoft 365', 'Google Workspace', 'Slack', 'Teams', 'GitHub', 'Jira',
  'ServiceNow', 'Salesforce', 'SAP', 'Oracle', 'Procore', 'Yardi',
  'RealPage', 'n8n', 'Notion', 'Power BI', 'Tableau',
]

/* Domain Execution Blueprint — the defaults that make a domain a product. */
export interface DomainBlueprint {
  kpis: string[]
  agents: string[]
  workflows: string[]
  reports: string[]
  risks: string[]
  connectors: string[]
}

export interface Domain {
  id: string
  icon: string
  name: string
  specialty?: boolean
  industries: string[]      // "Covers"
  executionLogic: string[]  // "Core execution logic"
  blueprint: DomainBlueprint
}

// ── Layer 2 — Business Domains (final structured set, by execution pattern) ──
export const DOMAINS: Domain[] = [
  {
    id: 'built', icon: '🏗', name: 'Built Environment & Physical Assets',
    industries: ['Construction', 'Real Estate Development', 'Facilities Management', 'Infrastructure', 'Utilities', 'Urban Planning', 'Asset Lifecycle Management'],
    executionLogic: ['Capital delivery', 'Project controls', 'Asset performance', 'Maintenance cycles'],
    blueprint: {
      kpis: ['Capital delivery %', 'Schedule variance', 'Cost variance (CPI)', 'Asset performance index', 'Maintenance backlog'],
      agents: ['Superintendent AI', 'Estimator AI', 'Safety Officer AI', 'Project Controls AI'],
      workflows: ['RFI routing', 'Change order approval', 'Permit tracking', 'Inspection scheduling'],
      reports: ['Capital delivery report', 'Earned value (EVM)', 'Safety incident log'],
      risks: ['Schedule slippage', 'Cost overrun', 'Permit delay', 'Safety incident'],
      connectors: ['Procore', 'Microsoft 365', 'n8n', 'Power BI'],
    },
  },
  {
    id: 'digital', icon: '💻', name: 'Digital Systems & Software Execution',
    industries: ['Software Development', 'DevOps', 'Cybersecurity Operations', 'Cloud Infrastructure', 'Platform Engineering', 'Data Engineering', 'AI / ML Operations'],
    executionLogic: ['Release cycles', 'System uptime', 'Deployment velocity', 'Engineering throughput'],
    blueprint: {
      kpis: ['Deployment velocity', 'System uptime %', 'MTTR', 'Engineering throughput', 'Escaped defects'],
      agents: ['Sprint Master AI', 'DevOps Engineer AI', 'Security Analyst AI', 'Reliability AI'],
      workflows: ['Sprint planning', 'CI/CD gate', 'Incident response', 'Vulnerability triage'],
      reports: ['Release report', 'Uptime / SLO report', 'Sprint velocity'],
      risks: ['Deployment failure', 'Security breach', 'Tech debt', 'SLA breach'],
      connectors: ['GitHub', 'Jira', 'ServiceNow', 'Slack'],
    },
  },
  {
    id: 'human', icon: '🏥', name: 'Human Services & Care Systems',
    industries: ['Healthcare (Clinical + Operational)', 'Hospitals & Clinics', 'Public Health Systems', 'Education Systems', 'Social Services', 'Mental Health Programs'],
    executionLogic: ['Capacity vs demand', 'Compliance-heavy workflows', 'Staffing sensitivity', 'Service delivery timelines'],
    blueprint: {
      kpis: ['Capacity vs demand', 'Service delivery time', 'Staffing ratio', 'Compliance rate', 'Client outcomes'],
      agents: ['Clinical Coordinator AI', 'Compliance Nurse AI', 'Capacity Planner AI'],
      workflows: ['Credentialing', 'Scheduling', 'Compliance audit', 'Intake routing'],
      reports: ['Capacity report', 'Compliance dashboard', 'Outcomes report'],
      risks: ['Capacity overflow', 'Compliance violation', 'Staffing shortage', 'Care delay'],
      connectors: ['Microsoft 365', 'ServiceNow', 'Notion'],
    },
  },
  {
    id: 'industrial', icon: '🏭', name: 'Industrial & Supply Chain Systems',
    industries: ['Manufacturing', 'Logistics', 'Warehousing', 'Supply Chain', 'Procurement Operations', 'Automotive', 'Aerospace', 'Robotics Operations'],
    executionLogic: ['Throughput optimization', 'Downtime reduction', 'Quality control', 'Inventory flow'],
    blueprint: {
      kpis: ['Throughput', 'OEE', 'Downtime %', 'Quality defect rate', 'Inventory turns'],
      agents: ['Production Planner AI', 'Quality Manager AI', 'Supply Chain Analyst AI'],
      workflows: ['Production scheduling', 'Quality inspection', 'Inventory replenishment', 'Supplier onboarding'],
      reports: ['OEE report', 'Quality report', 'Inventory flow report'],
      risks: ['Downtime', 'Quality defect', 'Supply disruption', 'Inventory stockout'],
      connectors: ['SAP', 'Oracle', 'Power BI'],
    },
  },
  {
    id: 'governance', icon: '🏛', name: 'Governance & Public Systems',
    industries: ['Federal / State / Local Government', 'Defense / Military Systems', 'Public Safety', 'Transportation Authorities', 'Regulatory Agencies'],
    executionLogic: ['Compliance enforcement', 'Budget execution', 'Policy-to-action tracking', 'Public KPI accountability'],
    blueprint: {
      kpis: ['Budget execution %', 'Policy-to-action rate', 'Compliance rate', 'Public accountability score', 'Cycle time'],
      agents: ['Compliance Officer AI', 'Grants Manager AI', 'Budget Analyst AI'],
      workflows: ['Grant management', 'Procurement', 'Public records', 'Policy tracking'],
      reports: ['Budget execution report', 'Compliance report', 'Public accountability scorecard'],
      risks: ['Budget shortfall', 'Compliance failure', 'Audit finding', 'Policy delay'],
      connectors: ['Microsoft 365', 'ServiceNow', 'Tableau'],
    },
  },
  {
    id: 'enterprise', icon: '💼', name: 'Enterprise Business Operations',
    industries: ['Finance', 'Accounting', 'HR / Workforce Management', 'Legal Operations', 'Marketing Operations', 'Sales Operations', 'Customer Success', 'Procurement'],
    executionLogic: ['Internal efficiency', 'Revenue alignment', 'Workforce optimization', 'Cost control'],
    blueprint: {
      kpis: ['Internal efficiency', 'Revenue alignment', 'Cost control', 'Workforce utilization', 'Cycle time'],
      agents: ['Financial Analyst AI', 'HR Coordinator AI', 'Legal Reviewer AI', 'RevOps AI'],
      workflows: ['Budgeting', 'Contract review', 'Campaign tracking', 'Pipeline management'],
      reports: ['Financial report', 'Workforce report', 'Pipeline report'],
      risks: ['Cost overrun', 'Legal / compliance', 'Attrition', 'Revenue miss'],
      connectors: ['Salesforce', 'Microsoft 365', 'SAP'],
    },
  },
  {
    id: 'property', icon: '🏢', name: 'Property, Facilities & Asset Operations', specialty: true,
    industries: ['Multifamily Housing', 'Commercial Real Estate', 'Hospitality', 'Asset Management', 'Leasing Operations', 'Resident / Customer Lifecycle', 'Maintenance & Facilities Ops'],
    executionLogic: ['Occupancy', 'Asset yield', 'Turnover efficiency', 'Service response time', 'Revenue per asset'],
    blueprint: {
      kpis: ['Occupancy %', 'Asset yield', 'Turnover efficiency', 'Service response time', 'Revenue per asset', 'Lead → Lease conversion'],
      agents: ['Leasing Manager AI', 'Maintenance Coordinator AI', 'Resident Relations AI', 'Asset Performance AI'],
      workflows: ['Leasing pipeline (DAR)', 'Maintenance dispatch', 'Renewal tracking', 'Occupancy forecasting'],
      reports: ['Daily Activity Report (DAR)', 'Occupancy report', 'Asset yield report', 'Service SLA report'],
      risks: ['Vacancy', 'Delinquency', 'Turnover spike', 'Maintenance backlog', 'Service SLA breach'],
      connectors: ['Yardi', 'RealPage', 'CRM IQ', 'n8n', 'Notion'],
    },
  },
  {
    id: 'innovation', icon: '🚀', name: 'Innovation, Venture & Product Systems',
    industries: ['Startups', 'Venture Capital Portfolios', 'Product Launches', 'R&D Labs', 'Incubators / Accelerators', 'Innovation Programs'],
    executionLogic: ['Hypothesis testing', 'Portfolio risk balancing', 'Speed-to-validation', 'Iteration cycles'],
    blueprint: {
      kpis: ['Speed-to-validation', 'Iteration cycle time', 'Portfolio risk balance', 'Burn vs runway', 'Experiment win rate'],
      agents: ['Product Strategist AI', 'Fundraising Analyst AI', 'Experiment Designer AI'],
      workflows: ['Hypothesis testing', 'Roadmap planning', 'Fundraising pipeline', 'Cohort management'],
      reports: ['Portfolio risk report', 'Runway report', 'Experiment results'],
      risks: ['Runway depletion', 'Failed validation', 'Portfolio concentration', 'Market timing'],
      connectors: ['Notion', 'Slack', 'GitHub'],
    },
  },
  {
    id: 'energy', icon: '🌍', name: 'Energy & Environmental Systems',
    industries: ['Oil & Gas', 'Renewable Energy', 'Solar / Wind Operations', 'Utilities (Water, Power)', 'Environmental Programs', 'Climate Infrastructure'],
    executionLogic: ['Resource optimization', 'Regulatory compliance', 'Infrastructure uptime', 'Sustainability metrics'],
    blueprint: {
      kpis: ['Infrastructure uptime', 'Resource optimization', 'Regulatory compliance', 'Sustainability metrics', 'Outage frequency'],
      agents: ['SCADA Operator AI', 'Compliance Officer AI', 'Environmental Analyst AI', 'Asset Performance AI'],
      workflows: ['SCADA monitoring', 'Compliance reporting (NERC / IEC)', 'Outage management', 'Environmental reporting'],
      reports: ['Uptime report', 'Compliance report', 'Sustainability scorecard'],
      risks: ['Outage', 'Regulatory violation', 'Resource shortfall', 'Environmental incident'],
      connectors: ['n8n', 'Power BI', 'SAP'],
    },
  },
  {
    id: 'knowledge', icon: '🎓', name: 'Knowledge & Institutional Systems',
    industries: ['Universities', 'Schools', 'Research Institutions', 'Nonprofits', 'Foundations', 'Think Tanks'],
    executionLogic: ['Program outcomes', 'Funding efficiency', 'Research throughput', 'Curriculum / program delivery'],
    blueprint: {
      kpis: ['Program outcomes', 'Funding efficiency', 'Research throughput', 'Program delivery', 'Enrollment / retention'],
      agents: ['Research Coordinator AI', 'Grants Manager AI', 'Program Outcomes AI'],
      workflows: ['Grant management', 'Curriculum planning', 'Research protocols', 'Accreditation tracking'],
      reports: ['Outcomes report', 'Funding efficiency report', 'Research throughput'],
      risks: ['Funding gap', 'Outcome shortfall', 'Accreditation risk', 'Enrollment decline'],
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

// ── Persisted customer profile: 1 primary + 0–2 secondary domains ──
export const MAX_SECONDARY = 2

export interface PlatformProfile {
  primary: string | null
  secondary: string[]    // up to MAX_SECONDARY
  viewed: string | null  // which domain blueprint is open
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
