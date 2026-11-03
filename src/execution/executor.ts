/**
 * TiTO execution safety gate.
 *
 * The previous Phase 0 implementation dispatched real connectors, then created
 * a mock audit row and always reported verification success. That behavior
 * must never be used for privileged execution.
 *
 * Until a durable, authenticated execution service with persistent idempotency,
 * real external receipts, and read-back verification is integrated, this
 * entrypoint fails closed WITHOUT contacting any external connector.
 */
import type { ActionObject } from './executionFabric'

export interface ExecutionResult {
  actionId: string
  status: 'verified' | 'failed' | 'recovered'
  executionHash: string
  ledgerRowId?: string
  error?: string
  attempts: number
  timestamp: string
}

export interface AuditRecord {
  id?: string
  decision_id: string
  system: string
  action: string
  execution_status: 'pending' | 'verified' | 'failed' | 'recovered'
  execution_hash: string
  receipt_json: string
  timestamp: string
  retry_count?: number
  verification_hash?: string
}

const EXECUTION_BLOCKED =
  'Execution disabled: durable idempotency, authorization, audit persistence, and external read-back verification are not configured.'

/** Fail closed; do not dispatch side-effecting requests or simulate success. */
export async function executeAction(
  action: ActionObject,
  decisionId: string,
  _maxRetries = 3,
): Promise<ExecutionResult> {
  const timestamp = new Date().toISOString()
  return {
    actionId: `${action.system}-${decisionId}-blocked`,
    status: 'failed',
    executionHash: '',
    attempts: 0,
    timestamp,
    error: EXECUTION_BLOCKED,
  }
}

/** Preserve API compatibility while keeping every action blocked. */
export async function executeActionsParallel(
  actions: ActionObject[],
  decisionId: string,
): Promise<ExecutionResult[]> {
  return Promise.all(actions.map(action => executeAction(action, decisionId)))
}

/** Log only. No durable escalation queue is configured; callers must surface the error. */
export async function escalateToMissionControl(result: ExecutionResult): Promise<void> {
  console.error('[executor] Escalation not persisted; operator attention required', {
    actionId: result.actionId,
    status: result.status,
    error: result.error,
  })
}
