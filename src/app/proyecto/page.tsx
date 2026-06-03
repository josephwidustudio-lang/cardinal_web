'use client'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ChatWidget from '@/components/layout/ChatWidget'
import { supabase } from '@/lib/supabase'
import { fetchProyectoConfig } from '@/lib/fetchProyecto'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const PISOS = [9,8,7,6,5,4,3,2,1]

function ProyectoPageInner() {
  const params = useSearchParams()
  const pisoParam = params.get('piso')
  const ladoParam = params.get('lado')

  const [piso, setPiso]               = useState<number>(pisoParam ? parseInt(pisoParam) : 9)
  const [lado, setLado]               = useState<'frente' | 'contrafrente'>(ladoParam === 'contrafrente' ? 'contrafrente' : 'frente')
  const [cfg, setCfg]                 = useState<any>(null)
  const [pisoEstados, setPisoEstados] = useState<Record<number, string>>({})
  const [allUnidades, setAllUnidades] = useState<any[]>([])
  const [animKey, setAnimKey]         = useState(0)
  const prevPiso                      = useRef(piso)

  function changePiso(p: number) {
    prevPiso.current = piso
    setPiso(p)
    setAnimKey(k => k + 1)
  }

  useEffect(() => {
    Promise.all([
      fetchProyectoConfig(),
      supabase.from('unidades').select('piso, estado, tipo, m2, dormitorios, items').then(r => r.data),
    ]).then(([cfgData, unidades]) => {
      if (cfgData) setCfg(cfgData)
      if (unidades) {
        setAllUnidades(unidades)
        const map: Record<number, string> = {}
        PISOS.forEach(p => {
          const del_piso = unidades.filter(u => u.piso === p)
          if (del_piso.length === 0) { map[p] = 'sin_unidades'; return }
          if (del_piso.some(u => u.estado === 'disponible')) map[p] = 'disponible'
          else if (del_piso.some(u => u.estado === 'reservado')) map[p] = 'reservado'
          else map[p] = 'vendido'
        })
        setPisoEstados(map)
      }
    })
  }, [])

  if (!cfg) return (
    <main style={{ background: '#0D3542', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#7A9BA8', fontSize: '0.85rem' }}>Cargando...</div>
    </main>
  )

  // Override específico del piso+lado (editado en el panel)
  const pisoOverride = cfg.pisos_override?.[String(piso)]?.[lado] ?? null

  const globalItems = lado === 'frente' ? cfg.frente_items : cfg.contrafrente_items
  const items     = pisoOverride?.items?.length > 0 ? pisoOverride.items : globalItems
  const dormi     = pisoOverride?.dormitorios ?? (lado === 'frente' ? cfg.frente_dormitorios : cfg.contrafrente_dormitorios)
  const m2        = pisoOverride?.m2 ?? (lado === 'frente' ? cfg.frente_m2 : cfg.contrafrente_m2)
  const cochera   = pisoOverride?.cochera ?? 'incluida'
  const dispLabel = pisoOverride?.disponible ?? pisoEstados[piso] ?? 'disponible'
  const axoUrl    = lado === 'frente' ? cfg.frente_axo_url : cfg.contrafrente_axo_url
  const wa        = cfg.wa_number || ''

  const cocheraLabel = cochera === 'incluida' ? 'Incluida' : cochera === 'no_incluida' ? 'No incluida' : 'Opcional'
  const dispColor    = dispLabel === 'disponible' ? '#5BC47A' : dispLabel === 'reservado' ? '#CEA279' : '#E07070'
  const dispText     = dispLabel === 'disponible' ? 'Disponible' : dispLabel === 'reservado' ? 'Reservado' : 'Vendido'

  function pisoColor(estado: string) {
    if (estado === 'disponible') return '#5BC47A'
    if (estado === 'reservado')  return '#CEA279'
    if (estado === 'vendido')    return '#E07070'
    return 'rgba(206,162,121,0.3)'
  }

  const estadoActual = pisoEstados[piso]

  return (
    <main style={{ background: '#0D3542', minHeight: '100vh', fontFamily: 'Panton, system-ui, sans-serif' }}>
      <style>{`
        @keyframes axoFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes pisoNumIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes infoSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .axo-img    { animation: axoFadeIn 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .piso-anim  { animation: pisoNumIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .info-anim  { animation: infoSlideIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }

        .piso-bar { transition: background 0.2s, border-color 0.2s, color 0.2s; }
        .piso-bar:hover { background: rgba(206,162,121,0.12) !important; }
        .piso-bar.active { background: rgba(206,162,121,0.18) !important; }

        @media (max-width: 768px) {
          .proyecto-layout   { flex-direction: column !important; height: auto !important; }
          .proyecto-sidebar  { width: 100% !important; height: 60vw !important; min-height: 260px; max-height: 380px; }
          .proyecto-right    { overflow-y: visible !important; }
          .proyecto-grid     { grid-template-columns: 1fr !important; }
          .proyecto-header   { padding: 1.2rem 1.5rem !important; justify-content: center !important; text-align: center; }
          .proyecto-header > div:first-child { justify-content: center !important; }
          .proyecto-axo      { padding: 2rem 1.5rem !important; min-height: 260px !important; border-right: none !important; border-bottom: 1px solid rgba(206,162,121,0.1) !important; }
          .proyecto-info     { padding: 2rem 1.5rem !important; }
          .piso-num          { font-size: 3.5rem !important; }
          .pisos-selector    { width: 100% !important; right: 0 !important; top: auto !important; bottom: 0 !important; transform: none !important; flex-direction: row !important; justify-content: center !important; padding: 0.4rem !important; background: rgba(10,45,56,0.92) !important; }
          .pisos-btn-wrap    { flex-direction: row !important; }
          .piso-bar          { min-width: 36px !important; height: 32px !important; flex-direction: column !important; gap: 1px !important; padding: 0 0.4rem !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'rgba(13,53,66,0.95)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(206,162,121,0.15)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO} alt="Cardinal" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
        </Link>
        <a href={'https://wa.me/' + wa} target="_blank" style={{
          background: '#CEA279', color: '#fff', padding: '0.65rem 1.5rem',
          fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          textDecoration: 'none', fontWeight: 500
        }}>Consultar</a>
      </nav>

      <div className="proyecto-layout" style={{ paddingTop: '60px', display: 'flex', height: '100vh' }}>

        {/* ── SIDEBAR ── */}
        <div className="proyecto-sidebar" style={{
          width: '400px', flexShrink: 0, background: '#0A2D38',
          borderRight: '1px solid rgba(206,162,121,0.1)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(206,162,121,0.1)' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.2rem' }}>{cfg.nombre}</p>
            <h1 style={{ fontSize: '1rem', fontWeight: 400, color: '#F5F0EA', marginBottom: '0.2rem' }}>{cfg.direccion}</h1>
            <p style={{ fontSize: '0.72rem', color: '#7A9BA8' }}>{cfg.descripcion}</p>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {cfg.render_url && (
              <img src={cfg.render_url} alt={cfg.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,45,56,0.2)' }} />

            {/* Panel selector de pisos — columna derecha */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: '72px',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(6,26,33,0.82)', backdropFilter: 'blur(12px)',
              borderLeft: '1px solid rgba(206,162,121,0.15)',
            }}>
              {/* SUM / Terraza — techo del edificio, no clickeable */}
              <div style={{
                flex: 1.5,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '3px',
                borderBottom: '1px solid rgba(206,162,121,0.2)',
              }}>
                <span style={{ fontSize: '0.45rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(206,162,121,0.45)' }}>SUM</span>
                <span style={{ fontSize: '0.4rem', letterSpacing: '0.1em', color: 'rgba(206,162,121,0.25)', textTransform: 'uppercase' }}>Terraza</span>
              </div>

              {/* Pisos 9 → 1 */}
              {PISOS.map((p, idx) => {
                const est    = pisoEstados[p]
                const color  = pisoColor(est)
                const active = piso === p
                return (
                  <button
                    key={p}
                    onClick={() => changePiso(p)}
                    style={{
                      flex: 1, width: '100%', border: 'none',
                      borderTop: '1px solid rgba(206,162,121,0.08)',
                      cursor: 'pointer',
                      background: active ? `${color}28` : 'transparent',
                      boxShadow: active ? `inset 0 0 20px ${color}22` : 'none',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '4px',
                      transition: 'background 0.25s, box-shadow 0.25s',
                      position: 'relative',
                    }}
                  >
                    {active && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                        background: color, boxShadow: `0 0 10px ${color}`,
                      }} />
                    )}
                    <span style={{
                      fontFamily: 'Panton, system-ui, sans-serif',
                      fontSize: active ? '1.6rem' : '1.1rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? color : 'rgba(245,240,234,0.72)',
                      textShadow: active ? `0 0 14px ${color}, 0 0 28px ${color}88` : '0 1px 3px rgba(0,0,0,0.6)',
                      lineHeight: 1,
                      transition: 'font-size 0.22s cubic-bezier(0.22,1,0.36,1), color 0.22s, text-shadow 0.22s',
                    }}>{p}</span>
                    {est && (
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: color,
                        opacity: active ? 1 : 0.5,
                        boxShadow: active ? `0 0 6px ${color}` : 'none',
                        flexShrink: 0,
                        transition: 'box-shadow 0.25s, opacity 0.25s',
                      }} />
                    )}
                  </button>
                )
              })}

              {/* PB / Hall — planta baja, no clickeable */}
              <div style={{
                flex: 1.0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '3px',
                borderTop: '1px solid rgba(206,162,121,0.2)',
              }}>
                <span style={{ fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(206,162,121,0.45)' }}>PB</span>
                <span style={{ fontSize: '0.4rem', letterSpacing: '0.1em', color: 'rgba(206,162,121,0.25)', textTransform: 'uppercase' }}>Hall</span>
              </div>
            </div>

            {/* Leyenda */}
            <div style={{
              position: 'absolute', bottom: '1.5rem', left: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '0.3rem',
              background: 'rgba(8,34,43,0.75)', backdropFilter: 'blur(6px)',
              padding: '0.6rem 0.8rem', border: '1px solid rgba(206,162,121,0.1)',
            }}>
              {[
                { label: 'Disponible', color: '#5BC47A' },
                { label: 'Reservado',  color: '#CEA279' },
                { label: 'Vendido',    color: '#E07070' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.52rem', color: '#F5F0EA', letterSpacing: '0.1em' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        <div className="proyecto-right" style={{ flex: 1, overflowY: 'auto' }}>

          {/* Header */}
          <div className="proyecto-header" style={{
            padding: '2rem 3rem', borderBottom: '1px solid rgba(206,162,121,0.1)',
            background: '#0A2D38', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span key={`piso-num-${animKey}`} className="piso-num piso-anim" style={{
                fontSize: '5rem', fontWeight: 700, color: 'transparent',
                WebkitTextStroke: '2px #CEA279', lineHeight: 1
              }}>{piso}</span>
              <div>
                <p style={{ fontSize: '0.55rem', color: '#7A9BA8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Tipología</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5F0EA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dormi} Dormitorios</p>
                <p style={{ fontSize: '0.9rem', color: '#CEA279' }}>{m2} m²</p>
                {/* Badge disponibilidad */}
                {estadoActual && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: pisoColor(estadoActual) }} />
                    <span style={{ fontSize: '0.62rem', color: pisoColor(estadoActual), letterSpacing: '0.08em', textTransform: 'capitalize' }}>
                      {estadoActual === 'disponible' ? 'Disponible' : estadoActual === 'reservado' ? 'Reservado' : 'Vendido'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['frente', 'contrafrente'] as const).map(t => (
                <button key={t} onClick={() => { setLado(t); setAnimKey(k => k + 1) }} style={{
                  padding: '0.6rem 1.2rem', cursor: 'pointer',
                  background: lado === t ? '#CEA279' : 'transparent',
                  border: '1px solid ' + (lado === t ? '#CEA279' : 'rgba(206,162,121,0.3)'),
                  color: lado === t ? '#0D3542' : '#CEA279',
                  fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontFamily: 'Panton, system-ui, sans-serif', fontWeight: lado === t ? 600 : 400,
                  transition: 'all 0.2s'
                }}>{t === 'frente' ? 'Frente' : 'Contrafrente'}</button>
              ))}
            </div>
          </div>

          {/* Axo + Características */}
          <div className="proyecto-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="proyecto-axo" style={{
              padding: '3rem', borderRight: '1px solid rgba(206,162,121,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0A2D38', minHeight: '400px'
            }}>
              {axoUrl && <img key={`axo-${animKey}`} src={axoUrl} alt={'Planta ' + lado} className="axo-img" style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }} />}
            </div>

            <div key={`info-${animKey}`} className="proyecto-info info-anim" style={{ padding: '3rem' }}>
              <p style={{ fontSize: '0.6rem', color: '#CEA279', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Características</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(items || []).map((item: [string, string], i: number) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '0.8rem 0', borderBottom: '1px solid rgba(206,162,121,0.08)', gap: '1rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#7A9BA8' }}>{item[0]}</span>
                    <span style={{ fontSize: '0.78rem', color: '#F5F0EA', fontWeight: 500, textAlign: 'right' }}>{item[1]}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', marginTop: '2rem', background: 'rgba(206,162,121,0.1)' }}>
                {[
                  { label: 'Dormitorios', value: String(dormi), color: '#CEA279' },
                  { label: 'Superficie',  value: m2 + ' m²',    color: '#CEA279' },
                  { label: 'Cochera',     value: cocheraLabel,   color: cochera === 'no_incluida' ? '#E07070' : '#CEA279' },
                  { label: 'Estado',      value: dispText,       color: dispColor },
                ].map(s => (
                  <div key={s.label} style={{ padding: '1.2rem', background: '#0D3542', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: '0.55rem', color: '#7A9BA8', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <a href={'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hola, me interesa el piso ' + piso + ' - ' + (lado === 'frente' ? 'Frente' : 'Contrafrente') + ' de ' + cfg.nombre)}
                target="_blank" style={{
                  display: 'block', textAlign: 'center', marginTop: '2rem',
                  background: '#CEA279', color: '#0D3542',
                  padding: '1rem', fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none'
                }}>Consultar por WhatsApp</a>

              <p style={{ fontSize: '0.65rem', color: '#7A9BA8', marginTop: '1rem', textAlign: 'center' }}>
                {cfg.precio_texto} · {cfg.financiacion_texto}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget mode="floating" alwaysShow />
    </main>
  )
}

export default function ProyectoPage() {
  return (
    <Suspense fallback={
      <main style={{ background: '#0D3542', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7A9BA8', fontSize: '0.85rem' }}>Cargando...</div>
      </main>
    }>
      <ProyectoPageInner />
    </Suspense>
  )
}
