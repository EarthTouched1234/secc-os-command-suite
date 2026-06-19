import { useState, useRef, useEffect, useCallback } from 'react'
import { chat, dispatch } from '../api/n8n'

// ── Context OS ────────────────────────────────────────────
type ContextKey = 'WORK' | 'SCHOOL' | 'COMMAND' | 'CONTENT' | 'LIFE'
type ActionLevel = 'conversation' | 'guidance' | 'dispatch' | 'governance'
type CouncilMember = 'HORHANiS' | 'TiTo' | 'TRiO' | 'CiRO' | 'SunNi'

interface ContextDef {
  emoji: string
  color: string
  tools: string[]
  council: CouncilMember[]
  defaultAction: ActionLevel
  primaryRoute: string
  detectPatterns: RegExp
}

const CONTEXTS: Record<ContextKey, ContextDef> = {
  WORK: {
    emoji: '👔',
    color: '#62a8ff',
    tools: ['Gmail', 'Outlook', 'LinkedIn', 'Slack', 'CRM IQ', 'Yardi', 'Spark'],
    council: ['HORHANiS', 'TiTo', 'TRiO'],
    defaultAction: 'guidance',
    primaryRoute: 'tito_strategy',
    detectPatterns: /\b(email|outlook|gmail|slack|client|meeting|proposal|follow.?up|crm|yardi|linkedin.*message|boss|cowork|colleague|job|professional|hr|resume|offer|salary|negotiate)\b/i,
  },
  SCHOOL: {
    emoji: '🎓',
    color: '#b58cff',
    tools: ['Chrome', 'Edge', 'ChatGPT', 'Notion', 'Google Drive', 'Research Library'],
    council: ['CiRO', 'TRiO', 'SunNi'],
    defaultAction: 'conversation',
    primaryRoute: 'ciro_integration',
    detectPatterns: /\b(study|learn|research|chrome|edge|class|course|google drive|reference|explain|what is|how does|definition|textbook|assignment|lecture)\b/i,
  },
  COMMAND: {
    emoji: '⚙️',
    color: '#f4c95d',
    tools: ['n8n', 'GitHub', 'Notion', 'Console', 'Golden Ledger', 'Dispatch Intake'],
    council: ['HORHANiS', 'CiRO', 'TiTo'],
    defaultAction: 'dispatch',
    primaryRoute: 'ciro_integration',
    detectPatterns: /\b(n8n|webhook|workflow|github|deploy|api|code|debug|build|console|ledger|cloudflare|node|automation|integration|trigger|cron|notion.*db)\b/i,
  },
  CONTENT: {
    emoji: '🎨',
    color: '#34d399',
    tools: ['LinkedIn', 'ChatGPT', 'Canva', 'BRIDGE Library'],
    council: ['SunNi', 'CiRO'],
    defaultAction: 'guidance',
    primaryRoute: 'tito_strategy',
    detectPatterns: /\b(write|draft|post|content|canva|publish|bridge|caption|social media|linkedin.*post|instagram|twitter|blog|newsletter|copy|creative)\b/i,
  },
  LIFE: {
    emoji: '🏠',
    color: '#ff6b6b',
    tools: ['Housing', 'Bills', 'Health', 'Probation', 'Appointments', 'Finances'],
    council: ['HORHANiS', 'TRiO', 'SunNi'],
    defaultAction: 'dispatch',
    primaryRoute: 'horhanis_direct',
    detectPatterns: /\b(housing|rent|eviction|bill|utilit|health|doctor|probation|appointment|georgia power|afford|debt|income|insurance|court|legal|eeoc|pay|money|anxiety|stress|overwhelm|scared|hurt|lonely|tired|emotional|feel)\b/i,
  },
}

const COUNCIL_COLORS: Record<CouncilMember, string> = {
  HORHANiS: '#f4c95d',
  TiTo:     '#34d399',
  TRiO:     '#7dd3fc',
  CiRO:     '#62a8ff',
  SunNi:    '#b58cff',
}

const COUNCIL_INITIALS: Record<CouncilMember, string> = {
  HORHANiS: 'H',
  TiTo:     'Ti',
  TRiO:     'TR',
  CiRO:     'Ci',
  SunNi:    'Su',
}

const ACTION_COLORS: Record<ActionLevel, string> = {
  conversation: 'var(--blue)',
  guidance:     'var(--gold)',
  dispatch:     'var(--amber)',
  governance:   'var(--red)',
}

const ACTION_LEVELS: ActionLevel[] = ['conversation', 'guidance', 'dispatch', 'governance']

const CONTEXT_TO_AGENT: Record<ContextKey, string> = {
  LIFE:    'HORHANiS',
  WORK:    'HORHANiS',
  COMMAND: 'CiRO',
  SCHOOL:  'CiRO',
  CONTENT: 'TiTO',
}

