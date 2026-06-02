'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SITE, COLORS } from '@/lib/config'
import Link from 'next/link'
import NavMobile from '@/components/layout/NavMobile'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const VIDEO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/SALAS_VIDEO%20HORIZONTAL%202.mp4'

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  'en-construccion':   { label: 'En construcción',   color: '#CEA279' },
  'entrega-inmediata': { label: 'Entrega inmediata', color: '#5BC47A' },
  'proximamente':      { label: 'Próximamente',      color: '#7090E0' },
  'entregado':         { label: 'Entregado',         color: '#7A9BA8' },
}

const TIPO_LABEL: Record<string, string> = {
  mono:'Monoambiente','1amb':'1 amb.','2amb':'2 amb.','3amb':'3 amb.','4amb':'4 amb.',ph:'PH',local:'Local'
}

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  disponible: { bg:'rgba(91,196,122,0.15)',  color:'#5BC47A', label:'Disponible' },
  reservado:  { bg:'rgba(206,162,121,0.15)', color:'#CEA279', label:'Reservado'  },
  vendido:    { bg:'rgba(224,112,112,0.12)', color:'#E07070', label:'Vendido'    },
}

export default function Home() {
  const [edificios,  setEdificios]  = useState<any[]>([])
  const [unidades,   setUnidades]   = useState<any[]>([])
  const [imagenes,   setImagenes]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filtroPiso, setFiltroPiso] = useState('')
  const [pisos,      setPisos]      = useState<string[]>([])

  useEffect(() => {
    async function cargar() {
      const { data: eds } = await supabase
        .from('edificios').select('*, unidades(id,estado)')
        .eq('activo', true).order('orden')
      setEdificios(eds ?? [])
      if (eds && eds.length > 0) {
        const edificioId = eds[0].id
        const [{ data: uns }, { data: imgs }] = await Promise.all([
          supabase.from('unidades').select('*').eq('edificio_id', edificioId).order('piso'),
          supabase.from('edificio_imagenes').select('*').eq('edificio_id', edificioId).order('orden'),
        ])
        setUnidades(uns ?? [])
        setImagenes(imgs ?? [])
        const pisosUnicos = Array.from(new Set((uns ?? []).map((u: any) => u.piso).filter(Boolean))) as string[]
        setPisos(pisosUnicos.sort())
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const unidadesFiltradas = filtroPiso ? unidades.filter(u => u.piso === filtroPiso) : unidades
  const edificio = edificios[0] ?? null

  return (
    <main style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: "Panton, system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'rgba(13,53,66,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(206,162,121,0.15)'
      }}>
        <img src={LOGO} alt="Cardinal" style={{ height: '36px', filter: 'brightness(0) invert(1)' }} />
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '2.5rem' }}>
          {[
            { label: 'Unidades',  href: '#unidades'  },
            { label: 'Galeria',   href: '#galeria'   },
            { label: 'Nosotros',  href: '#nosotros'  },
            { label: 'Contacto',  href: '#contacto'  },
          ].map(item => (
            <a key={item.label} href={item.href} style={{
              fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#7A9BA8', textDecoration: 'none'
            }}>{item.label}</a>
          ))}
        </div>
        <a href={"https://wa.me/" + SITE.wa} target="_blank"
          className="nav-cta-desktop"
          style={{
            background: '#CEA279', color: '#fff', padding: '0.65rem 1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 500
          }}>Consultar</a>
        <NavMobile />
      </nav>

      {/* HERO */}
      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={VIDEO} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,53,66,0.45)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: '60vh' }}>
          <a href="#unidades" style={{
            background: '#CEA279', color: '#fff', padding: '1.2rem 3rem',
            fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 500, display: 'inline-block'
          }}>Ver unidades</a>
        </div>
        <div style={{ position: 'absolute', bottom: '6rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1px', height: '50px', background: 'linear-gradient(to bottom, #CEA279, transparent)' }} />
          <span style={{ fontSize: '0.6rem', color: '#CEA279', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* UNIDADES */}
      <section id="unidades" style={{ padding: '8rem 2rem', background: '#0A2D38' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
              Disponibilidad
              <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
            </p>
            <h2 style={{ fontFamily: "Panton, system-ui, sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#F5F0EA', marginBottom: '0.5rem' }}>
              Unidades disponibles
            </h2>
            {edificio && (
              <p style={{ color: '#7A9BA8', fontSize: '0.85rem' }}>
                {unidades.filter(u => u.estado === 'disponible').length} disponibles
                - {unidades.filter(u => u.estado === 'reservado').length} reservadas
                - {unidades.filter(u => u.estado === 'vendido').length} vendidas
              </p>
            )}
          </div>

          {pisos.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <button onClick={() => setFiltroPiso('')} style={{
                padding: '0.6rem 1.5rem', cursor: 'pointer',
                background: filtroPiso === '' ? '#CEA279' : 'transparent',
                border: '1px solid ' + (filtroPiso === '' ? '#CEA279' : 'rgba(206,162,121,0.15)'),
                color: filtroPiso === '' ? '#fff' : '#7A9BA8',
                fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.2s', fontFamily: "Panton, system-ui, sans-serif"
              }}>Todos</button>
              {pisos.map(piso => (
                <button key={piso} onClick={() => setFiltroPiso(piso)} style={{
                  padding: '0.6rem 1.5rem', cursor: 'pointer',
                  background: filtroPiso === piso ? '#CEA279' : 'transparent',
                  border: '1px solid ' + (filtroPiso === piso ? '#CEA279' : 'rgba(206,162,121,0.15)'),
                  color: filtroPiso === piso ? '#fff' : '#7A9BA8',
                  fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  transition: 'all 0.2s', fontFamily: "Panton, system-ui, sans-serif"
                }}>Piso {piso}</button>
              ))}
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: 'center', color: '#7A9BA8' }}>Cargando...</p>
          ) : unidadesFiltradas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7A9BA8', padding: '3rem' }}>No hay unidades en este piso.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Unidad','Tipo','Piso','m2','Precio','Estado',''].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '0.8rem 1.2rem',
                        fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: '#7A9BA8', borderBottom: '1px solid rgba(206,162,121,0.15)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unidadesFiltradas.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(206,162,121,0.08)' }}>
                      <td style={{ padding: '1rem 1.2rem', color: '#F5F0EA', fontWeight: 500 }}>{u.codigo}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#7A9BA8' }}>{TIPO_LABEL[u.tipo] ?? u.tipo}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#7A9BA8' }}>{u.piso ?? '-'}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#7A9BA8' }}>{u.m2 ? u.m2 + ' m2' : '-'}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#F5F0EA', fontWeight: 500 }}>{u.precio_texto ?? '-'}</td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.3rem 0.8rem',
                          fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
                          background: BADGE[u.estado]?.bg, color: BADGE[u.estado]?.color
                        }}>{BADGE[u.estado]?.label ?? u.estado}</span>
                      </td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        {u.estado === 'disponible' && (
                          <a href={"https://wa.me/" + SITE.wa + "?text=Hola, me interesa la Unidad " + u.codigo + " - Piso " + u.piso}
                            target="_blank" style={{ fontSize: '0.68rem', color: '#CEA279', textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                            Consultar
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {edificio && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href={"/edificio/" + edificio.id + "/axo"} style={{
                border: '1px solid rgba(206,162,121,0.3)', color: '#CEA279',
                padding: '1rem 2.5rem', fontSize: '0.82rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block'
              }}>Ver planta 3D interactiva</Link>
            </div>
          )}
        </div>
      </section>

      {/* GALERIA */}
      {imagenes.length > 0 && (
        <section id="galeria" style={{ padding: '8rem 0', background: '#0D3542' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 2rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
              Galeria
              <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
            </p>
            <h2 style={{ fontFamily: "Panton, system-ui, sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#F5F0EA' }}>
              El proyecto en detalle
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {imagenes.map((img, i) => (
              <div key={img.id} style={{
                aspectRatio: i === 0 ? '16/9' : '4/3',
                gridColumn: i === 0 ? 'span 3' : 'span 1',
                overflow: 'hidden'
              }}>
                <img src={img.url} alt={"Cardinal " + (i + 1)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOSOTROS */}
      <section id="nosotros" style={{ padding: '8rem 2rem', background: '#0A2D38' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center', maxWidth: '1100px', margin: '0 auto' }}>
          <div>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
              Nosotros
            </p>
            <h2 style={{ fontFamily: "Panton, system-ui, sans-serif", fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 300, color: '#F5F0EA', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              {SITE.nosotrosTitulo} {SITE.nosotrosTituloEm}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#7A9BA8', lineHeight: 1.9, marginBottom: '1.5rem' }}>{SITE.nosotrosTexto1}</p>
            <p style={{ fontSize: '0.9rem', color: '#7A9BA8', lineHeight: 1.9 }}>{SITE.nosotrosTexto2}</p>
          </div>
          <div style={{ aspectRatio: '4/5', background: '#0F3D4C', overflow: 'hidden' }}>
            <img src={SITE.nosotrosImagen} alt="Cardinal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ padding: '8rem 2rem', background: '#0D3542' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
            Contacto
            <span style={{ width: '30px', height: '1px', background: '#CEA279', display: 'block' }} />
          </p>
          <h2 style={{ fontFamily: "Panton, system-ui, sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#F5F0EA', marginBottom: '1rem' }}>
            Queres saber mas sobre Cardinal?
          </h2>
          <p style={{ color: '#7A9BA8', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '3rem' }}>
            Contactanos y te respondemos con toda la informacion que necesitas.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={"https://wa.me/" + SITE.wa + "?text=" + encodeURIComponent(SITE.waMsg)} target="_blank" style={{
              background: '#CEA279', color: '#fff', padding: '1rem 2.5rem',
              fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none', fontWeight: 500
            }}>WhatsApp</a>
            <a href={"mailto:" + SITE.email} style={{
              border: '1px solid rgba(206,162,121,0.3)', color: '#F5F0EA',
              padding: '1rem 2.5rem', fontSize: '0.85rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', textDecoration: 'none'
            }}>Email</a>
          </div>
        </div>
      </section>

      {/* FOOTER CON MAPA */}
      <footer style={{ background: '#0A2D38', borderTop: '1px solid rgba(206,162,121,0.15)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
          <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <img src={LOGO} alt="Cardinal" style={{ height: '48px', filter: 'brightness(0) invert(1)', marginBottom: '2rem', display: 'block' }} />
              <p style={{ fontSize: '0.85rem', color: '#7A9BA8', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '300px' }}>
                {SITE.descripcion}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#7A9BA8' }}>Necochea 3568, Santa Fe, Argentina</p>
                <p style={{ fontSize: '0.82rem', color: '#7A9BA8' }}>{SITE.email}</p>
              </div>
            </div>
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(206,162,121,0.15)' }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(122,155,168,0.5)' }}>
                {new Date().getFullYear()} Cardinal. Todos los derechos reservados.
              </p>
              <Link href="/admin" style={{ fontSize: '0.68rem', color: 'rgba(122,155,168,0.4)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>
                Panel
              </Link>
            </div>
          </div>
          <div style={{ minHeight: '400px', position: 'relative' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d685.5715919534637!2d-60.69476458105924!3d-31.63669670301961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1779509244450!5m2!1ses-419!2sar"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', minHeight: '400px', filter: 'hue-rotate(180deg) invert(90%) saturate(0.5)' }}
              allowFullScreen loading="lazy"
            />
          </div>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={"https://wa.me/" + SITE.wa} target="_blank" style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 200,
        width: '56px', height: '56px', borderRadius: '50%',
        background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,0.3)'
      }}>💬</a>

    </main>
  )
}