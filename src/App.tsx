import { useState } from 'react'
import { useFeed } from './hooks/useFeed'
import { TheCouncil } from './components/TheCouncil'
import { TheFlow } from './components/TheFlow'
import { ThePulse } from './components/ThePulse'
import { TheArchives } from './components/TheArchives'
import { VoiceCommand } from './components/VoiceCommand'
import { ApprovalQueue } from './components/ApprovalQueue'
import { PriorityMonitor } from './components/PriorityMonitor'
import { AgentFeed } from './components/AgentFeed'
import { IncidentLog } from './components/IncidentLog'
import { ChatBridge } from './components/ChatBridge'
import { Documents } from './components/Documents'
import { Projects } from './components/Projects'
import { Tasks } from './components/Tasks'
import { Connectors } from './components/Connectors'
import { PMODashboard } from './components/PMODashboard'
import { GUARDiAN } from './components/GUARDiAN'
import { MissionTimeline } from './components/MissionTimeline'
import { GTM } from './components/GTM'
import { Editions } from './components/Editions'
import { Platform } from './components/Platform'
import { DecisionLayer } from './components/DecisionLayer'
import { ExecutionFabric } from './components/ExecutionFabric'
import { Outcomes } from './components/Outcomes'
import { useEffect } from 'react'
import { type Edition, loadActiveEdition, saveActiveEdition, applyEditionTheme, visibleTabs, labelFor } from './editions/editions'
import { computeMissionStatus } from './hooks/useFeed'
import './App.css'

type Tab = 'Dashboard' | 'Execute' | 'Approve' | 'Critical' | 'Agents' | 'ChatBridge' | 'Documents' | 'Projects' | 'Tasks' | 'Connectors' | 'Inbox' | 'PMO' | 'GUARDiAN' | 'Timeline' | 'GTM' | 'Editions' | 'Platform' | 'Decisions' | 'Fabric' | 'Outcomes'
const TABS: Tab[] = ['Dashboard', 'PMO', 'Platform', 'Decisions', 'Fabric', 'Outcomes', 'Timeline', 'GUARDiAN', 'GTM', 'ChatBridge', 'Documents', 'Projects', 'Tasks', 'Connectors', 'Execute', 'Approve', 'Critical', 'Agents', 'Inbox', 'Editions']

