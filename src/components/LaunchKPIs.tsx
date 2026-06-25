import { useState, useEffect, useCallback } from 'react'
import { fetchLaunchKPIs, type LaunchKPIs } from '../api/n8n'

function minsAgo(iso: string | null) {
  if (!iso) return ''
  return `${Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))}m ago`
}

const card: React.CSSProperties = {
  background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 18,
}
const big: React.CSSProperties = { fontSize: 34, fontWeight: 700, color: 'var(--gold)', lineHeight: 1.1 }
const lbl: React.CSSProperties = { fontSize: 12, color: 'var(--soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 }
const sub: React.CSSProperties = { fontSize: 13, color: 'var(--muted)', marginTop: 4 }

function Stat({ value, label, subline, color }: { value: React.ReactNode; label: string; subline?: string; color?: string }) {
  return (
    <div style={card}>
      <div style={{ ...big, ...(color ? { color } : {}) }}>{value}</div>
      <div style={lbl}>{label}</div>
      {subline && <div style={sub}>{subline}</div>}
    </div>
  )
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{label}</span><span style={{ color: 'var(--text)' }}>{value}</span>
      </div>
      <div style={{ height: 7, background: 'var(--panel-2)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

export default function LaunchKPIs() {
  const [kpi, setKpi] = useState<LaunchKPIs | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchLaunchKPIs()
    if (data) setKpi(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const wl = kpi?.waitlist
  const dv = kpi?.divisions
  const site = kpi?.site

  return (
    <div className="pmo-root">
      <div className="pmo-header">
        <span className="pmo-title">Launch — KPI Command</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pmo-last-fetch">{kpi ? `Live · ${minsAgo(kpi.generatedAt)}` : ''}</span>
          <button className="pmo-refresh" onClick={load} disabled={loading}>{loading ? '⟳' : 'Refresh'}</button>
        </div>
      </div>

      {!kpi && !loading && <p style={{ color: 'var(--muted)', padding: 16 }}>No KPI data — check the Launch KPI Feed webhook.</p>}

      {kpi && (
        <div style={{ overflowY: 'auto', paddingRight: 4 }}>
          {/* Top KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {site && <Stat value={site.pageviews} label="Pageviews" subline={`+${site.pageviews7} in 7d · ${site.uniqueSessions} sessions`} color="var(--blue)" />}
            {site && <Stat value={`${Math.min(100, site.conversionPct)}%`} label="Signup conversion" subline="signups ÷ pageviews" />}
            <Stat value={wl!.total} label="Waitlist signups" subline={`+${wl!.last7} in last 7 days`} />
            <Stat value={wl!.onboarded} label="Onboarded" subline={`${wl!.byStatus.New} new · ${wl!.byStatus.Contacted} contacted`} color="var(--green)" />
            <Stat value={wl!.enterpriseInterest} label="Enterprise interest" subline="tier-interest proxy" />
            <Stat value={`${dv!.shipped}/${dv!.total}`} label="Divisions shipped" subline={`${dv!.inProgress} in progress`} />
            <Stat value={`${dv!.avgConfidence}%`} label="Avg confidence" color="var(--blue)" />
            <Stat value={<span>{dv!.green}<span style={{ color: 'var(--amber)', fontSize: 22 }}> / {dv!.amber}</span><span style={{ color: 'var(--red)', fontSize: 22 }}> / {dv!.red}</span></span>}
                  label="Portfolio RAG" subline="green / amber / red" color="var(--green)" />
          </div>

          {/* Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 16 }}>
            <div style={card}>
              <div style={lbl}>Waitlist by tier interest</div>
              <div style={{ marginTop: 12 }}>
                <Bar label="SEIS Core" value={wl!.byTier.Core} total={wl!.total} color="var(--blue)" />
                <Bar label="SEIS Ops" value={wl!.byTier.Ops} total={wl!.total} color="var(--green)" />
                <Bar label="Enterprise" value={wl!.byTier.Enterprise} total={wl!.total} color="var(--violet)" />
                <Bar label="Unsure" value={wl!.byTier.Unsure} total={wl!.total} color="var(--soft)" />
              </div>
            </div>
            <div style={card}>
              <div style={lbl}>Funnel status</div>
              <div style={{ marginTop: 12 }}>
                <Bar label="New" value={wl!.byStatus.New} total={wl!.total} color="var(--amber)" />
                <Bar label="Contacted" value={wl!.byStatus.Contacted} total={wl!.total} color="var(--blue)" />
                <Bar label="Onboarded" value={wl!.byStatus.Onboarded} total={wl!.total} color="var(--green)" />
                <Bar label="Declined" value={wl!.byStatus.Declined} total={wl!.total} color="var(--red)" />
              </div>
            </div>
            <div style={card}>
              <div style={lbl}>Division execution</div>
              <div style={{ marginTop: 12 }}>
                <Bar label="Shipped" value={dv!.shipped} total={dv!.total} color="var(--green)" />
                <Bar label="In progress / review" value={dv!.inProgress} total={dv!.total} color="var(--blue)" />
                <Bar label="Blocked" value={dv!.blocked} total={dv!.total} color="var(--red)" />
              </div>
            </div>
          </div>

          {/* Not instrumented — honesty gate */}
          <div style={{ ...card, marginTop: 16, borderColor: 'rgba(245,180,60,0.35)' }}>
            <div style={{ ...lbl, color: 'var(--amber)' }}>⚠ Not yet instrumented</div>
            <p style={{ ...sub, marginTop: 6 }}>These KPIs are intentionally not shown as numbers — the data source isn't wired. Truthful by design.</p>
            <div style={{ marginTop: 10 }}>
              {kpi.notInstrumented.map(n => (
                <div key={n.metric} style={{ display: 'flex', gap: 10, padding: '6px 0', borderTop: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 600, minWidth: 150 }}>{n.metric}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{n.reason}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ ...sub, marginTop: 14, marginBottom: 20 }}>
            Sources: 📨 SEIS Waitlist · 🚀 Launch Divisions Register · feed <code style={{ color: 'var(--gold)' }}>/webhook/launch/kpis</code>
          </p>
        </div>
      )}
    </div>
  )
}
