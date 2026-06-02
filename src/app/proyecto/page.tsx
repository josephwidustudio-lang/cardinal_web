'use client'
import { useState } from 'react'
import Link from 'next/link'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const RENDER = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_render.jpg'
const AXO_FRENTE = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/planta_frente.png'
const AXO_CF = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/planta_contrafrente.png'
const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

const PISOS = [9,8,7,6,5,4,3,2,1]

const INFO = {
  frente: {
    tipo: 'Frente',
    dormitorios: 3,
    m2: 140,
    imagen: AXO_FRENTE,
    items: [
      ['Estar / Comedor', '5.20 x 6.50 m'],
      ['Dorm. en suite',  '5.25 x 3.20 m'],
      ['Bano en suite',   '1.80 x 2.20 m'],
      ['Dormitorio',      '3.60 x 3.00 m'],
      ['Bano',            '2.00 x 1.90 m'],
      ['Cocina',          '5.50 x 2.40 m'],
      ['Balcon',          '2.10 x 7.80 m'],
      ['Extras',          'Lavadero - Cochera - Palier privado'],
    ],
  },
  contrafrente: {
    tipo: 'Contrafrente',
    dormitorios: 2,
    m2: 120,
    imagen: AXO_CF,
    items: [
      ['Estar / Comedor', '7.50 x 6.50 m'],
      ['Dorm. en suite',  '3.60 x 3.10 m'],
      ['Bano en suite',   '2.00 x 2.00 m'],
      ['Dormitorio',      '3.60 x 3.10 m'],
      ['Bano',            '2.00 x 1.90 m'],
      ['Cocina',          '3.00 x 3.50 m'],
      ['Balcon',          '1.00 x 6.50 m'],
      ['Extras',          'Lavadero - Cochera - Palier privado'],
    ],
  },
}

export default function ProyectoPage() {
  const [piso, setPiso] = useState(9)
  const [lado, setLado] = useState('frente')
  const u = INFO[lado as keyof typeof INFO]

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
        <a href={"https://wa.me/" + WA} target="_blank" style={{
          background: '#CEA279', color: '#fff', padding: '0.65rem 1.5rem',
          fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          textDecoration: 'none', fontWeight: 500
        }}>Consultar</a>
      </nav>

      <div style={{ paddingTop: '60px', display: 'flex', height: '100vh' }}>
        <div style={{ width: '400px', flexShrink: 0, background: '#0A2D38', borderRight: '1px solid rgba(206,162,121,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(206,162,121,0.1)' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.2rem' }}>Cardinal</p>
            <h1 style={{ fontSize: '1rem', fontWeight: 400, color: '#F5F0EA', marginBottom: '0.2rem' }}>Necochea 3568</h1>
            <p style={{ fontSize: '0.72rem', color: '#7A9BA8' }}>9 pisos - 18 departamentos - Santa Fe</p>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <img src={RENDER} alt="Cardinal" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,45,56,0.2)' }} />
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

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '2rem 3rem', borderBottom: '1px solid rgba(206,162,121,0.1)', background: '#0A2D38', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '5rem', fontWeight: 700, color: 'transparent', WebkitTextStroke: '2px #CEA279', lineHeight: 1 }}>{piso}</span>
              <div>
                <p style={{ fontSize: '0.55rem', color: '#7A9BA8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Tipologia</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5F0EA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{u.dormitorios} Dormitorios</p>
                <p style={{ fontSize: '0.9rem', color: '#CEA279' }}>{u.m2} m2</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['frente', 'contrafrente'].map(t => (
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
            <div style={{ padding: '3rem', borderRight: '1px solid rgba(206,162,121,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A2D38', minHeight: '400px' }}>
              <img src={u.imagen} alt={"Planta " + u.tipo} style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '3rem' }}>
              <p style={{ fontSize: '0.6rem', color: '#CEA279', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Caracteristicas</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {u.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.8rem 0', borderBottom: '1px solid rgba(206,162,121,0.08)', gap: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#7A9BA8' }}>{item[0]}</span>
                    <span style={{ fontSize: '0.78rem', color: '#F5F0EA', fontWeight: 500, textAlign: 'right' }}>{item[1]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginTop: '2rem', background: 'rgba(206,162,121,0.1)' }}>
                {[['Dormitorios', String(u.dormitorios)], ['Superficie', u.m2 + ' m2'], ['Cochera', 'Incluida']].map(s => (
                  <div key={s[0]} style={{ padding: '1.2rem', background: '#0D3542', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#CEA279', lineHeight: 1 }}>{s[1]}</p>
                    <p style={{ fontSize: '0.58rem', color: '#7A9BA8', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>{s[0]}</p>
                  </div>
                ))}
              </div>
              <a href={"https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola, me interesa el piso " + piso + " - " + u.tipo + " de Cardinal")}
                target="_blank" style={{
                display: 'block', textAlign: 'center', marginTop: '2rem',
                background: '#CEA279', color: '#0D3542',
                padding: '1rem', fontSize: '0.78rem', fontWeight: 600,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                textDecoration: 'none'
              }}>Consultar por WhatsApp</a>
              <p style={{ fontSize: '0.65rem', color: '#7A9BA8', marginTop: '1rem', textAlign: 'center' }}>Precio a consultar - Financiacion disponible</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
