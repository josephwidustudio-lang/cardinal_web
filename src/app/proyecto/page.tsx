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
  const [hoveredPiso, setHoveredPiso] = useState<string | null>(null)
  const prevPiso                      = useRef(piso)

  function changePiso(p: number) {
    prevPiso.current = piso
    setPiso(p)
    setAnimKey(k => k + 1)
  }

  // SVG floor definitions — id, piso number (null = non-selectable), label, label position
  // lx/ly = centroid of the RIGHT rectangular body of each L-shaped polygon
  const SVG_FLOORS = [
    { id: 'piso-sum', piso: null as number|null, label: 'SUM', lx: 229, ly: 42  },
    { id: 'piso-9',   piso: 9,                   label: '9',   lx: 229, ly: 91  },
    { id: 'piso-8',   piso: 8,                   label: '8',   lx: 229, ly: 139 },
    { id: 'piso-7',   piso: 7,                   label: '7',   lx: 229, ly: 187 },
    { id: 'piso-6',   piso: 6,                   label: '6',   lx: 229, ly: 236 },
    { id: 'piso-5',   piso: 5,                   label: '5',   lx: 229, ly: 285 },
    { id: 'piso-4',   piso: 4,                   label: '4',   lx: 229, ly: 333 },
    { id: 'piso-3',   piso: 3,                   label: '3',   lx: 229, ly: 381 },
    { id: 'piso-2',   piso: 2,                   label: '2',   lx: 229, ly: 431 },
    { id: 'piso-1',   piso: 1,                   label: '1',   lx: 229, ly: 479 },
    { id: 'piso-pb',  piso: null as number|null,  label: 'PB',  lx: 229, ly: 538 },
  ]

  function svgFloorColor(floorDef: typeof SVG_FLOORS[0]) {
    if (floorDef.piso === null) return '#CEA279'
    return pisoColor(pisoEstados[floorDef.piso])
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
            {/* Imagen del edificio */}
            <img
              src="/edificio/0-100.jpg"
              alt="Edificio"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />

            {/* SVG interactivo — polígonos por piso */}
            <svg
              viewBox="0 0 451 621"
              preserveAspectRatio="xMidYMin slice"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="floor-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {SVG_FLOORS.map(f => {
                const color   = svgFloorColor(f)
                const active  = f.piso !== null && piso === f.piso
                const hovered = hoveredPiso === f.id
                const fillOp  = active ? 0.32 : hovered ? 0.18 : 0
                const strokeOp= active ? 0.9  : hovered ? 0.6  : 0
                const shapeProps = {
                  fill: color, fillOpacity: fillOp,
                  stroke: color, strokeWidth: 1.5, strokeOpacity: strokeOp,
                  filter: active ? 'url(#floor-glow)' : undefined,
                  style: { transition: 'fill-opacity 0.2s, stroke-opacity 0.2s' } as React.CSSProperties,
                }
                return (
                  <g
                    key={f.id}
                    onClick={f.piso !== null ? () => changePiso(f.piso!) : undefined}
                    onMouseEnter={() => setHoveredPiso(f.id)}
                    onMouseLeave={() => setHoveredPiso(null)}
                    style={{ cursor: f.piso !== null ? 'pointer' : 'default' }}
                  >
                    {/* Shape */}
                    {f.id === 'piso-pb'  && <rect x="137.15" y="507.29" width="183.97" height="60.36" {...shapeProps}/>}
                    {f.id === 'piso-1'   && <rect x="143.25" y="458.81" width="171.45" height="40.45" {...shapeProps}/>}
                    {f.id === 'piso-2'   && <polygon points="314.7 410 182.1 410 182.1 419.31 147.74 419.31 147.74 454.63 181.13 454.63 181.13 451.1 314.7 451.1 314.7 410" {...shapeProps}/>}
                    {f.id === 'piso-3'   && <polygon points="314.7 361.6 182.18 361.6 182.18 373.16 146.7 373.16 146.7 408.8 181.37 408.8 181.37 401.09 314.7 401.09 314.7 361.6" {...shapeProps}/>}
                    {f.id === 'piso-4'   && <path d="M314.7,312.21v41.06h-132.71v11.56h-35.29v-38.05h35.17v-14.57h132.83Z" {...shapeProps}/>}
                    {f.id === 'piso-5'   && <polygon points="314.7 305.11 314.7 264.65 182.23 264.65 182.23 282.96 146.7 282.96 146.7 318.59 181.87 318.59 181.87 305.11 314.7 305.11" {...shapeProps}/>}
                    {f.id === 'piso-6'   && <polygon points="314.7 215.72 314.7 256.98 181.8 256.98 181.8 274.32 146.7 274.32 146.7 237.07 181.64 237.07 181.64 215.72 314.7 215.72" {...shapeProps}/>}
                    {f.id === 'piso-7'   && <polygon points="314.7 207.59 181.58 207.59 181.58 227.66 146.7 227.66 146.7 190.74 181.58 190.74 181.58 166.34 314.7 166.34 314.7 207.59" {...shapeProps}/>}
                    {f.id === 'piso-8'   && <polygon points="314.7 157.87 314.7 119.34 182.4 119.34 182.4 145.99 147.41 145.99 147.41 182.59 181.58 182.59 181.58 157.87 314.7 157.87" {...shapeProps}/>}
                    {f.id === 'piso-9'   && <path d="M314.7,70.7v40.29h-132.46v26.97h-34.84v-37.4h34.68v-29.86s132.22.39,132.62,0Z" {...shapeProps}/>}
                    {f.id === 'piso-sum' && <polygon points="143.71 21.33 143.71 91.65 182.24 91.65 182.24 62.51 314.7 62.51 314.7 21.33 143.71 21.33" {...shapeProps}/>}

                    {/* Label */}
                    <text
                      x={f.lx} y={f.ly}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={active ? color : 'rgba(245,240,234,0.9)'}
                      fontSize={active ? 22 : 18}
                      fontWeight={700}
                      fontFamily="system-ui, sans-serif"
                      style={{ transition: 'font-size 0.2s, fill 0.2s', pointerEvents: 'none',
                               textShadow: active ? `0 0 8px ${color}` : '0 1px 3px rgba(0,0,0,0.8)' } as React.CSSProperties}
                    >{f.label}</text>
                  </g>
                )
              })}
            </svg>

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
