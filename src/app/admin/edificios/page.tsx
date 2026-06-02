'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  'en-construccion':   { label: 'En construcción',   color: '#CEA279' },
  'entrega-inmediata': { label: 'Entrega inmediata', color: '#5BC47A' },
  'proximamente':      { label: 'Próximamente',      color: '#7090E0' },
  'entregado':         { label: 'Entregado',         color: '#7A9BA8' },
}

export default function EdificiosPage() {
  const [edificios, setEdificios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarEdificios() }, [])

  async function cargarEdificios() {
    setLoading(true)
    const { data } = await supabase
      .from('edificios')
      .select('*, unidades(id, estado)')
      .order('orden')
    setEdificios(data ?? [])
    setLoading(false)
  }

  async function eliminarEdificio(id: string) {
    if (!confirm('¿Eliminar este edificio y todas sus unidades?')) return
    await supabase.from('edificios').delete().eq('id', id)
    cargarEdificios()
  }

  if (loading) return <div style={{ color: '#7A9BA8', padding: '3rem' }}>Cargando...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Panton, Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA' }}>
            Edificios
          </h1>
          <p style={{ color: '#7A9BA8', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {edificios.length} proyectos cargados
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={cargarEdificios} style={{
            background: 'transparent', border: '1px solid rgba(206,162,121,0.3)',
            color: '#CEA279', padding: '0.6rem 1.2rem',
            fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer'
          }}>↺ Actualizar</button>
          <Link href="/admin/edificios/nuevo" style={{
            background: '#CEA279', color: '#0A2D38', padding: '0.8rem 1.8rem',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 500
          }}>+ Nuevo edificio</Link>
        </div>
      </div>

      {edificios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed rgba(206,162,121,0.2)', color: '#7A9BA8' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No hay edificios cargados aún</p>
          <Link href="/admin/edificios/nuevo" style={{ color: '#CEA279', textDecoration: 'none' }}>+ Agregar el primero</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {edificios.map((e: any) => {
            const unidades = e.unidades ?? []
            const disponibles = unidades.filter((u: any) => u.estado === 'disponible').length
            const reservadas  = unidades.filter((u: any) => u.estado === 'reservado').length
            const vendidas    = unidades.filter((u: any) => u.estado === 'vendido').length
            const estado = ESTADO_LABEL[e.estado] ?? { label: e.estado, color: '#7A9BA8' }

            return (
              <div key={e.id} style={{
                background: '#0D3542', padding: '1.5rem 2rem',
                display: 'flex', alignItems: 'center', gap: '2rem',
                borderLeft: `3px solid ${estado.color}`
              }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, background: '#2C2C2C', overflow: 'hidden' }}>
                  {e.imagen_principal && (
                    <img src={e.imagen_principal} alt={e.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontFamily: 'Panton, Panton, Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: '#F5F0EA' }}>
                      {e.nombre}
                    </h3>
                    <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: estado.color }}>
                      {estado.label}
                    </span>
                  </div>
                  {e.direccion && <p style={{ fontSize: '0.78rem', color: '#7A9BA8', marginBottom: '0.5rem' }}>{e.direccion}</p>}
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#5BC47A' }}>🟢 {disponibles} disponibles</span>
                    <span style={{ fontSize: '0.72rem', color: '#CEA279' }}>🟡 {reservadas} reservadas</span>
                    <span style={{ fontSize: '0.72rem', color: '#E07070' }}>🔴 {vendidas} vendidas</span>
                    <span style={{ fontSize: '0.72rem', color: '#7A9BA8' }}>Total: {unidades.length}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', flexShrink: 0 }}>
                  <Link href={`/admin/edificios/${e.id}`} style={{
                    padding: '0.6rem 1.2rem', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', border: '1px solid rgba(206,162,121,0.3)',
                    color: '#CEA279', textDecoration: 'none'
                  }}>Editar</Link>
                  <Link href={`/admin/edificios/${e.id}/unidades`} style={{
                    padding: '0.6rem 1.2rem', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', background: 'rgba(206,162,121,0.1)',
                    color: '#CEA279', textDecoration: 'none'
                  }}>Unidades</Link>
                  <button onClick={() => eliminarEdificio(e.id)} style={{
                    padding: '0.6rem 1.2rem', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', border: '1px solid rgba(224,112,112,0.2)',
                    color: '#E07070', background: 'transparent', cursor: 'pointer'
                  }}>Eliminar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}