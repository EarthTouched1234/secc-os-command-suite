import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchFeed, fetchSystemExecutions } from '../api/n8n'
import type { FeedEntry, SystemExecution } from '../api/n8n'

const POLL_INTERVAL = 30_000

export function useFeed() {
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [systemExecs, setSystemExecs] = useState<SystemExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const [feedData, sysData] = await Promise.all([fetchFeed(20), fetchSystemExecutions(30)])
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

  useEffect(() => {
    mountedRef.current = true
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
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
    housing: 'NOMINAL', income: 'NOMINAL', health: 'NOMINAL', business: 'NOMINAL', ccos: 'NOMINAL',
  }

  for (const entry of feed.slice(0, 30)) {
    const d = entry.domain?.toLowerCase() as Domain
    if (!domains.includes(d)) continue
    if (entry.missionStatus === 'ESCALATE') statusMap[d] = 'CRITICAL'
    else if (entry.missionStatus === 'PENDING_APPROVAL' && statusMap[d] !== 'CRITICAL') statusMap[d] = 'ELEVATED'
    else if (entry.status === 'error' && statusMap[d] === 'NOMINAL') statusMap[d] = 'DEGRADED'
  }

  return statusMap
}
