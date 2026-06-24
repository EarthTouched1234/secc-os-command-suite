/* ──────────────────────────────────────────────────────────────────────────
   iAgent Network — SEIS Layer 3 (ARCHITECTURE.md §7.3, sys_021).
   `i*` names are architectural INTERFACES; the named agents are IMPLEMENTATIONS.
   Code against AgentInterface; render the implementation identity to users.

   This is LIVING METADATA, not a lookup table — Mission Control builds agent
   cards, capability matrices, health views, and routing tables FROM this registry.
   ────────────────────────────────────────────────────────────────────────── */

export type AgentInterface =
  | 'iCommander' | 'iCoordinator' | 'iExecution' | 'iIntegration' | 'iIntelligence' | 'iGuardian'

export type AgentDomain =
  | 'Governance' | 'Execution' | 'Integration' | 'Intelligence' | 'Security'

/** Declared baseline state. Live runtime state (sys_009) overlays from feeds. */
export type AgentStatus = 'IDLE' | 'ACTIVE' | 'STREAMING' | 'BLOCKED'

export interface AgentDef {
  interface: AgentInterface
  implementation: string        // code/system identity
  displayName: string           // user-facing label (may diverge from implementation later)
  role: string
  domain: AgentDomain
  capabilities: string[]
  status: AgentStatus           // declared baseline; live status overlays from feeds
  color: string
  version: string
}

export const AGENTS: Record<AgentInterface, AgentDef> = {
  iCommander: {
    interface: 'iCommander', implementation: 'HORHANiS', displayName: 'HORHANiS',
    role: 'Governance, approvals, executive control', domain: 'Governance',
    capabilities: ['Approvals routing', 'Prioritization', 'Risk escalation', 'Executive brief', 'Dispatch triage'],
    status: 'ACTIVE', color: '#ef4444', version: '1.0.0',
  },
  iCoordinator: {
    interface: 'iCoordinator', implementation: 'TRiO', displayName: 'TRiO',
    role: 'Multi-agent orchestration', domain: 'Execution',
    capabilities: ['Multi-agent routing', 'Strategic operations', 'Validation', 'Reasoning layer'],
    status: 'IDLE', color: '#eab308', version: '1.0.0',
  },
  iExecution: {
    interface: 'iExecution', implementation: 'TiTO', displayName: 'TiTO',
    role: 'Task execution and workflow operations', domain: 'Execution',
    capabilities: ['Content & writing', 'Workflow operations', 'SOPs', 'Task execution'],
    status: 'IDLE', color: '#f97316', version: '1.0.0',
  },
  iIntegration: {
    interface: 'iIntegration', implementation: 'CiRO', displayName: 'CiRO',
    role: 'APIs, connectors, synchronization', domain: 'Integration',
    capabilities: ['n8n builds', 'API connectors', 'Debugging', 'Synchronization'],
    status: 'IDLE', color: '#3b82f6', version: '1.0.0',
  },
  iIntelligence: {
    interface: 'iIntelligence', implementation: 'SunNi', displayName: 'SunNi',
    role: 'Strategic reasoning, synthesis, executive insights', domain: 'Intelligence',
    capabilities: ['360 synthesis', 'Executive insight', 'Strategic reasoning', 'Portfolio view'],
    status: 'IDLE', color: '#fbbf24', version: '1.0.0',
  },
  iGuardian: {
    interface: 'iGuardian', implementation: 'GUARDiAN', displayName: 'GUARDiAN',
    role: 'Security, compliance, monitoring, risk', domain: 'Security',
    capabilities: ['Zero-trust gate', 'Compliance', 'Risk register', 'Monitoring'],
    status: 'ACTIVE', color: '#64748b', version: '1.0.0',
  },
}

const BY_NAME: Record<string, AgentDef> = Object.fromEntries(
  Object.values(AGENTS).flatMap(d => [[d.implementation, d], [d.displayName, d]])
)

/** Resolve an interface name OR an implementation/display name to its definition. */
export function resolveAgent(key: string): AgentDef | undefined {
  return (AGENTS as Record<string, AgentDef>)[key] || BY_NAME[key]
}

/** User-facing name for an interface or agent key. */
export function agentName(key: string): string {
  return resolveAgent(key)?.displayName ?? key
}

/** Brand color for an interface or agent key. */
export function agentColor(key: string): string {
  return resolveAgent(key)?.color ?? '#888'
}

/** All definitions as an array (for cards, matrices, health views). */
export const AGENT_LIST: AgentDef[] = Object.values(AGENTS)
