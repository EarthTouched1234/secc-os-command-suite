/**
 * n8n Execution Webhook Handler
 * Receives completion events from n8n workflows and broadcasts to connected clients.
 * Enables real-time feed updates without polling.
 */

import { Router } from 'express'

export const executionWebhookRouter = Router()

// Global event emitter for broadcasting to connected SSE clients
const broadcastCallbacks = new Set<(data: any) => void>()

/**
 * Register a callback to receive broadcast updates.
 * Used by the SSE endpoint to send data to connected clients.
 */
export function onExecutionComplete(callback: (data: any) => void): () => void {
  broadcastCallbacks.add(callback)
  return () => broadcastCallbacks.delete(callback)
}

/**
 * Broadcast an update to all connected clients.
 */
function broadcast(data: any): void {
  console.log('[executionWebhook] Broadcasting to', broadcastCallbacks.size, 'clients:', data.type)
  broadcastCallbacks.forEach(callback => {
    try {
      callback(data)
    } catch (err) {
      console.error('[executionWebhook] Callback error:', err)
    }
  })
}

/**
 * POST /webhook/secc-os/execution-complete
 * Fired by n8n when execution-fabric-property-v1.2 completes.
 *
 * Expected payload:
 * {
 *   executionId: string
 *   workflowId: string
 *   status: 'success' | 'error'
 *   output?: { auditRecord: {...}, ... }
 *   error?: string
 * }
 */
executionWebhookRouter.post('/webhook/secc-os/execution-complete', async (req, res) => {
  const { executionId, workflowId, status, output, error } = req.body

  try {
    console.log('[executionWebhook] Received event:', { executionId, workflowId, status })

    if (!executionId) {
      return res.status(400).json({ error: 'Missing executionId' })
    }

    if (status === 'success' && output?.auditRecord) {
      // Broadcast success event to all connected clients
      broadcast({
        type: 'execution_complete',
        executionId,
        workflowId,
        status: 'success',
        auditRecord: output.auditRecord,
        timestamp: new Date().toISOString(),
      })

      res.json({ acknowledged: true, action: 'broadcast' })
    } else if (status === 'error') {
      // Queue for retry
      console.warn('[executionWebhook] Execution failed, queueing retry:', error)

      broadcast({
        type: 'execution_failed',
        executionId,
        workflowId,
        error,
        timestamp: new Date().toISOString(),
      })

      // TODO: Enqueue for retry via Bull queue
      // await retryQueue.add({ executionId, error, attempt: 1 })

      res.json({ acknowledged: true, action: 'retry_queued' })
    } else {
      res.status(400).json({ error: 'Invalid webhook payload', received: { status, hasOutput: !!output } })
    }
  } catch (err) {
    console.error('[executionWebhook] Handler error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /webhook/secc-os/agent-response
 * Fired when an agent completes a response (HORHANiS, TRiO, TiTO, etc.).
 * Converts agent response to Decision Object and queues for execution.
 */
executionWebhookRouter.post('/webhook/secc-os/agent-response', async (req, res) => {
  const { sessionId, agent, response, turnNumber } = req.body

  try {
    console.log('[executionWebhook] Agent response received:', { agent, sessionId, turnNumber })

    if (!sessionId || !agent || !response) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, agent, response' })
    }

    // TODO: Parse agent response into Decision Object
    // const decision = parseAgentResponseToDecision(response, agent)

    // TODO: Route through GUARDiAN
    // const guardian = await evaluateRisk(decision)

    // For now, just broadcast the response
    broadcast({
      type: 'agent_response',
      agent,
      sessionId,
      turnNumber,
      responsePreview: typeof response === 'string' ? response.substring(0, 100) : response,
      timestamp: new Date().toISOString(),
    })

    res.json({ acknowledged: true, action: 'queued_for_execution' })
  } catch (err) {
    console.error('[executionWebhook] Agent response handler error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /health
 * Health check endpoint.
 */
executionWebhookRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', connectedClients: broadcastCallbacks.size })
})
