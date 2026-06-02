'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  disponible: { bg: 'rgba(45,130,75,0.2)', color: '#5BC47A', label: 'Disponible' },
  reservado: { bg: 'rgba(201,169,110,0.2)', color: '#C9A96E', label: 'Reservado' },
  vendido: { bg: 'rgba(180,60,60,0.2)', color: '#E07070', label: 'Vendido' },
}

const TIPO: Record<string, string> = {
  mono: 'Monoambiente', '1amb': '1 amb.', '2amb': '2 amb.',
  '3amb': '3 amb.', '4amb': '4 amb.', ph: 'PH', local: 'Local'
}

const AXO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/axo/01-%20Planta_3d_Dto_A.png'

export default function AxoPage({ params }: { params: { id: string } }) {
  const [edificio, setEdificio] = useState<any>(null)
  const [unidades, setUnidades] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => {
    supabase.from('edificios').select('*').eq('id', params.id).single()
      .then(({ data: ed }) => setEdificio(ed))
    supabase.from('unidades').select('*').eq('edificio_id', params.id).order('piso')
      .then(({ data: un }) => {
        setUnidades(un ?? [])
        setSelected(un?.find((u: any) => u.estado === 'disponible') ?? un?.[0] ?? null)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#C9A96E', fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.3em' }}>SOFIA</span>
    </div>
  }

  return (
    <main style={{ background: '#0A0A0A', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 3rem', background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(201,169,110,0.1)'
      }}>
        <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.3em', color: '#F5F2EE', textDecoration: 'none' }}>SOFIA</Link>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 300, color: '#C9A96E' }}>{edificio?.nombre} - Planta interactiva</span>
        <Link href={`/edificio/${params.id}`} style={{ fontSize: '0.72rem', color: '#6B6B65', textDecoration: 'none' }}>Volver al edificio</Link>
      </nav>

      <div style={{ paddingTop: '65px', display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, background: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
            <img src={selected?.imagen_axo ?? AXO} alt="Vista axonometrica"
              style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 180px)', objectFit: 'contain', display: 'block' }} />
            {selected && (
              <div style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)', padding: '0.8rem 1.2rem', border: '1px solid rgba(201,169,110,0.2)' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#F5F2EE', fontWeight: 300 }}>Unidad {selected.codigo}</div>
                <div style={{ fontSize: '0.72rem', color: '#6B6B65', marginTop: '0.2rem' }}>{TIPO[selected.tipo] ?? selected.tipo} - Piso {selected.piso}</div>
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(10,10,10,0.92)', borderTop: '1px solid rgba(201,169,110,0.1)', padding: '1rem 2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: '#6B6B65', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>Unidades:</span>
            {unidades.map((u: any) => (
              <button key={u.id} onClick={() => setSelected(u)} style={{
                padding: '0.5rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap',
                background: selected?.id === u.id ? BADGE[u.estado]?.bg : 'rgba(255,255,255,0.05)',
                border: selected?.id === u.id ? `1px solid ${BADGE[u.estado]?.color}` : '1px solid rgba(255,255,255,0.08)',
                color: selected?.id === u.id ? BADGE[u.estado]?.color : '#6B6B65',
                fontSize: '0.72rem', transition: 'all 0.2s'
              }}>{u.codigo}</button>
            ))}
          </div>
        </div>

        <div style={{ width: '380px', flexShrink: 0, background: '#111111', borderLeft: '1px solid rgba(201,169,110,0.1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {selected ? (
            <div>
              <div style={{ padding: '2rem', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: '#C9A96E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{edificio?.nombre}</p>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F2EE', lineHeight: 1 }}>Unidad {selected.codigo}</h2>
                  </div>
                  <span style={{ display: 'inline-block', padding: '0.35rem 0.9rem', marginTop: '0.3rem', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', background: BADGE[selected.estado]?.bg, color: BADGE[selected.estado]?.color, border: `1px solid ${BADGE[selected.estado]?.color}` }}>
                    {BADGE[selected.estado]?.label}
                  </span>
                </div>
              </div>

              <div style={{ padding: '2rem', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                <p style={{ fontSize: '0.65rem', color: '#C9A96E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Caracteristicas</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Tipologia', value: TIPO[selected.tipo] ?? selected.tipo },
                    { label: 'Piso', value: selected.piso ?? '-' },
                    { label: 'Superficie', value: selected.m2 ? `${selected.m2} m2` : '-' },
                    { label: 'Ambientes', value: selected.ambientes ?? '-' },
                    { label: 'Dormitorios', value: selected.dormitorios ?? '-' },
                    { label: 'Banos', value: selected.banos ?? '-' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.6rem', color: '#6B6B65', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{s.label}</div>
                      <div style={{ fontSize: '0.95rem', color: '#F5F2EE' }}>{String(s.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.precio_texto && (
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <p style={{ fontSize: '0.65rem', color: '#C9A96E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Precio</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F2EE' }}>{selected.precio_texto}</p>
                </div>
              )}

              <div style={{ padding: '2rem' }}>
                {selected.estado === 'disponible' ? (
                  <div>
                    <a href={`https://wa.me/${WA}?text=Hola, me interesa la Unidad ${selected.codigo} de ${edificio?.nombre}`} target="_blank"
                      style={{ display: 'block', textAlign: 'center', background: '#C9A96E', color: '#0A0A0A', padding: '1rem', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '0.8rem' }}>
                      Consultar por WhatsApp
                    </a>
                    <a href="mailto:info@sofiadesarrollos.com.ar"
                      style={{ display: 'block', textAlign: 'center', border: '1px solid rgba(201,169,110,0.3)', color: '#C9A96E', padding: '1rem', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                      Enviar email
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B6B65' }}>
                    {selected.estado === 'reservado' ? 'Esta unidad esta reservada' : 'Esta unidad ya fue vendida'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B6B65' }}>Selecciona una unidad</div>
          )}
        </div>
      </div>
    </main>
  )
}