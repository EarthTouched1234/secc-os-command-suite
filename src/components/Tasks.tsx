import { useState } from 'react'

interface Task {
  id: string
  title: string
  project: string
  status: 'new' | 'in_progress' | 'blocked' | 'done'
  priority: 'high' | 'medium' | 'low'
  notes: string
  createdAt: string
}

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

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ title: '', project: '', status: 'new' as Task['status'], priority: 'medium' as Task['priority'], notes: '' })
  const [filter, setFilter] = useState<'all' | Task['status']>('all')

  function save(updated: Task[]) { setTasks(updated); saveTasks(updated) }

  function addTask() {
    if (!draft.title.trim()) return
    const task: Task = { id: newId(), ...draft, createdAt: new Date().toISOString() }
    save([task, ...tasks])
    setDraft({ title: '', project: '', status: 'new', priority: 'medium', notes: '' })
    setAdding(false)
  }

  function updateStatus(id: string, status: Task['status']) {
    save(tasks.map(t => t.id === id ? { ...t, status } : t))
  }

  function deleteTask(id: string) { save(tasks.filter(t => t.id !== id)) }

  const visible = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .sort((a, b) => {
      const pri = { high: 0, medium: 1, low: 2 }
      return pri[a.priority] - pri[b.priority] || b.createdAt.localeCompare(a.createdAt)
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
                <span className="task-title">{task.title}</span>
                {task.project && <span className="task-project">{task.project}</span>}
                {task.notes && <span className="task-notes-preview">{task.notes}</span>}
              </div>
            </div>
            <div className="task-card-right">
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
