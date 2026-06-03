'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatWidget from '@/components/layout/ChatWidget'
import { supabase } from '@/lib/supabase'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const PISOS = [9,8,7,6,5,4,3,2,1]

export default function ProyectoPage() {
  const [piso, setPiso] = useState(9)
  const [lado, setLado] = useState<'frente' | 'contrafrente'>('frente')
  const [cfg, setCfg]   = useState<any>(null)

  useEffect(() => {
    supabase.from('proyecto_config').select('*').limit(1).single()
      .then(({ data }) => { if (data) setCfg(data) })
  }, [])

  if (!cfg) return (
    <main style={{ background: '#0D3542', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#7A9BA8', fontSize: '0.85rem' }}>Cargando...</div>
    </main>
  )

  const items  = lado === 'frente' ? cfg.frente_items : cfg.contrafrente_items
  const dormi  = lado === 'frente' ? cfg.frente_dormitorios : cfg.contrafrente_dormitorios
  const m2     = lado === 'frente' ? cfg.frente_m2 : cfg.contrafrente_m2
  const axoUrl = lado === 'frente' ? cfg.frente_axo_url : cfg.contrafrente_axo_url
  const wa     = cfg.wa_number || ''

  return (
    <main style={{ background: '#0D3542', minHeight: '100vh', fontFamily: 'Panton, system-ui, sans-serif' }}>
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

      <div style={{ paddingTop: '60px', display: 'flex', height: '100vh' }}>
        {/* Panel izquierdo */}
        <div style={{ width: '400px', flexShrink: 0, background: '#0A2D38', borderRight: '1px solid rgba(206,162,121,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(206,162,121,0.1)' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.2rem' }}>{cfg.nombre}</p>
            <h1 style={{ fontSize: '1rem', fontWeight: 400, color: '#F5F0EA', marginBottom: '0.2rem' }}>{cfg.direccion}</h1>
            <p style={{ fontSize: '0.72rem', color: '#7A9BA8' }}>{cfg.descripcion}</p>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {cfg.render_url && (
              <img src={cfg.render_url} alt={cfg.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,45,56,0.2)' }} />
            {/* Selector de pisos */}
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {PISOS.map(p => (
                <button key={p} onClick={() => setPiso(p)} style={{
                  width: '42px', height: '26px',
                  background: piso === p ? '#CEA279' : 'rgba(13,53,66,0.8)',
                  border: '1px solid ' + (piso === p ? '#CEA279' : 'rgba(206,162,121,0.3)'),
                  color: piso === p ? '#0D3542' : '#CEA279',
                  fontSize: '0.62rem', fontWeight: piso === p ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  backdropFilter: 'blur(4px)', fontFamily: 'Panton, system-ui, sans-serif'
                }}>{p}</button>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(13,53,66,0.9)', backdropFilter: 'blur(8px)', padding: '0.8rem 1.2rem', border: '1px solid rgba(206,162,121,0.2)' }}>
              <p style={{ fontSize: '0.55rem', color: '#CEA279', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Piso</p>
              <p style={{ fontSize: '1.8rem', color: '#F5F0EA', fontWeight: 300, lineHeight: 1 }}>{piso}</p>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '2rem 3rem', borderBottom: '1px solid rgba(206,162,121,0.1)', background: '#0A2D38', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '5rem', fontWeight: 700, color: 'transparent', WebkitTextStroke: '2px #CEA279', lineHeight: 1 }}>{piso}</span>
              <div>
                <p style={{ fontSize: '0.55rem', color: '#7A9BA8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Tipología</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5F0EA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dormi} Dormitorios</p>
                <p style={{ fontSize: '0.9rem', color: '#CEA279' }}>{m2} m²</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['frente', 'contrafrente'] as const).map(t => (
                <button key={t} onClick={() => setLado(t)} style={{
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Axo */}
            <div style={{ padding: '3rem', borderRight: '1px solid rgba(206,162,121,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A2D38', minHeight: '400px' }}>
              {axoUrl && <img src={axoUrl} alt={'Planta ' + lado} style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }} />}
            </div>

            {/* Características */}
            <div style={{ padding: '3rem' }}>
              <p style={{ fontSize: '0.6rem', color: '#CEA279', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Características</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(items || []).map((item: [string, string], i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.8rem 0', borderBottom: '1px solid rgba(206,162,121,0.08)', gap: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#7A9BA8' }}>{item[0]}</span>
                    <span style={{ fontSize: '0.78rem', color: '#F5F0EA', fontWeight: 500, textAlign: 'right' }}>{item[1]}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginTop: '2rem', background: 'rgba(206,162,121,0.1)' }}>
                {[['Dormitorios', String(dormi)], ['Superficie', m2 + ' m²'], ['Cochera', 'Incluida']].map(s => (
                  <div key={s[0]} style={{ padding: '1.2rem', background: '#0D3542', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#CEA279', lineHeight: 1 }}>{s[1]}</p>
                    <p style={{ fontSize: '0.58rem', color: '#7A9BA8', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>{s[0]}</p>
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