export default function App() {
  const { feed, systemExecs, loading, error, lastUpdated, refresh } = useFeed()
  const [pulseMode, setPulseMode] = useState<'ready' | 'running' | 'publish'>('ready')
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard')
  const [edition, setEdition] = useState<Edition>(loadActiveEdition)
  const applyEdition = (e: Edition) => { setEdition(e); saveActiveEdition(e) }
  const navTabs = visibleTabs(TABS, edition) as Tab[]

  useEffect(() => { applyEditionTheme(edition) }, [edition])
  useEffect(() => { if (!navTabs.includes(activeTab)) setActiveTab('Dashboard') }, [navTabs, activeTab])
  const missionStatus = computeMissionStatus(feed)
  const recentErrors = systemExecs.filter((e) => e.status === 'error').length
  const successes = systemExecs.filter((e) => e.status === 'success').length
  const successRate = systemExecs.length > 0 ? Math.round((successes / systemExecs.length) * 100) : 100
  const approvals = feed.filter((e) => e.requiresApproval || e.missionStatus === 'PENDING_APPROVAL').length
  const escalations = feed.filter((e) => e.escalate || e.missionStatus === 'ESCALATE').length
  const latestSignal = feed[0]
  const syncLabel = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'pending'

  return (
    <div className="cc-root" data-tab={activeTab}>
      <header className="cc-header">
        <div className="cc-title">
          <span className="cc-mark">{edition.productMark}</span>
          <span className="cc-name">{edition.productName}</span>
        </div>
        <div className="cc-meta">
          <span className="cc-pill good">Workflows Green</span>
          <span className="cc-pill">SunNi</span>
          <span className="cc-pill">Sync {syncLabel}</span>
          {loading && <span className="cc-loading"> ⟳</span>}
          {error && <span className="cc-error"> ✗ {error}</span>}
          <button className="cc-refresh" onClick={refresh} disabled={loading} title="Refresh">{loading ? '⟳ Syncing…' : 'Refresh'}</button>
        </div>
      </header>

      <nav className="cc-tabs" aria-label="Commander Console sections">
        {navTabs.map((item) => (
          <button key={item} className={item === activeTab ? 'active' : ''} onClick={() => setActiveTab(item)}>{labelFor(item, edition)}</button>
        ))}
      </nav>

      <section className="cc-brief" aria-label="Executive brief">
        <div className="brief-copy">
          <div className="brief-kicker">Executive Brief</div>
          <h1>{edition.tagline}</h1>
          <p>
            HORHANiS is the anchor for workflows, PMI portfolio visibility, and agent communication.
            The console should brief SunNi before it asks for a command.
          </p>
        </div>
        <div className="brief-signal">
          <span className={`brief-state ${missionStatus.toLowerCase()}`}>{missionStatus}</span>
          <strong>{latestSignal?.summary || 'No urgent signal in the current feed.'}</strong>
          <span>{latestSignal ? `${latestSignal.agentName} · ${latestSignal.workflowName}` : 'HORHANiS standing by'}</span>
        </div>
      </section>

      <section className={`sunni-pulse mode-${pulseMode}`} aria-label="SunNi pulse">
        <div className="pulse-glyph" aria-hidden="true">
          <span className="orbit-wave orbit-one" />
          <span className="orbit-wave orbit-two" />
          <span className="orbit-wave orbit-three" />
          <span className="electron-orbit orbit-a"><span /></span>
          <span className="electron-orbit orbit-b"><span /></span>
          <span className="electron-orbit orbit-c"><span /></span>
          <span className="sun-core" />
          <span className="sun-eye" />
          <span className="bird-wing left" />
          <span className="bird-wing right" />
        </div>
        <div className="pulse-copy">
          <span className="pulse-label">SUN-EYE-BiRD-PULSE%---&gt;</span>
          <strong>
            {pulseMode === 'running' && 'Execution running'}
            {pulseMode === 'publish' && 'Publish signal locked'}
            {pulseMode === 'ready' && 'SunNi signal active'}
          </strong>
        </div>
        <div className="pulse-line" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="cc-kpis" aria-label="Operating indicators">
        <div className="kpi-card critical">
          <span>Critical Queue</span>
          <strong>{escalations}</strong>
          <small>{escalations > 0 ? 'Needs action' : 'Clear'}</small>
        </div>
        <div className="kpi-card approval">
          <span>Approvals</span>
          <strong>{approvals}</strong>
          <small>{approvals > 0 ? 'Awaiting SunNi' : 'None pending'}</small>
        </div>
        <div className="kpi-card">
          <span>Workflow Health</span>
          <strong>{successRate}%</strong>
          <small>{recentErrors} recent errors</small>
        </div>
        <div className="kpi-card">
          <span>Dispatch Events</span>
          <strong>{feed.length}</strong>
          <small>Console intake feed</small>
        </div>
      </section>

      <div className="cc-grid">
        {activeTab === 'Dashboard' && <>
          <div className="cc-main-stack">
            <ThePulse feed={feed} systemExecs={systemExecs} lastUpdated={lastUpdated} />
            <TheFlow feed={feed} systemExecs={systemExecs} />
          </div>
          <div className="cc-side-stack">
            <TheCouncil feed={feed} />
            <TheArchives feed={feed} />
          </div>
        </>}
        {activeTab === 'Execute' && <div className="cc-full-stack"><VoiceCommand onDispatchState={(s) => { if (s==='sending') setPulseMode('running'); if (s==='ok') { setPulseMode('publish'); window.setTimeout(()=>setPulseMode('ready'),4200); } if (s==='err') setPulseMode('ready'); }} onDispatched={refresh} /></div>}
        {activeTab === 'Approve' && <div className="cc-full-stack"><ApprovalQueue feed={feed} /></div>}
        {activeTab === 'Critical' && <div className="cc-full-stack"><PriorityMonitor feed={feed} /><IncidentLog feed={feed} systemExecs={systemExecs} /></div>}
        {activeTab === 'Agents' && <div className="cc-full-stack"><AgentFeed feed={feed} /></div>}
        {activeTab === 'ChatBridge' && <div className="cc-full-stack"><ChatBridge /></div>}
        {activeTab === 'Documents' && <div className="cc-full-stack"><Documents /></div>}
        {activeTab === 'PMO' && <div className="cc-full-stack"><PMODashboard active={activeTab === 'PMO'} /></div>}
        {activeTab === 'Timeline' && <div className="cc-full-stack"><MissionTimeline /></div>}
        {activeTab === 'GUARDiAN' && <div className="cc-full-stack"><GUARDiAN /></div>}
        {activeTab === 'GTM' && <div className="cc-full-stack"><GTM /></div>}
        {activeTab === 'Editions' && <div className="cc-full-stack"><Editions edition={edition} onApply={applyEdition} /></div>}
        {activeTab === 'Platform' && <div className="cc-full-stack"><Platform /></div>}
        {activeTab === 'Decisions' && <div className="cc-full-stack"><DecisionLayer /></div>}
        {activeTab === 'Fabric' && <div className="cc-full-stack"><ExecutionFabric /></div>}
        {activeTab === 'Outcomes' && <div className="cc-full-stack"><Outcomes /></div>}
        {activeTab === 'Projects' && <div className="cc-full-stack"><Projects /></div>}
        {activeTab === 'Tasks' && <div className="cc-full-stack"><Tasks /></div>}
        {activeTab === 'Connectors' && <div className="cc-full-stack"><Connectors /></div>}
        {activeTab === 'Inbox' && (
          <div className="cc-full-stack cc-stub">
            <div className="stub-label">Inbox</div>
            <div className="stub-sub">Coming online — Inbox module in development.</div>
          </div>
        )}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="cc-voice">
          <VoiceCommand
            onDispatchState={(state) => {
              if (state === 'sending') setPulseMode('running')
              if (state === 'ok') {
                setPulseMode('publish')
                window.setTimeout(() => setPulseMode('ready'), 4200)
              }
              if (state === 'err') setPulseMode('ready')
            }}
            onDispatched={refresh}
          />
        </div>
      )}
    </div>
  )
}
