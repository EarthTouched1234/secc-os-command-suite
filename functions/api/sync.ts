/**
 * Real-Time Feed Sync via Server-Sent Events (SSE)
 * Clients connect to /api/stream/feed and receive updates as they happen.
 * Replaces polling with push-based real-time updates.
 */

import { Router } from 'express'
import { EventEmitter } from 'events'

const feedEmitter = new EventEmitter()
export const syncRouter = Router()

// Track connected clients for monitoring
let connectedClients = 0

/**
 * GET /api/stream/feed
 * Server-Sent Events endpoint for real-time feed updates.
 * Clients connect and receive updates as they happen.
 *
 * Usage:
 * ```javascript
 * const eventSource = new EventSource('/api/stream/feed')
 * eventSource.addEventListener('message', (event) => {
 *   const data = JSON.parse(event.data)
 *   console.log('Feed update:', data)
 * })
 * ```
 */
syncRouter.get('/api/stream/feed', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering

  connectedClients++
  console.log(`[sync] Client connected. Total: ${connectedClients}`)

  // Send initial heartbeat
  res.write(`: heartbeat\n\n`)

  const listener = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch (err) {
      console.error('[sync] Write error:', err)
    }
  }

  // Register listener
  feedEmitter.on('update', listener)

  // Handle client disconnect
  req.on('close', () => {
    feedEmitter.off('update', listener)
    connectedClients--
    console.log(`[sync] Client disconnected. Total: ${connectedClients}`)
    res.end()
  })

  // Error handler
  req.on('error', (err) => {
    console.error('[sync] Request error:', err)
    feedEmitter.off('update', listener)
    connectedClients--
    res.end()
  })
})

/**
 * GET /api/stream/health
 * Health check and stats endpoint.
 */
syncRouter.get('/api/stream/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients,
    timestamp: new Date().toISOString(),
  })
})

/**
 * Broadcast a feed update to all connected clients.
 * Called by webhooks and background workers.
 *
 * @param data The update object to broadcast
 */
export function broadcastFeedUpdate(data: any): void {
  console.log('[sync] Broadcasting to', connectedClients, 'clients:', data.type)
  feedEmitter.emit('update', {
    ...data,
    broadcastAt: new Date().toISOString(),
  })
}

/**
 * Broadcast a system health update.
 */
export function broadcastHealthUpdate(metrics: {
  successRate: number
  recentErrors: number
  avgLatencyMs: number
  connectedAgents: number
}): void {
  broadcastFeedUpdate({
    type: 'health_update',
    metrics,
  })
}

/**
 * Broadcast an execution status change.
 */
export function broadcastExecutionStatus(
  executionId: string,
  status: 'pending' | 'running' | 'verified' | 'failed'
): void {
  broadcastFeedUpdate({
    type: 'execution_status',
    executionId,
    status,
  })
}

/**
 * Broadcast an escalation alert.
 */
export function broadcastEscalation(alert: {
  actionId: string
  reason: string
  priority: 'high' | 'critical'
}): void {
  broadcastFeedUpdate({
    type: 'escalation_alert',
    alert,
  })
}
