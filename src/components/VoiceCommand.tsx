import { useState, useRef, useCallback, useEffect } from 'react'
import { dispatch } from '../api/n8n'

type SpeechRecognitionConstructor = new () => SpeechRecognition

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
}

const MISSION_COLOR: Record<string, string> = {
  ESCALATE: '#ef4444', PENDING_APPROVAL: '#f59e0b', LOGGED: '#22c55e',
}

function DispatchResponse({ res }: { res: Record<string, unknown> }) {
  const keys = Object.keys(res)
  const isEmpty = keys.length === 0

  const missionStatus = res.missionStatus as string | undefined
  const assignedAgent = res.assignedAgent as string | undefined
  const routeKey = res.routeKey as string | undefined
  const summary = (res.summary ?? res.normalizedCommand ?? res.response) as string | undefined
  const status = res.status as string | undefined

  const known = ['missionStatus', 'assignedAgent', 'routeKey', 'summary', 'normalizedCommand', 'response', 'status']
  const extras = keys.filter((k) => !known.includes(k))

  return (
    <div className="dispatch-response">
      <div className="dr-header">
        <span className="dr-label">▸ HORHANIS RESPONSE</span>
        {missionStatus && (
          <span className="dr-badge" style={{ color: MISSION_COLOR[missionStatus] ?? '#6b7280', borderColor: MISSION_COLOR[missionStatus] ?? '#6b7280' }}>
            {missionStatus}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="dr-empty">Response received — no body (configure Respond to Webhook node)</div>
      ) : (
        <div className="dr-body">
          {summary && (
            <div className="dr-row dr-summary">
              <span className="dr-val">{summary}</span>
            </div>
          )}
          <div className="dr-fields">
            {assignedAgent && <div className="dr-field"><span className="dr-key">Agent</span><span className="dr-val">{assignedAgent}</span></div>}
            {routeKey && <div className="dr-field"><span className="dr-key">Route</span><span className="dr-val">{routeKey}</span></div>}
            {status && <div className="dr-field"><span className="dr-key">Status</span><span className="dr-val">{status}</span></div>}
            {extras.map((k) => (
              <div key={k} className="dr-field">
                <span className="dr-key">{k}</span>
                <span className="dr-val">{String(res[k])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface VoiceCommandProps {
  onDispatched?: () => void
  onDispatchState?: (state: 'sending' | 'ok' | 'err') => void
}

export function VoiceCommand({ onDispatched, onDispatchState }: VoiceCommandProps) {
  const [command, setCommand] = useState('')
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition
  const hasVoice = !!SpeechRec

  const startListening = useCallback(() => {
    if (!hasVoice || listening) return
    const rec = new SpeechRec()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      const text = e.results[0][0].transcript
      setCommand(text)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [hasVoice, listening, SpeechRec])

  const sendCommand = useCallback(async () => {
    if (!command.trim()) return
    setStatus('sending')
    onDispatchState?.('sending')
    try {
      const res = await dispatch(command.trim()) as Record<string, unknown>
      setLastResponse(res ?? {})
      setStatus('ok')
      onDispatchState?.('ok')
      setCommand('')
      onDispatched?.()
    } catch {
      setStatus('err')
      onDispatchState?.('err')
      setLastResponse({ status: 'error', summary: 'Dispatch failed' })
    }
  }, [command, onDispatched, onDispatchState])

  useEffect(() => {
    if (status === 'ok' || status === 'err') {
      const t = setTimeout(() => setStatus('idle'), 4000)
      return () => clearTimeout(t)
    }
  }, [status])

  const statusLabel = {
    idle: '', sending: '⟳ DISPATCHING...', ok: '✓ SENT', err: '✗ FAILED',
  }[status]

  return (
    <div className="panel voice-command">
      <div className="panel-header">
        <span className="label">🎙 SPEAK TO HORHANIS</span>
        {status !== 'idle' && (
          <span className={`dispatch-status ${status}`}>{statusLabel}</span>
        )}
      </div>
      <div className="voice-body">
        <div className="voice-input-row">
          {hasVoice && (
            <button
              className={`btn-mic ${listening ? 'active' : ''}`}
              onClick={startListening}
              title="Voice input"
            >
              {listening ? '⏹' : '🎙'}
            </button>
          )}
          <input
            className="voice-input"
            type="text"
            placeholder="Enter command or speak..."
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
          />
          <button
            className="btn-dispatch"
            onClick={sendCommand}
            disabled={!command.trim() || status === 'sending'}
          >
            DISPATCH
          </button>
        </div>
        {lastResponse && <DispatchResponse res={lastResponse} />}
      </div>
    </div>
  )
}
