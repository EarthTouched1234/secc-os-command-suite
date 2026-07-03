/**
 * Action Executor with Verification Loop and Retry Logic
 * Executes Action Objects against target systems with audit persistence and recovery.
 */

import type { ActionObject } from './executionFabric'
import { triggerConnector, CONNECTORS } from '../api/notion'

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

/**
 * Execute a single action with verification, retry, and audit logging.
 * Returns verification status from the Notion audit ledger.
 */
export async function executeAction(
  action: ActionObject,
  decisionId: string,
  maxRetries = 3
): Promise<ExecutionResult> {
  let attempts = 0
  let lastError: string | undefined

  const actionId = `${action.system}-${decisionId}-${Date.now()}`
  const timestamp = new Date().toISOString()

  while (attempts < maxRetries) {
    try {
      attempts++

      // 1. Find and trigger the connector
      const connector = CONNECTORS.find(c =>
        c.id.toLowerCase().includes(action.system.toLowerCase())
      )

      if (!connector) {
        throw new Error(`No connector found for system: ${action.system}`)
      }

      console.log(`[executor] Executing action ${actionId} (attempt ${attempts}/${maxRetries})`, {
        system: action.system,
        action: action.action,
        connector: connector.id,
      })

      // 2. Trigger the connector
      const response = await triggerConnector(connector, action.payload)

      // 3. Generate execution hash for idempotency
      const executionHash = generateExecutionHash({
        decisionId,
        system: action.system,
        action: action.action,
        payload: action.payload,
        timestamp,
      })

      // 4. Persist to Notion audit ledger
      const auditRecord = await persistAuditLedger({
        decision_id: decisionId,
        system: action.system,
        action: action.action,
        execution_status: 'pending',
        execution_hash: executionHash,
        receipt_json: JSON.stringify(response || {}),
        timestamp,
        retry_count: attempts - 1,
      })

      console.log(`[executor] Audit record created: ${auditRecord.id}`)

      // 5. Verify the read-back (confirmation from Notion)
      const verified = await verifyAuditRow(auditRecord.id!, executionHash)

      if (verified) {
        console.log(`[executor] Action ${actionId} verified in audit ledger`)
        return {
          actionId,
          status: 'verified',
          executionHash,
          ledgerRowId: auditRecord.id,
          attempts,
          timestamp,
        }
      } else {
        throw new Error('Audit row verification failed — hash mismatch')
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)

      console.error(`[executor] Attempt ${attempts} failed:`, lastError)

      if (attempts >= maxRetries) {
        // Max retries exceeded — escalate
        console.error(`[executor] Action ${actionId} failed after ${attempts} attempts. Escalating.`)
        return {
          actionId,
          status: 'failed',
          executionHash: '',
          error: lastError,
          attempts,
          timestamp,
        }
      }

      // Exponential backoff before retry
      const delayMs = 2000 * Math.pow(2, attempts - 1)
      console.log(`[executor] Retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return {
    actionId,
    status: 'failed',
    executionHash: '',
    error: `Failed after ${attempts} attempts: ${lastError}`,
    attempts,
    timestamp,
  }
}

/**
 * Execute multiple actions (fan-out from a single decision).
 * Returns results for all actions.
 */
export async function executeActionsParallel(
  actions: ActionObject[],
  decisionId: string
): Promise<ExecutionResult[]> {
  return Promise.all(
    actions.map(action => executeAction(action, decisionId))
  )
}

/**
 * Generate a deterministic hash for an execution.
 * Used for idempotency: same input = same hash = no duplicate effects.
 */
function generateExecutionHash(obj: Record<string, any>): string {
  // In production, use crypto.createHash('sha256')
  // For now, use a simple base64-based hash
  const json = JSON.stringify(obj)
  const encoded = Buffer.from(json).toString('base64')
  return encoded.substring(0, 32)
}

/**
 * Persist an execution record to Notion Audit Ledger.
 * In Phase 0, this is stubbed. Phase 1 attaches the real Notion credential.
 */
async function persistAuditLedger(record: AuditRecord): Promise<AuditRecord> {
  // TODO: Implement via Notion API
  // For now, generate a mock ID and return
  console.log('[persistAuditLedger] Persisting audit record:', record)

  const mockId = `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`
  return { ...record, id: mockId }
}

/**
 * Verify that an audit row was successfully written and retrievable.
 * Part of the verification loop: no execution is complete until read-back succeeds.
 */
async function verifyAuditRow(ledgerRowId: string, executionHash: string): Promise<boolean> {
  // TODO: Implement via Notion API database.query()
  // For now, assume success (Phase 0 simulation)
  console.log(`[verifyAuditRow] Verifying row ${ledgerRowId} with hash ${executionHash}`)

  // In production:
  // const response = await notion.databases.query({
  //   database_id: NOTION_AUDIT_DB_ID,
  //   filter: { property: 'Execution Hash', rich_text: { equals: executionHash } }
  // })
  // return response.results.length > 0

  return true // Phase 0: simulate success
}

/**
 * Escalate a failed action to Mission Control.
 * Creates a visible alert in the Approval Queue.
 */
export async function escalateToMissionControl(result: ExecutionResult): Promise<void> {
  console.log('[escalateToMissionControl]', {
    actionId: result.actionId,
    status: result.status,
    error: result.error,
    attempts: result.attempts,
  })

  // TODO: Trigger n8n workflow or create Notion page in Escalation Queue
  // For now, log only
}
