'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { SITE, COLORS } from '@/lib/config'
import Link from 'next/link'
import ChatWidget from '@/components/layout/ChatWidget'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const RENDER = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_render.jpg'
const AXO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/planta.png'
const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

export default function Home() {
  const [edificio, setEdificio] = useState<any>(null)
  const [imagenes, setImagenes] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: eds }, { data: imgs }, { data: unds }] = await Promise.all([
        supabase.from('edificios').select('*').eq('activo', true).order('orden').limit(1),
        supabase.from('edificio_imagenes').select('*').eq('categoria', 'galeria').order('orden'),
        supabase.from('unidades').select('*').order('piso'),
      ])
      if (eds?.[0]) setEdificio(eds[0])
      if (imgs) setImagenes(imgs.filter(i => i.url))
      if (unds) setUnidades(unds)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: '#7A9BA8', padding: '10rem 2rem', textAlign: 'center' }}>Cargando...</div>

  return (
    <main style={{ background: '#0D3542', fontFamily: 'Panton, system-ui, sans-serif', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'rgba(13,53,66,0.88)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(206,162,121,0.15)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO} alt="Cardinal" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
        </Link>
        <a href={`https://wa.me/${WA}`} target="_blank" style={{
          background: '#CEA279', color: '#fff', padding: '0.65rem 1.5rem',
          fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          textDecoration: 'none', fontWeight: 500
        }}>Consultar</a>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <img src={RENDER} alt="Cardinal" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center', zIndex: 1
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,53,66,0.55)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#CEA279', marginBottom: '2rem'
          }}>Proyecto Cardinal</p>
          <h1 style={{
            fontFamily: 'Panton, Georgia, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 300, color: '#F5F0EA', marginBottom: '1rem', lineHeight: 1.1
          }}>Necochea 3568</h1>
          <p style={{ fontSize: '1.05rem', color: '#CEA279', marginBottom: '3rem', letterSpacing: '0.05em' }}>
            9 pisos · 18 departamentos · Santa Fe
          </p>
          <a href={`https://wa.me/${WA}`} target="_blank" style={{
            display: 'inline-block', background: '#CEA279', color: '#0A2D38',
            padding: '1rem 2.5rem', fontSize: '0.75rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none'
          }}>Ver disponibilidad</a>
        </div>

        {/* Chat hero */}
        <div style={{ position: 'relative', zIndex: 3, marginTop: 'auto', paddingBottom: '3rem', width: '100%' }}>
          <ChatWidget mode="hero" />
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section style={{ padding: '5rem 2rem', background: '#0A2D38' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'Panton, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300, color: '#F5F0EA', marginBottom: '1rem'
            }}>Un proyecto pensado en detalle</h2>
            <p style={{ fontSize: '0.9rem', color: '#7A9BA8', maxWidth: '600px', margin: '0 auto' }}>
              Ubicado en el corazón de Santa Fe, Cardinal combina diseño contemporáneo con funcionalidad premium.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🏗️', title: 'Construcción Premium', desc: 'Materiales de primera calidad' },
              { icon: '☀️', title: 'Luminosidad', desc: 'Amplios balcones orientados al norte' },
              { icon: '🅿️', title: 'Cochera Incluida', desc: 'Una por departamento' },
              { icon: '🔒', title: 'Seguridad 24/7', desc: 'Portería y videovigilancia' },
            ].map(f => (
              <div key={f.title} style={{ padding: '2rem', background: '#0D3542', border: '1px solid rgba(206,162,121,0.1)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</p>
                <h3 style={{ color: '#CEA279', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#7A9BA8', fontSize: '0.85rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIDADES */}
      <UnidadesSection unidades={unidades} />

      {/* GALERIA */}
      {imagenes.length > 0 && <GaleriaSection imagenes={imagenes} />}

      {/* FOOTER */}
      <footer style={{
        padding: '3rem 2rem', background: '#0A2D38',
        borderTop: '1px solid rgba(206,162,121,0.1)', textAlign: 'center'
      }}>
        <img src={LOGO} alt="Cardinal" style={{ height: '24px', marginBottom: '1.5rem', filter: 'brightness(0) invert(1)' }} />
        <p style={{ color: '#7A9BA8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Cardinal - Necochea 3568</p>
        <p style={{ color: '#7A9BA8', fontSize: '0.75rem' }}>Santa Fe, Argentina · {new Date().getFullYear()}</p>
      </footer>

      <ChatWidget mode="floating" />
    </main>
  )
}

// ── UNIDADES ──────────────────────────────────────────────────────────────────
function UnidadesSection({ unidades }: { unidades: any[] }) {
  const counts = {
    disponibles: unidades.filter(u => u.estado === 'disponible').length,
    reservadas: unidades.filter(u => u.estado === 'reservado').length,
    vendidas: unidades.filter(u => u.estado === 'vendido').length,
  }

  return (
    <section style={{ padding: '6rem 2rem', background: '#0D3542' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem' }}>Disponibilidad</p>
          <h2 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#F5F0EA' }}>
            Unidades disponibles
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Disponibles', count: counts.disponibles, color: '#5BC47A' },
            { label: 'Reservadas', count: counts.reservadas, color: '#CEA279' },
            { label: 'Vendidas', count: counts.vendidas, color: '#7A9BA8' },
          ].map(s => (
            <div key={s.label} style={{ padding: '2rem', background: '#0A2D38', border: '1px solid rgba(206,162,121,0.1)', textAlign: 'center' }}>
              <p style={{ fontSize: '2.2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: '0.7rem', color: '#7A9BA8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.5rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <Link href="/proyecto" style={{
          display: 'block', textAlign: 'center',
          background: '#CEA279', color: '#0A2D38', padding: '1rem 2.5rem',
          fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          fontWeight: 600, textDecoration: 'none', maxWidth: '300px', margin: '0 auto'
        }}>Ver plantas y detalles</Link>
      </div>
    </section>
  )
}

// ── GALERIA SECTION ──────────────────────────────────────────────────────────
function buildLayout(n: number) {
  const result: { col: string; ratio: string }[] = []
  let i = 0

  while (i < n) {
    const remaining = n - i

    if (remaining === 1) {
      result.push({ col: 'span 3', ratio: '21/9' })
      i++
    } else if (remaining === 2) {
      result.push({ col: 'span 2', ratio: '16/9' }, { col: 'span 1', ratio: '4/3' })
      i += 2
    } else if (remaining === 3) {
      result.push(
        { col: 'span 1', ratio: '4/3' },
        { col: 'span 1', ratio: '4/3' },
        { col: 'span 1', ratio: '4/3' }
      )
      i += 3
    } else if (remaining === 4) {
      result.push(
        { col: 'span 2', ratio: '16/9' },
        { col: 'span 2', ratio: '16/9' }
      )
      i += 2
    } else if (remaining === 5) {
      result.push(
        { col: 'span 2', ratio: '16/9' },
        { col: 'span 1', ratio: '4/3' },
        { col: 'span 1', ratio: '4/3' },
        { col: 'span 1', ratio: '4/3' }
      )
      i += 4
    } else {
      // remaining >= 6: [2, 1] + [2, 1] = 4 items
      result.push(
        { col: 'span 2', ratio: '16/9' },
        { col: 'span 1', ratio: '4/3' },
        { col: 'span 2', ratio: '16/9' },
        { col: 'span 1', ratio: '4/3' }
      )
      i += 4
    }
  }
  return result
}

function GaleriaSection({ imagenes }: { imagenes: any[] }) {
  const PAGE = 6
  const [visible, setVisible] = useState(PAGE)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const shown = imagenes.slice(0, visible)
  const layouts = useMemo(() => buildLayout(shown.length), [shown.length])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Number((e.target as HTMLElement).dataset.idx)
          setVisibleItems(prev => { const s = new Set(prev); s.add(idx); return s })
        }
      }),
      { threshold: 0.15 }
    )
    itemRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [visible])

  return (
    <section id="galeria" style={{ padding: '8rem 0', background: '#0D3542' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 2rem' }}>
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
          Galería
          <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
        </p>
        <h2 style={{ fontFamily: 'Panton, system-ui, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#F5F0EA' }}>
          El proyecto en detalle
        </h2>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '0 3px', maxWidth: '1400px', margin: '0 auto' }}>
        {shown.map((img, i) => {
          const layout = layouts[i]
          const isVisible = visibleItems.has(i)
          return (
            <div
              key={img.id}
              ref={el => { itemRefs.current[i] = el }}
              data-idx={i}
              onClick={() => setLightbox(img.url)}
              onMouseEnter={() => setHoverId(img.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                gridColumn: layout.col,
                aspectRatio: layout.ratio,
                overflow: 'hidden',
                cursor: 'zoom-in',
                position: 'relative',
                opacity: isVisible ? 1 : 0,
                animation: isVisible ? `fadeUp 0.6s ease forwards` : 'none',
                animationDelay: `${(i % 3) * 0.1}s`,
              }}
            >
              <img
                src={img.url}
                alt={img.titulo ?? `Cardinal ${i + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transform: hoverId === img.id ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              />
              {img.titulo && (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'rgba(10,45,56,0.82)', backdropFilter: 'blur(6px)',
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.6rem', color: '#CEA279',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  opacity: hoverId === img.id ? 1 : 0.85,
                  transition: 'opacity 0.3s ease',
                }}>{img.titulo}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ver más */}
      {visible < imagenes.length && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => setVisible(prev => prev + PAGE)} style={{
            background: 'rgba(206,162,121,0.1)', border: '1px solid rgba(206,162,121,0.3)',
            color: '#CEA279', padding: '0.85rem 2rem',
            fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'Panton, system-ui, sans-serif', fontWeight: 500
          }}>Ver más fotos</button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,45,56,0.96)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: '2rem', right: '2rem',
            background: 'transparent', border: '1px solid rgba(206,162,121,0.3)',
            color: '#CEA279', width: '44px', height: '44px',
            fontSize: '1.2rem', cursor: 'pointer',
          }}>✕</button>
          <img
            src={lightbox} alt="Cardinal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'default' }}
          />
        </div>
      )}
    </section>
  )
}
