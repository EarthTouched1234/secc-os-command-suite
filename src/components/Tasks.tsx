import { useState } from 'react'

interface Task {
  id: string
  title: string
  project: string
  status: 'new' | 'in_progress' | 'blocked' | 'done'
  priority: 'high' | 'medium' | 'low'
  agent: string
  dueDate: string
  notes: string
  createdAt: string
}

const AGENTS = [
  { key: 'unassigned', label: '— Unassigned —', color: '#555' },
  { key: 'HORHANiS', label: 'HORHANiS', color: '#f5c518' },
  { key: 'TRiO',     label: 'TRiO',     color: '#62a8ff' },
  { key: 'TiTO',     label: 'TiTO',     color: '#bf5af2' },
  { key: 'CiRO',     label: 'CiRO',     color: '#32d2f2' },
  { key: 'SunNi',    label: 'SunNi',    color: '#ffd60a' },
  { key: 'GUARDiAN', label: 'GUARDiAN', color: '#ff453a' },
]
const AGENT_COLOR = Object.fromEntries(AGENTS.map(a => [a.key, a.color]))

const STORAGE_KEY = 'secc_tasks'

function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveTasks(tasks: Task[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }
function newId() { return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

const STATUS_LABEL: Record<Task['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
}
const STATUS_COLOR: Record<Task['status'], string> = {
  new: '#62a8ff',
  in_progress: '#f4c95d',
  blocked: '#ff4d4f',
  done: '#30d158',
}
const PRIORITY_COLOR: Record<Task['priority'], string> = {
  high: '#ff4d4f',
  medium: '#ffb020',
  low: '#62a8ff',
}

function dueDateLabel(dueDate: string): { label: string; color: string } | null {
  if (!dueDate) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0)  return { label: `Overdue (${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`, color: '#ff453a' }
  if (diff === 0) return { label: 'Due Today', color: '#ffd60a' }
  if (diff === 1) return { label: 'Due Tomorrow', color: '#ffb020' }
  if (diff <= 7)  return { label: `Due ${due.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, color: '#62a8ff' }
  return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: '#555' }
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ title: '', project: '', status: 'new' as Task['status'], priority: 'medium' as Task['priority'], agent: 'unassigned', dueDate: '', notes: '' })
  const [filter, setFilter] = useState<'all' | Task['status']>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')

  function save(updated: Task[]) { setTasks(updated); saveTasks(updated) }

  function addTask() {
    if (!draft.title.trim()) return
    const task: Task = { id: newId(), ...draft, createdAt: new Date().toISOString() }
    save([task, ...tasks])
    setDraft({ title: '', project: '', status: 'new', priority: 'medium', agent: 'unassigned', dueDate: '', notes: '' })
    setAdding(false)
  }

  function updateAgent(id: string, agent: string) {
    save(tasks.map(t => t.id === id ? { ...t, agent } : t))
  }

  function updateStatus(id: string, status: Task['status']) {
    save(tasks.map(t => t.id === id ? { ...t, status } : t))
  }

  function deleteTask(id: string) { save(tasks.filter(t => t.id !== id)) }

  const visible = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => agentFilter === 'all' || (t.agent || 'unassigned') === agentFilter)
    .sort((a, b) => {
      const today = new Date().toISOString().slice(0, 10)
      const aOverdue = a.dueDate && a.dueDate < today && a.status !== 'done' ? -1 : 0
      const bOverdue = b.dueDate && b.dueDate < today && b.status !== 'done' ? -1 : 0
      if (aOverdue !== bOverdue) return aOverdue - bOverdue
      const pri = { high: 0, medium: 1, low: 2 }
      if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority]
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })

  const counts = {
    all: tasks.length,
    new: tasks.filter(t => t.status === 'new').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="tasks-root">
      <div className="tasks-header">
        <div className="filter-group">
          {(['all', 'new', 'in_progress', 'blocked', 'done'] as const).map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? `All (${counts.all})` : f === 'in_progress' ? `In Progress (${counts.in_progress})` : `${STATUS_LABEL[f as Task['status']]} (${counts[f as Task['status']]})`}
            </button>
          ))}
        </div>
        <button className="btn-gold" onClick={() => setAdding(true)}>+ Task</button>
      </div>
      <div className="filter-group" style={{ marginBottom: 8 }}>
        <button
          className={`filter-btn ${agentFilter === 'all' ? 'active' : ''}`}
          onClick={() => setAgentFilter('all')}
        >All Agents</button>
        {AGENTS.filter(a => a.key !== 'unassigned').map(a => (
          <button
            key={a.key}
            className={`filter-btn ${agentFilter === a.key ? 'active' : ''}`}
            style={agentFilter === a.key ? { borderColor: a.color, color: a.color } : {}}
            onClick={() => setAgentFilter(agentFilter === a.key ? 'all' : a.key)}
          >{a.label}</button>
        ))}
      </div>

      {adding && (
        <div className="task-add-form">
          <input className="task-input" placeholder="Task title…" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} autoFocus />
          <input className="task-input" placeholder="Project (optional)…" value={draft.project} onChange={e => setDraft(d => ({ ...d, project: e.target.value }))} />
          <div className="task-form-row">
            <select className="task-select" value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Task['priority'] }))}>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            <select className="task-select" value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as Task['status'] }))}>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
          <select
            className="task-select"
            value={draft.agent}
            style={{ color: AGENT_COLOR[draft.agent] || '#555', width: '100%' }}
            onChange={e => setDraft(d => ({ ...d, agent: e.target.value }))}
          >
            {AGENTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <div className="task-form-row" style={{ alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>Due date</label>
            <input
              type="date"
              className="task-input"
              value={draft.dueDate}
              style={{ flex: 1, colorScheme: 'dark' }}
              onChange={e => setDraft(d => ({ ...d, dueDate: e.target.value }))}
            />
          </div>
          <textarea className="task-notes" placeholder="Notes (optional)…" value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} rows={2} />
          <div className="task-form-actions">
            <button className="btn-gold" onClick={addTask}>Add Task</button>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="task-list">
        {visible.length === 0 && <div className="empty-state">No tasks{filter !== 'all' ? ` with status "${STATUS_LABEL[filter as Task['status']]}"` : ''}.</div>}
        {visible.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-card-left">
              <span className="task-priority-dot" style={{ background: PRIORITY_COLOR[task.priority] }} title={task.priority} />
              <div className="task-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="task-title">{task.title}</span>
                  {task.agent && task.agent !== 'unassigned' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: AGENT_COLOR[task.agent] || '#888', padding: '1px 6px', borderRadius: 3, border: `1px solid ${AGENT_COLOR[task.agent] || '#333'}`, background: '#0d0d0d', whiteSpace: 'nowrap' }}>
                      {task.agent}
                    </span>
                  )}
                </div>
                {task.project && <span className="task-project">{task.project}</span>}
                {(() => { const d = dueDateLabel(task.dueDate); return d ? <span style={{ fontSize: 10, color: d.color, marginTop: 2 }}>⏱ {d.label}</span> : null })()}
                {task.notes && <span className="task-notes-preview">{task.notes}</span>}
              </div>
            </div>
            <div className="task-card-right">
              <select
                className="task-status-select"
                value={task.agent || 'unassigned'}
                style={{ color: AGENT_COLOR[task.agent || 'unassigned'] || '#555', maxWidth: 90 }}
                onChange={e => updateAgent(task.id, e.target.value)}
              >
                {AGENTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
              <select
                className="task-status-select"
                value={task.status}
                style={{ color: STATUS_COLOR[task.status] }}
                onChange={e => updateStatus(task.id, e.target.value as Task['status'])}
              >
                {(Object.keys(STATUS_LABEL) as Task['status'][]).map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
              <button className="btn-icon" onClick={() => deleteTask(task.id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
