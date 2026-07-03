/**
 * Decision to Action Translator
 * Converts Decision Objects into executable Action Objects for each target system.
 * Phase 1 implementation of the Execution Fabric.
 */

import type { DecisionObject } from '../decision/decisionLayer'
import type { ActionObject } from './executionFabric'
import { DECISION_ACTION_MAP } from './executionFabric'

/**
 * Translate a Decision Object into a list of Action Objects.
 * One decision can fan out to multiple systems.
 */
export function decisionToActions(decision: DecisionObject): ActionObject[] {
  return decision.routing.systems.map(systemName => {
    const mapping = DECISION_ACTION_MAP.find(m =>
      m.systemAction.toLowerCase().includes(systemName.toLowerCase())
    )

    if (!mapping) {
      throw new Error(`No action mapping found for system: ${systemName}`)
    }

    return {
      system: systemName,
      action: mapping.systemAction.split(' · ')[1] || mapping.decision,
      payload: translateDecisionToPayload(systemName, decision),
    }
  })
}

/**
 * System-specific payload translation.
 * Converts generic Decision context into system-specific API payloads.
 */
function translateDecisionToPayload(
  system: string,
  decision: DecisionObject
): Record<string, string> {
  const basePayload: Record<string, string> = {
    decision_id: `${decision.domain}-${Date.now()}`,
    domain: decision.domain,
    signal: decision.signal,
    recommended_action: decision.recommendedAction,
    confidence: String(decision.confidence),
    diagnosis: decision.diagnosis,
  }

  // System-specific payload translation
  if (system.toLowerCase() === 'yardi') {
    return {
      ...basePayload,
      action_type: 'reprioritize_work_orders',
      priority: decision.options[0]?.impact === 'high' ? 'high' : 'medium',
      impact: decision.options[0]?.impact || 'medium',
    }
  } else if (system.toLowerCase() === 'crmiq' || system.toLowerCase() === 'crm iq') {
    return {
      ...basePayload,
      action_type: 'create_task_batch',
      task_count: '12',
      template: 'leasing_follow_up',
      leasing_context: decision.context['Tour conversion'] || 'N/A',
    }
  } else if (system.toLowerCase() === 'notion') {
    return {
      ...basePayload,
      action_type: 'write_audit_log',
      execution_status: 'pending',
      actions: decision.options.map(o => o.action).join(' | '),
    }
  } else if (system.toLowerCase() === 'slack') {
    return {
      ...basePayload,
      action_type: 'send_alert',
      channel: '#property-ops',
      message: `Decision: ${decision.recommendedAction}`,
    }
  } else if (system.toLowerCase() === 'powerbi') {
    return {
      ...basePayload,
      action_type: 'update_kpi',
      metric_type: 'occupancy',
      refresh_priority: 'high',
    }
  }

  return basePayload
}

/**
 * Validate that a decision can be executed.
 * Checks routing, capabilities, and constraints.
 */
export function validateDecisionExecutability(decision: DecisionObject): { valid: boolean; reasons: string[] } {
  const reasons: string[] = []

  if (!decision.routing.systems || decision.routing.systems.length === 0) {
    reasons.push('No target systems in routing')
  }

  if (!decision.routing.agents || decision.routing.agents.length === 0) {
    reasons.push('No agents assigned to routing')
  }

  if (!decision.recommendedAction) {
    reasons.push('No recommended action specified')
  }

  if (decision.confidence < 0.3) {
    reasons.push(`Confidence too low: ${decision.confidence} (minimum 0.3 required)`)
  }

  return {
    valid: reasons.length === 0,
    reasons,
  }
}
