import { useState } from 'react'
import { CONNECTORS, triggerConnector, type Connector } from '../api/notion'

type TriggerState = 'idle' | 'loading' | 'ok' | 'err'

const CATEGORY_LABEL: Record<Connector['category'], string> = {
  intelligence: '🧠 Intelligence',
  leasing: '🏢 Leasing (LIE)',
  revenue: '💰 Revenue',
  content: '🎨 Content',
  system: '⚙️ System',
}

const CATEGORY_ORDER: Connector['category'][] = ['intelligence', 'leasing', 'revenue', 'content', 'system']

interface TriggerModalProps {
  connector: Connector
  onClose: () => void
  onTrigger: (payload: Record<string, unknown>) => Promise<void>
}

function TriggerModal({ connector, onClose, onTrigger }: TriggerModalProps) {
  const [payload, setPayload] = useState('{}')
  const [state, setState] = useState<TriggerState>('idle')
  const [result, setResult] = useState<string | null>(null)

  async function fire() {
    let parsed: Record<string, unknown> = {}
    try { parsed = JSON.parse(payload) } catch { setResult('Invalid JSON payload'); return }
    setState('loading')
    try {
      await onTrigger(parsed)
      setState('ok')
      setResult('Triggered successfully')
    } catch (e) {
      setState('err')
      setResult(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{connector.name}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">{connector.description}</p>
        <div className="modal-endpoint">
          <span className="method-badge">{connector.method}</span>
          <code>{connector.webhook.replace('https://sunnicommandcenter.app.n8n.cloud', '')}</code>
        </div>
        <label className="modal-label">Payload (JSON)</label>
        <textarea
          className="modal-payload"
          value={payload}
          onChange={e => setPayload(e.target.value)}
          rows={4}
          spellCheck={false}
        />
        {result && <div className={`modal-result ${state}`}>{result}</div>}
        <div className="modal-actions">
          <button className="btn-gold" onClick={fire} disabled={state === 'loading'}>
            {state === 'loading' ? 'Triggering…' : 'Trigger'}
          </button>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function Connectors() {
  const [states, setStates] = useState<Record<string, TriggerState>>({})
  const [modal, setModal] = useState<Connector | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  async function quickTrigger(connector: Connector) {
    setStates(s => ({ ...s, [connector.id]: 'loading' }))
    try {
      const res = await triggerConnector(connector)
      setStates(s => ({ ...s, [connector.id]: 'ok' }))
      setResults(r => ({ ...r, [connector.id]: JSON.stringify(res).slice(0, 120) }))
      setTimeout(() => setStates(s => ({ ...s, [connector.id]: 'idle' })), 3000)
    } catch (e) {
      setStates(s => ({ ...s, [connector.id]: 'err' }))
      setResults(r => ({ ...r, [connector.id]: e instanceof Error ? e.message : 'Error' }))
      setTimeout(() => setStates(s => ({ ...s, [connector.id]: 'idle' })), 4000)
    }
  }

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = CONNECTORS.filter(c => c.category === cat)
    return acc
  }, {} as Record<string, Connector[]>)

  return (
    <div className="connectors-root">
      {modal && (
        <TriggerModal
          connector={modal}
          onClose={() => setModal(null)}
          onTrigger={async (payload) => {
            const res = await triggerConnector(modal, payload)
            setResults(r => ({ ...r, [modal.id]: JSON.stringify(res).slice(0, 120) }))
          }}
        />
      )}

      {CATEGORY_ORDER.map(cat => grouped[cat].length > 0 && (
        <div key={cat} className="connector-group">
          <div className="connector-group-label">{CATEGORY_LABEL[cat]}</div>
          <div className="connector-cards">
            {grouped[cat].map(conn => {
              const st = states[conn.id] || 'idle'
              return (
                <div key={conn.id} className={`connector-card st-${st}`}>
                  <div className="connector-info">
                    <span className="connector-name">{conn.name}</span>
                    <span className="connector-desc">{conn.description}</span>
                    {results[conn.id] && st !== 'idle' && (
                      <span className="connector-result">{results[conn.id]}</span>
                    )}
                  </div>
                  <div className="connector-actions">
                    <button className="btn-ghost sm" onClick={() => setModal(conn)} title="Configure & trigger">
                      Configure
                    </button>
                    <button
                      className={`btn-trigger ${st}`}
                      onClick={() => quickTrigger(conn)}
                      disabled={st === 'loading'}
                      title="Quick trigger with empty payload"
                    >
                      {st === 'loading' ? '⟳' : st === 'ok' ? '✓' : st === 'err' ? '✗' : '▶'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
