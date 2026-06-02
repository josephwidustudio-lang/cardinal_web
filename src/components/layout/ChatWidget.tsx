'use client'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }
type Mode = 'hero' | 'floating'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const GREETING = 'Hola, soy Cardinal. ¿En qué te puedo ayudar?'

interface Props {
  mode?: Mode
  alwaysShow?: boolean
}

export default function ChatWidget({ mode = 'floating', alwaysShow = false }: Props) {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: GREETING }
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Detectar scroll para mostrar el botón flotante
  useEffect(() => {
    if (mode !== 'floating') return
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [mode])

  // Cerrar chat hero al hacer click fuera
  useEffect(() => {
    if (mode !== 'hero') return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mode])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setOpen(true) // abrir el chat al enviar
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Lo siento, ocurrió un error.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, no pude procesar tu consulta. Contactanos por WhatsApp.' }])
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // ── HERO MODE ──────────────────────────────────────────────────────────────
  if (mode === 'hero') {
    return (
      <div ref={containerRef} style={{
        width: '100%', maxWidth: '520px', margin: '0 auto',
        fontFamily: 'Panton, system-ui, sans-serif',
      }}>
        {/* Mensajes — solo visibles cuando open=true */}
        {open && (
          <div style={{
            background: 'rgba(10,45,56,0.7)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(206,162,121,0.2)',
            borderBottom: 'none',
            padding: '1rem 1.2rem',
            display: 'flex', flexDirection: 'column', gap: '0.7rem',
            maxHeight: '220px', overflowY: 'auto',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '0.6rem 0.9rem',
                  fontSize: '0.82rem', lineHeight: 1.6,
                  background: m.role === 'user' ? '#CEA279' : 'rgba(206,162,121,0.12)',
                  color: m.role === 'user' ? '#0A2D38' : '#F5F0EA',
                  border: m.role === 'assistant' ? '1px solid rgba(206,162,121,0.15)' : 'none',
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(206,162,121,0.12)', border: '1px solid rgba(206,162,121,0.15)', color: '#CEA279', fontSize: '1rem', letterSpacing: '0.3em', alignSelf: 'flex-start' }}>···</div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input box — siempre visible */}
        <div style={{
          display: 'flex',
          background: 'rgba(10,45,56,0.6)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(206,162,121,0.25)',
        }}>
          <input
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Hola, soy Cardinal. ¿En qué te puedo ayudar?"
            disabled={loading}
            style={{
              flex: 1, background: 'transparent',
              border: 'none', color: '#F5F0EA',
              fontSize: '0.85rem', padding: '1rem 1.2rem',
              outline: 'none', fontFamily: 'Panton, system-ui, sans-serif',
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
            background: input.trim() && !loading ? '#CEA279' : 'transparent',
            border: 'none', borderLeft: '1px solid rgba(206,162,121,0.2)',
            color: input.trim() && !loading ? '#0A2D38' : 'rgba(206,162,121,0.4)',
            padding: '1rem 1.4rem', cursor: input.trim() && !loading ? 'pointer' : 'default',
            fontSize: '1.1rem', transition: 'all 0.2s', flexShrink: 0,
          }}>→</button>
        </div>
      </div>
    )
  }

  // ── FLOATING MODE ──────────────────────────────────────────────────────────
  if (!scrolled && mode === 'floating' && !alwaysShow) return null

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 300,
          width: '340px', maxHeight: '480px',
          background: '#0D3542', border: '1px solid rgba(206,162,121,0.2)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          fontFamily: 'Panton, system-ui, sans-serif',
        }}>
          <div style={{ padding: '1rem 1.2rem', background: '#0A2D38', borderBottom: '1px solid rgba(206,162,121,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#CEA279', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={LOGO} alt="Cardinal" style={{ width: '20px', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 500, color: '#F5F0EA', lineHeight: 1 }}>Asesor Cardinal</p>
                <p style={{ fontSize: '0.6rem', color: '#5BC47A', marginTop: '0.2rem' }}>● En línea</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#7A9BA8', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '0.7rem 0.9rem',
                  fontSize: '0.78rem', lineHeight: 1.6,
                  background: m.role === 'user' ? '#CEA279' : 'rgba(206,162,121,0.08)',
                  color: m.role === 'user' ? '#0A2D38' : '#F5F0EA',
                  border: m.role === 'assistant' ? '1px solid rgba(206,162,121,0.15)' : 'none',
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.7rem 1rem', background: 'rgba(206,162,121,0.08)', border: '1px solid rgba(206,162,121,0.15)', color: '#CEA279', fontSize: '0.9rem', letterSpacing: '0.2em' }}>···</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '0.8rem', borderTop: '1px solid rgba(206,162,121,0.15)', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Escribí tu consulta..."
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(206,162,121,0.2)',
                color: '#F5F0EA', fontSize: '0.78rem', padding: '0.6rem 0.8rem',
                outline: 'none', fontFamily: 'Panton, system-ui, sans-serif',
              }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              background: input.trim() && !loading ? '#CEA279' : 'rgba(206,162,121,0.2)',
              border: 'none', color: input.trim() && !loading ? '#0A2D38' : '#7A9BA8',
              padding: '0.6rem 0.9rem', cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: '0.9rem', transition: 'all 0.2s',
            }}>→</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 300,
        width: '56px', height: '56px',
        background: open ? '#0D3542' : '#CEA279',
        border: open ? '1px solid rgba(206,162,121,0.3)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
      }}>
        {open
          ? <span style={{ color: '#CEA279', fontSize: '1.2rem' }}>✕</span>
          : <img src={LOGO} alt="Chat" style={{ width: '28px', filter: 'brightness(0) invert(1)' }} />
        }
      </button>
    </>
  )
}