// ── Helpers ────────────────────────────────────────────────
interface Message {
  role: 'user' | 'horhanis' | 'system'
  text: string
  ts: string
  turn?: number
  routeKey?: string
  context?: ContextKey
  council?: CouncilMember[]
}

interface DispatchResult {
  response?: string
  reply?: string
  message?: string
  routeKey?: string
  assignedAgent?: string
  signalSummary?: string
  patternNote?: string
  context?: ContextKey
  council?: string[]
  properties?: Record<string, { rich_text?: { plain_text: string }[] }>
  [key: string]: unknown
}

function sessionId() {
  const now = new Date()
  return `cc-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
}

function detectContextFromText(text: string): ContextKey | null {
  if (!text.trim()) return null
  // COMMAND first — most specific keywords
  if (CONTEXTS.COMMAND.detectPatterns.test(text)) return 'COMMAND'
  if (CONTEXTS.CONTENT.detectPatterns.test(text)) return 'CONTENT'
  if (CONTEXTS.WORK.detectPatterns.test(text))    return 'WORK'
  if (CONTEXTS.LIFE.detectPatterns.test(text))    return 'LIFE'
  if (CONTEXTS.SCHOOL.detectPatterns.test(text))  return 'SCHOOL'
  return null
}

function extractDispatchText(raw: DispatchResult): string {
  if (raw.response)      return raw.response
  if (raw.reply)         return raw.reply
  if (raw.message)       return raw.message
  if (raw.signalSummary) return raw.signalSummary
  if (raw.patternNote) {
    const summary = raw.properties?.['Pattern Description']?.rich_text?.[0]?.plain_text
    return summary ? `${summary}\n\n${raw.patternNote}` : raw.patternNote
  }
  return JSON.stringify(raw, null, 2)
}

function extractRouteKey(raw: DispatchResult): string | undefined {
  if (raw.routeKey) return raw.routeKey
  return raw.properties?.['Pattern Type']?.rich_text?.[0]?.plain_text
}

function speak(text: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.92; utt.pitch = 0.88; utt.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => /Samantha|Alex|Daniel|Google UK English Male|Microsoft David/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'))
  if (preferred) utt.voice = preferred
  window.speechSynthesis.speak(utt)
}

// ── Component ──────────────────────────────────────────────
export function ChatBridge() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'system',
    text: 'SunNi Command Center online. Situational consciousness active — speak, and the system will know where you are.',
    ts: new Date().toISOString(),
  }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [activeContext, setActiveContext] = useState<ContextKey>('LIFE')
  const [suggestedContext, setSuggestedContext] = useState<ContextKey | null>(null)
  const [actionLevel, setActionLevel] = useState<ActionLevel>('dispatch')
  const [sid] = useState(sessionId)
  const [mode, setMode] = useState<'standard' | 'lite'>('standard')
  const [copied, setCopied] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function copyText(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  function saveToDoc(text: string, ts: string) {
    const STORAGE_KEY = 'secc_documents'
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const title = text.slice(0, 52).replace(/\n/g, ' ').trim() + (text.length > 52 ? '…' : '')
    const now = new Date().toISOString()
    const doc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      body: text,
      tags: ['HORHANiS', 'ChatBridge'],
      createdAt: ts || now,
      updatedAt: now,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([doc, ...existing]))
  }

  useEffect(() => {
    window.speechSynthesis?.getVoices()
    const h = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', h)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', h)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Real-time context detection as user types
  function onInputChange(text: string) {
    setInput(text)
    const detected = detectContextFromText(text)
    setSuggestedContext(detected !== activeContext ? detected : null)
  }

  function switchContext(key: ContextKey, auto = false) {
    const ctx = CONTEXTS[key]
    setActiveContext(key)
    setActionLevel(ctx.defaultAction)
    setSuggestedContext(null)
    // Only log a system message when switching TO a different context
    if (!auto && key !== activeContext) {
      setMessages(prev => [...prev, {
        role: 'system',
        text: `${ctx.emoji} Context → ${key} | ${ctx.defaultAction.toUpperCase()} | Council: ${ctx.council.join(', ')}`,
        ts: new Date().toISOString(),
        context: key,
        council: ctx.council,
      }])
    }
  }

  function cycleActionLevel() {
    const i = ACTION_LEVELS.indexOf(actionLevel)
    setActionLevel(ACTION_LEVELS[(i + 1) % ACTION_LEVELS.length])
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    setSuggestedContext(null)

    // Auto-switch to detected context if suggested
    const sendContext = suggestedContext ?? activeContext
    if (suggestedContext && suggestedContext !== activeContext) {
      setActiveContext(suggestedContext)
      setActionLevel(CONTEXTS[suggestedContext].defaultAction)
    }

    const ctx = CONTEXTS[sendContext]
    setMessages(prev => [...prev, {
      role: 'user',
      text,
      ts: new Date().toISOString(),
      context: sendContext,
    }])
    setThinking(true)
    setElapsed(0)
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000)

    try {
      if (actionLevel === 'conversation' || ctx.defaultAction === 'conversation') {
        // Unified: routes through Agent Sandbox with correct agent per context
        const res = await chat(text, sid, sendContext, mode)
        setMessages(prev => [...prev, {
          role: 'horhanis',
          text: res.reply,
          ts: new Date().toISOString(),
          turn: res.turnNumber,
          context: sendContext,
          council: ctx.council,
        }])
        if (voiceOn) speak(res.reply)
      } else {
        const raw = await dispatch(text, ctx.primaryRoute, sendContext, ctx.council, sid, mode) as DispatchResult
        const replyText = extractDispatchText(raw)

        // Read authoritative context from response if classifier detected one
        const confirmedContext: ContextKey = (raw.context as ContextKey) || sendContext
        if (confirmedContext !== sendContext) {
          setActiveContext(confirmedContext)
          setActionLevel(CONTEXTS[confirmedContext].defaultAction)
        }

        setMessages(prev => [...prev, {
          role: 'horhanis',
          text: replyText,
          ts: new Date().toISOString(),
          routeKey: extractRouteKey(raw) || ctx.primaryRoute,
          context: confirmedContext,
          council: ctx.council,
        }])
        if (voiceOn) speak(replyText)
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.message.includes('AbortError')
      const msg = isTimeout
        ? `Timeout — agent took too long (>55s). n8n may be under load. Wait 15s and retry.`
        : `Connection error — ${sendContext} unreachable. Check n8n or retry in 10s.`
      setMessages(prev => [...prev, {
        role: 'system',
        text: msg,
        ts: new Date().toISOString(),
      }])
    } finally {
      if (elapsedRef.current) clearInterval(elapsedRef.current)
      setThinking(false)
      setElapsed(0)
      inputRef.current?.focus()
    }
  }, [input, thinking, sid, voiceOn, activeContext, suggestedContext, actionLevel])

  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const ctx = CONTEXTS[activeContext]
  const displayContext = suggestedContext ?? activeContext
  const displayCtx = CONTEXTS[displayContext]

  return (
    <div className="panel chatbridge" data-context={activeContext}>
      {/* Top header */}
      <div className="panel-header">
        <span className="label">ChatBridge</span>
        <span className="cb-session">SESSION {sid}</span>
        <button
          className={`cb-voice-toggle ${voiceOn ? 'active' : ''}`}
          onClick={() => { if (voiceOn) window.speechSynthesis?.cancel(); setVoiceOn(v => !v) }}
        >
          {voiceOn ? '🔊' : '🔇'}
        </button>
        <button
          className={`cb-mode-toggle ${mode === 'lite' ? 'cb-mode-lite' : 'cb-mode-std'}`}
          onClick={() => setMode(m => m === 'standard' ? 'lite' : 'standard')}
          title={mode === 'standard' ? 'Standard mode (gpt-4.1) — click to switch to Lite (gpt-4.1-mini, 5× cheaper)' : 'Lite mode (gpt-4.1-mini) — click to switch to Standard (gpt-4.1, full power)'}
        >
          {mode === 'lite' ? '⚡ LITE' : '◈ STD'}
        </button>
        <span className={`cb-status ${thinking ? 'thinking' : 'ready'}`}>
          {thinking ? '● ROUTING' : '● READY'}
        </span>
      </div>

      {/* Context tabs */}
      <div className="ctx-tabs">
        {(Object.keys(CONTEXTS) as ContextKey[]).map(key => {
          const c = CONTEXTS[key]
          const isActive = key === activeContext
          const isSuggested = key === suggestedContext
          return (
            <button
              key={key}
              className={`ctx-tab${isActive ? ' active' : ''}${isSuggested ? ' suggested' : ''}`}
              style={isActive ? { color: c.color, borderColor: c.color + '88', background: c.color + '12' } : isSuggested ? { color: c.color, borderColor: c.color + '55', background: c.color + '08' } : undefined}
              onClick={() => switchContext(key)}
              title={`${c.emoji} ${key} — ${c.council.join(', ')}`}
            >
              <span className="ctx-tab-emoji">{c.emoji}</span>
              <span className="ctx-tab-label">{key}</span>
              {isSuggested && <span className="ctx-tab-pulse" />}
            </button>
          )
        })}
      </div>

      {/* Context strip */}
      <div className="ctx-strip" style={{ borderBottomColor: displayCtx.color + '44' }}>
        <span className="ctx-strip-name" style={{ color: displayCtx.color }}>
          {displayCtx.emoji} {displayContext}
          {suggestedContext && <span className="ctx-auto-badge">AUTO</span>}
        </span>
        <button
          className="action-level-badge"
          style={{ color: ACTION_COLORS[actionLevel], borderColor: ACTION_COLORS[actionLevel] + '66' }}
          onClick={cycleActionLevel}
          title="Click to change action level"
        >
          {actionLevel.toUpperCase()}
        </button>
        <div className="ctx-council">
          {ctx.council.map(m => (
            <span
              key={m}
              className="council-dot"
              style={{ background: COUNCIL_COLORS[m] }}
              title={m}
            >
              {COUNCIL_INITIALS[m]}
            </span>
          ))}
        </div>
        <div className="ctx-tools">
          {ctx.tools.map(t => <span key={t} className="tool-chip">{t}</span>)}
        </div>
      </div>

      {/* Message log */}
      <div className="cb-log" onClick={() => inputRef.current?.focus()}>
        {messages.map((m, i) => {
          const mc = m.context ? CONTEXTS[m.context] : null
          return (
            <div key={i} className={`cb-line cb-${m.role}${m.role === 'horhanis' && mc?.defaultAction !== 'conversation' ? ' cb-deep' : ''}`}>
              <span className="cb-ts">[{fmt(m.ts)}]</span>
              {m.role === 'user' && (
                <span className="cb-who" style={mc ? { color: mc.color } : undefined}>SunNi &gt;</span>
              )}
              {m.role === 'horhanis' && <span className="cb-who">HORHANiS{m.turn ? ` #${m.turn}` : ''} &gt;</span>}
              {m.role === 'system'   && <span className="cb-who">SYSTEM &gt;</span>}

              {m.role === 'horhanis' ? (
                <div className="cb-horhanis-body">
                  <span className="cb-text">{m.text}</span>
                  {m.routeKey && (
                    <span className="cb-route-tag" style={mc ? { color: mc.color, borderColor: mc.color+'55', background: mc.color+'11' } : undefined}>
                      {m.routeKey}
                    </span>
                  )}
                  <div className="cb-actions">
                    <button
                      className={`cb-action-btn${copied === i ? ' cb-action-copied' : ''}`}
                      onClick={e => { e.stopPropagation(); copyText(m.text, i) }}
                      title="Copy response"
                    >
                      {copied === i ? '✓ copied' : '⎘ copy'}
                    </button>
                    <button
                      className="cb-action-btn"
                      onClick={e => { e.stopPropagation(); speak(m.text) }}
                      title="Read aloud"
                    >
                      ▶ audio
                    </button>
                    <button
                      className="cb-action-btn"
                      onClick={e => { e.stopPropagation(); saveToDoc(m.text, m.ts) }}
                      title="Save to Documents"
                    >
                      ⊕ save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="cb-text">{m.text}</span>
                  {m.routeKey && (
                    <span className="cb-route-tag" style={mc ? { color: mc.color, borderColor: mc.color+'55', background: mc.color+'11' } : undefined}>
                      {m.routeKey}
                    </span>
                  )}
                </>
              )}
            </div>
          )
        })}
        {thinking && (
          <div className="cb-line cb-horhanis cb-thinking">
            <span className="cb-ts">[{fmt(new Date().toISOString())}]</span>
            <span className="cb-who">
              {CONTEXT_TO_AGENT[activeContext]?.toUpperCase() || 'HORHANiS'} &gt;
            </span>
            <span className="cb-text cb-blink">█</span>
            <span className="cb-route-tag" style={{ color: ctx.color, borderColor: ctx.color+'55' }}>
              {displayContext} · {mode === 'lite' ? 'mini' : '4.1'} · {elapsed}s{elapsed >= 15 ? ' — auto-retry if needed' : ''}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="cb-input-row" style={{ borderTopColor: displayCtx.color + '55', background: displayCtx.color + '06' }}>
        <span className="cb-prompt" style={{ color: displayCtx.color }}>SunNi &gt;</span>
        <input
          ref={inputRef}
          className="cb-input"
          type="text"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`${displayCtx.emoji} ${displayContext} — ${actionLevel}…`}
          disabled={thinking}
          autoFocus
          style={{ caretColor: displayCtx.color }}
        />
        <button
          className="cb-send"
          onClick={send}
          disabled={!input.trim() || thinking}
          style={input.trim() && !thinking ? { borderColor: displayCtx.color+'88', color: displayCtx.color } : undefined}
        >
          SEND
        </button>
      </div>
    </div>
  )
}
