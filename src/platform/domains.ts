/* ──────────────────────────────────────────────────────────────────────────
   Platform taxonomy — the 5-layer AI PMO architecture.
   Organized by EXECUTION DOMAIN, not industry. Industries inherit domain
   capabilities (the Office/Excel model). Every customer gets the Universal
   Intelligence Engine; domains activate functional modules, AI agents, and
   connectors on top of it.
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

// ── Layer 4 — Universal AI workforce (every customer gets these) ──
export const UNIVERSAL_AGENTS = [
  'Executive PMO Officer', 'Scheduler', 'Risk Analyst', 'Financial Analyst',
  'Documentation Manager', 'Quality Manager', 'Compliance Officer',
  'Communications Officer', 'Automation Engineer', 'Data Analyst',
]

// ── Layer 5 — Enterprise connectors (where the AI PMO plugs in) ──
export const CONNECTORS = [
  'Microsoft 365', 'Google Workspace', 'Slack', 'Teams', 'GitHub', 'Jira',
  'ServiceNow', 'Salesforce', 'SAP', 'Oracle', 'Procore', 'Yardi',
  'RealPage', 'n8n', 'Notion', 'Power BI', 'Tableau',
]

export interface Domain {
  id: string
  icon: string
  name: string
  specialty?: boolean
  industries: string[]
  modules: string[]       // Layer 3 — functional modules (toggle on/off)
  agents: string[]        // Layer 4 — domain-specific AI agents
  connectors: string[]    // Layer 5 — domain-relevant connectors
}

/* Layer 2 — Business Domains (8–10). User-specified modules/agents are
   canonical; others are sensible starter sets to be refined per engagement. */
export const DOMAINS: Domain[] = [
  {
    id: 'infrastructure', icon: '🏗', name: 'Infrastructure & Construction',
    industries: ['Construction', 'Civil Engineering', 'Utilities', 'Transportation', 'Real Estate Development', 'Architecture', 'Surveying'],
    modules: ['Budget Tracking', 'RFIs', 'Change Orders', 'Permits', 'Safety', 'Inspections'],
    agents: ['Superintendent AI', 'Estimator AI', 'Safety Officer AI'],
    connectors: ['Procore', 'Microsoft 365', 'n8n'],
  },
  {
    id: 'technology', icon: '💻', name: 'Technology',
    industries: ['Software Development', 'Cybersecurity', 'AI', 'Cloud', 'DevOps', 'Data Centers', 'Digital Transformation'],
    modules: ['Sprint Planning', 'GitHub', 'Azure', 'DevOps', 'API Monitoring'],
    agents: ['Sprint Master AI', 'DevOps Engineer AI', 'Security Analyst AI'],
    connectors: ['GitHub', 'Jira', 'ServiceNow', 'Slack'],
  },
  {
    id: 'healthcare', icon: '🏥', name: 'Healthcare',
    industries: ['Hospitals', 'Clinics', 'Healthcare IT', 'Medical Research', 'Public Health', 'Pharmaceuticals'],
    modules: ['HIPAA Compliance', 'Clinical Scheduling', 'Patient Safety', 'Credentialing', 'Research Protocols'],
    agents: ['Clinical Coordinator AI', 'Compliance Nurse AI'],
    connectors: ['Microsoft 365', 'ServiceNow', 'Notion'],
  },
  {
    id: 'manufacturing', icon: '🏭', name: 'Manufacturing & Industrial',
    industries: ['Manufacturing', 'Supply Chain', 'Warehousing', 'Logistics', 'Robotics', 'Automotive', 'Aerospace'],
    modules: ['Production Planning', 'Supply Chain', 'Quality Control', 'Inventory', 'Maintenance / OEE'],
    agents: ['Production Planner AI', 'Quality Manager AI', 'Supply Chain Analyst AI'],
    connectors: ['SAP', 'Oracle', 'Power BI'],
  },
  {
    id: 'government', icon: '🏛', name: 'Government & Public Sector',
    industries: ['Federal', 'State', 'Local', 'Military', 'Public Safety', 'Transportation', 'Education'],
    modules: ['Grant Management', 'Procurement', 'Public Records', 'Budget Appropriations', 'Compliance'],
    agents: ['Compliance Officer AI', 'Grants Manager AI'],
    connectors: ['Microsoft 365', 'ServiceNow', 'Tableau'],
  },
  {
    id: 'corporate', icon: '💼', name: 'Corporate Operations',
    industries: ['Human Resources', 'Finance', 'Accounting', 'Marketing', 'Legal', 'Sales', 'Customer Success'],
    modules: ['OKRs', 'Budgeting', 'Campaigns', 'Contracts', 'Pipeline'],
    agents: ['HR Coordinator AI', 'Financial Analyst AI', 'Legal Reviewer AI'],
    connectors: ['Salesforce', 'Microsoft 365', 'Slack'],
  },
  {
    id: 'property', icon: '🏢', name: 'Property & Facilities', specialty: true,
    industries: ['Multifamily', 'Commercial', 'Hospitality', 'Asset Management', 'Maintenance', 'Leasing', 'Resident Services'],
    modules: ['Yardi', 'CRM IQ', 'Leasing', 'Maintenance', 'Occupancy', 'Resident Communications'],
    agents: ['Leasing Manager AI', 'Maintenance Coordinator AI', 'Resident Relations AI'],
    connectors: ['Yardi', 'RealPage', 'n8n', 'Notion'],
  },
  {
    id: 'education', icon: '🎓', name: 'Education & Research',
    industries: ['Universities', 'Schools', 'Research Labs', 'Nonprofits', 'Foundations'],
    modules: ['Grant Management', 'Curriculum', 'Research Protocols', 'Accreditation', 'Enrollment'],
    agents: ['Research Coordinator AI', 'Grants Manager AI'],
    connectors: ['Google Workspace', 'Microsoft 365', 'Notion'],
  },
  {
    id: 'energy', icon: '🌍', name: 'Energy & Environment',
    industries: ['Oil & Gas', 'Renewable Energy', 'Solar', 'Utilities', 'Water', 'Environmental Programs'],
    modules: ['SCADA Monitoring', 'NERC / IEC Compliance', 'Asset Performance', 'Environmental Reporting', 'Outage Management'],
    agents: ['SCADA Operator AI', 'Compliance Officer AI', 'Environmental Analyst AI'],
    connectors: ['n8n', 'Power BI', 'SAP'],
  },
  {
    id: 'innovation', icon: '🚀', name: 'Innovation',
    industries: ['Startups', 'Venture Capital', 'Product Launches', 'R&D', 'Incubators', 'Accelerators'],
    modules: ['Roadmaps', 'Fundraising', 'Experiments', 'Go-To-Market', 'Cohort Management'],
    agents: ['Product Strategist AI', 'Fundraising Analyst AI'],
    connectors: ['Notion', 'Slack', 'GitHub'],
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

// ── Persisted activation profile ──
export interface DomainActivation { modules: string[]; agents: string[] }
export interface PlatformProfile {
  activeDomain: string | null
  activations: Record<string, DomainActivation>
}

const KEY = 'secc-os.platform.profile'

export function loadProfile(): PlatformProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { activeDomain: null, activations: {} }
}

export function saveProfile(p: PlatformProfile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

/* Default activation for a domain = everything on. */
export function defaultActivation(d: Domain): DomainActivation {
  return { modules: [...d.modules], agents: [...d.agents] }
}
