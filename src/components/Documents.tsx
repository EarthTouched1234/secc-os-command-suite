import { useState, useEffect } from 'react'

interface Doc {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

const STORAGE_KEY = 'secc_documents'

function loadDocs(): Doc[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveDocs(docs: Doc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}
function newId() { return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export function Documents() {
  const [docs, setDocs] = useState<Doc[]>(loadDocs)
  const [active, setActive] = useState<Doc | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '', tags: '' })
  const [search, setSearch] = useState('')

  useEffect(() => { saveDocs(docs) }, [docs])

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.body.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  function startNew() {
    setDraft({ title: '', body: '', tags: '' })
    setActive(null)
    setEditing(true)
  }

  function startEdit(doc: Doc) {
    setDraft({ title: doc.title, body: doc.body, tags: doc.tags.join(', ') })
    setActive(doc)
    setEditing(true)
  }

  function saveDoc() {
    if (!draft.title.trim()) return
    const tags = draft.tags.split(',').map(t => t.trim()).filter(Boolean)
    const now = new Date().toISOString()
    if (active) {
      const updated = docs.map(d =>
        d.id === active.id ? { ...d, title: draft.title, body: draft.body, tags, updatedAt: now } : d
      )
      setDocs(updated)
      setActive({ ...active, title: draft.title, body: draft.body, tags, updatedAt: now })
    } else {
      const doc: Doc = { id: newId(), title: draft.title, body: draft.body, tags, createdAt: now, updatedAt: now }
      setDocs([doc, ...docs])
      setActive(doc)
    }
    setEditing(false)
  }

  function deleteDoc(id: string) {
    setDocs(docs.filter(d => d.id !== id))
    if (active?.id === id) { setActive(null); setEditing(false) }
  }

  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <div className="sidebar-header">
          <input
            className="search-input"
            placeholder="Search docs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn-gold" onClick={startNew}>+ New</button>
        </div>
        <div className="doc-list">
          {filtered.length === 0 && <div className="empty-state">No documents yet.<br/>Click + New to start.</div>}
          {filtered.map(doc => (
            <button
              key={doc.id}
              className={`doc-item ${active?.id === doc.id ? 'active' : ''}`}
              onClick={() => { setActive(doc); setEditing(false) }}
            >
              <span className="doc-title">{doc.title}</span>
              <span className="doc-meta">{new Date(doc.updatedAt).toLocaleDateString()}</span>
              {doc.tags.length > 0 && (
                <div className="doc-tags">
                  {doc.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      <main className="tab-main">
        {editing ? (
          <div className="doc-editor">
            <input
              className="doc-title-input"
              placeholder="Document title…"
              value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              autoFocus
            />
            <input
              className="doc-tags-input"
              placeholder="Tags (comma-separated)…"
              value={draft.tags}
              onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))}
            />
            <textarea
              className="doc-body-input"
              placeholder="Write your document here…"
              value={draft.body}
              onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
            />
            <div className="editor-actions">
              <button className="btn-gold" onClick={saveDoc}>Save</button>
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              {active && <button className="btn-danger" onClick={() => deleteDoc(active.id)}>Delete</button>}
            </div>
          </div>
        ) : active ? (
          <div className="doc-view">
            <div className="doc-view-header">
              <h2>{active.title}</h2>
              <div className="doc-view-meta">
                <span>Updated {new Date(active.updatedAt).toLocaleString()}</span>
                {active.tags.map(t => <span key={t} className="tag">{t}</span>)}
                <button className="btn-ghost" onClick={() => startEdit(active)}>Edit</button>
                <button className="btn-danger" onClick={() => deleteDoc(active.id)}>Delete</button>
              </div>
            </div>
            <pre className="doc-body">{active.body || <em>Empty document.</em>}</pre>
          </div>
        ) : (
          <div className="empty-main">
            <div className="empty-icon">📄</div>
            <p>Select a document or create a new one.</p>
            <button className="btn-gold" onClick={startNew}>+ New Document</button>
          </div>
        )}
      </main>
    </div>
  )
}
