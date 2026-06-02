'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const RENDER = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_render.jpg'

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  'en-construccion':   { label: 'En construcción',   color: '#CEA279' },
  'entrega-inmediata': { label: 'Entrega inmediata', color: '#5BC47A' },
  'proximamente':      { label: 'Próximamente',      color: '#7090E0' },
  'entregado':         { label: 'Entregado',         color: '#7A9BA8' },
}

export default function AdminDashboard() {
  const [edificio, setEdificio] = useState<any>(null)
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: eds } = await supabase
        .from('edificios').select('*').eq('activo', true).order('orden').limit(1)
      if (eds && eds.length > 0) {
        setEdificio(eds[0])
        const { data: uns } = await supabase
          .from('unidades').select('id, estado').eq('edificio_id', eds[0].id)
        setUnidades(uns ?? [])
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const disponibles = unidades.filter(u => u.estado === 'disponible').length
  const reservadas  = unidades.filter(u => u.estado === 'reservado').length
  const vendidas    = unidades.filter(u => u.estado === 'vendido').length
  const estado = edificio ? (ESTADO_LABEL[edificio.estado] ?? { label: edificio.estado, color: '#7A9BA8' }) : null

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.5rem' }}>
          Panel de gestión
        </p>
        <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA' }}>
          Dashboard
        </h1>
      </div>

      {loading ? (
        <p style={{ color: '#7A9BA8' }}>Cargando...</p>
      ) : !edificio ? (
        <div style={{ border: '1px dashed rgba(206,162,121,0.2)', padding: '4rem', textAlign: 'center', color: '#7A9BA8' }}>
          <p style={{ marginBottom: '1rem' }}>No hay ningún proyecto activo.</p>
          <Link href="/admin/edificios/nuevo" style={{ color: '#CEA279', textDecoration: 'none', fontSize: '0.82rem' }}>
            + Crear proyecto
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2px', border: '1px solid rgba(206,162,121,0.15)', maxWidth: '900px' }}>

          {/* Imagen */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: '360px' }}>
            <img
              src={edificio.imagen_principal || RENDER}
              alt={edificio.nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,45,56,0.8) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
              <img src={LOGO} alt="Cardinal" style={{ height: '28px', filter: 'brightness(0) invert(1)', display: 'block' }} />
            </div>
            {estado && (
              <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'rgba(10,45,56,0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.9rem', border: `1px solid ${estado.color}` }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: estado.color }}>
                  {estado.label}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ background: '#0D3542', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: '#F5F0EA', marginBottom: '0.3rem' }}>
                {edificio.nombre}
              </h2>
              {edificio.direccion && (
                <p style={{ fontSize: '0.78rem', color: '#7A9BA8', marginBottom: '1.5rem' }}>{edificio.direccion}</p>
              )}

              {/* Stats unidades */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(206,162,121,0.1)', marginBottom: '2rem' }}>
                {[
                  { num: disponibles, label: 'Disponibles', color: '#5BC47A' },
                  { num: reservadas,  label: 'Reservadas',  color: '#CEA279' },
                  { num: vendidas,    label: 'Vendidas',    color: '#E07070' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '1.2rem', background: '#0A2D38', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.8rem', fontWeight: 300, color: s.color, lineHeight: 1, marginBottom: '0.3rem' }}>{s.num}</p>
                    <p style={{ fontSize: '0.58rem', color: '#7A9BA8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {edificio.entrega && (
                <p style={{ fontSize: '0.75rem', color: '#7A9BA8', marginBottom: '1.5rem' }}>
                  Entrega estimada: <span style={{ color: '#CEA279' }}>{edificio.entrega}</span>
                </p>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <Link href={`/admin/edificios/${edificio.id}/unidades`} style={{
                background: '#CEA279', color: '#0A2D38', padding: '0.9rem 1.5rem',
                fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                textDecoration: 'none', fontWeight: 500, textAlign: 'center',
                fontFamily: 'Panton, system-ui, sans-serif',
              }}>
                Gestionar unidades
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                <Link href={`/admin/edificios/${edificio.id}`} style={{
                  border: '1px solid rgba(206,162,121,0.3)', color: '#CEA279',
                  padding: '0.75rem', fontSize: '0.72rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center',
                }}>
                  Editar proyecto
                </Link>
                <Link href="/proyecto" target="_blank" style={{
                  border: '1px solid rgba(206,162,121,0.15)', color: '#7A9BA8',
                  padding: '0.75rem', fontSize: '0.72rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center',
                }}>
                  Ver página ↗
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
