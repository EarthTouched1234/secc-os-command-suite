import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchFeed, fetchSystemExecutions } from '../api/n8n'
import type { FeedEntry, SystemExecution } from '../api/n8n'

const POLL_INTERVAL = 30_000 // Fallback to polling every 30 seconds

// Determine stream URL based on environment
const STREAM_URL = (() => {
  if (typeof window === 'undefined') return ''
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api/stream/feed`
  }
  return 'http://localhost:3000/api/stream/feed'
})()

export function useFeed() {
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [systemExecs, setSystemExecs] = useState<SystemExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const mountedRef = useRef(true)
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [feedData, sysData] = await Promise.all([
        fetchFeed(20),
        fetchSystemExecutions(30),
      ])
      if (!mountedRef.current) return
      setFeed(feedData)
      setSystemExecs(sysData)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  // Set up real-time event stream (Server-Sent Events)
  useEffect(() => {
    if (!mountedRef.current || !STREAM_URL) return

    try {
      console.log('[useFeed] Connecting to real-time stream:', STREAM_URL)
      const eventSource = new EventSource(STREAM_URL)
      eventSourceRef.current = eventSource

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[useFeed] Received stream update:', data.type)

          if (data.type === 'execution_complete' && data.auditRecord) {
            // Update feed immediately with new execution
            setFeed(prev => [
              {
                ...data.auditRecord,
                n8nExecutionId: data.executionId || '',
                startedAt: data.timestamp || new Date().toISOString(),
              } as FeedEntry,
              ...prev,
            ])
            setLastUpdated(new Date())
          } else if (data.type === 'execution_failed') {
            // Log failure
            console.warn('[useFeed] Execution failed:', data.error)
            setError(`Execution ${data.executionId} failed: ${data.error}`)
          } else if (data.type === 'execution_status') {
            // Status change (pending → running → verified → failed)
            console.log('[useFeed] Execution status changed:', data.executionId, data.status)
          } else if (data.type === 'health_update') {
            // Health metrics update
            console.log('[useFeed] System health update:', data.metrics)
          } else if (data.type === 'escalation_alert') {
            // Escalation alert
            console.warn('[useFeed] Escalation alert:', data.alert)
            setError(`ESCALATION: ${data.alert.reason}`)
          }
        } catch (parseErr) {
          console.error('[useFeed] Failed to parse stream message:', event.data, parseErr)
        }
      })

      eventSource.addEventListener('error', (err) => {
        console.warn('[useFeed] Event stream disconnected, falling back to polling:', err)
        eventSource.close()
        eventSourceRef.current = null
      })
    } catch (err) {
      console.warn('[useFeed] Failed to connect to event stream:', err)
    }

    return () => {
      if (eventSourceRef.current) {
        console.log('[useFeed] Closing event stream')
        eventSourceRef.current.close()
      }
    }
  }, [STREAM_URL])

  // Initial load + fallback polling
  useEffect(() => {
    mountedRef.current = true
    refresh()

    // Set up polling as a fallback
    pollIntervalRef.current = setInterval(refresh, POLL_INTERVAL)

    return () => {
      mountedRef.current = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [refresh])

  return { feed, systemExecs, loading, error, lastUpdated, refresh }
}

export function computeMissionStatus(feed: FeedEntry[]) {
  const recent = feed.slice(0, 20)
  if (recent.some((e) => e.missionStatus === 'ESCALATE' || e.escalate)) return 'CRITICAL'
  if (recent.some((e) => e.missionStatus === 'PENDING_APPROVAL' || e.requiresApproval)) return 'ELEVATED'
  return 'NOMINAL'
}

export function computeDomainStatus(feed: FeedEntry[]) {
  const domains = ['housing', 'income', 'health', 'business', 'ccos'] as const
  type Domain = (typeof domains)[number]
  const statusMap: Record<Domain, string> = {
    housing: 'NOMINAL',
    income: 'NOMINAL',
    health: 'NOMINAL',
    business: 'NOMINAL',
    ccos: 'NOMINAL',
  }

  for (const entry of feed.slice(0, 30)) {
    const d = entry.domain?.toLowerCase() as Domain
    if (!domains.includes(d)) continue
    if (entry.missionStatus === 'ESCALATE') statusMap[d] = 'CRITICAL'
    else if (entry.missionStatus === 'PENDING_APPROVAL' && statusMap[d] !== 'CRITICAL')
      statusMap[d] = 'ELEVATED'
    else if (entry.status === 'error' && statusMap[d] === 'NOMINAL') statusMap[d] = 'DEGRADED'
  }

  return statusMap
}
