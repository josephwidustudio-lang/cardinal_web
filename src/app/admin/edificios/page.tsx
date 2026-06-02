'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  'en-construccion':   { label: 'En construcción',   color: '#C9A96E' },
  'entrega-inmediata': { label: 'Entrega inmediata', color: '#5BC47A' },
  'proximamente':      { label: 'Próximamente',      color: '#7090E0' },
  'entregado':         { label: 'Entregado',         color: '#6B6B65' },
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

  if (loading) return <div style={{ color: '#6B6B65', padding: '3rem' }}>Cargando...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F2EE' }}>
            Edificios
          </h1>
          <p style={{ color: '#6B6B65', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {edificios.length} proyectos cargados
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={cargarEdificios} style={{
            background: 'transparent', border: '1px solid rgba(201,169,110,0.3)',
            color: '#C9A96E', padding: '0.6rem 1.2rem',
            fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer'
          }}>↺ Actualizar</button>
          <Link href="/admin/edificios/nuevo" style={{
            background: '#C9A96E', color: '#0A0A0A', padding: '0.8rem 1.8rem',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 500
          }}>+ Nuevo edificio</Link>
        </div>
      </div>

      {edificios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed rgba(201,169,110,0.2)', color: '#6B6B65' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No hay edificios cargados aún</p>
          <Link href="/admin/edificios/nuevo" style={{ color: '#C9A96E', textDecoration: 'none' }}>+ Agregar el primero</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {edificios.map((e: any) => {
            const unidades = e.unidades ?? []
            const disponibles = unidades.filter((u: any) => u.estado === 'disponible').length
            const reservadas  = unidades.filter((u: any) => u.estado === 'reservado').length
            const vendidas    = unidades.filter((u: any) => u.estado === 'vendido').length
            const estado = ESTADO_LABEL[e.estado] ?? { label: e.estado, color: '#6B6B65' }

            return (
              <div key={e.id} style={{
                background: '#1C1C1C', padding: '1.5rem 2rem',
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
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: '#F5F2EE' }}>
                      {e.nombre}
                    </h3>
                    <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: estado.color }}>
                      {estado.label}
                    </span>
                  </div>
                  {e.direccion && <p style={{ fontSize: '0.78rem', color: '#6B6B65', marginBottom: '0.5rem' }}>{e.direccion}</p>}
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#5BC47A' }}>🟢 {disponibles} disponibles</span>
                    <span style={{ fontSize: '0.72rem', color: '#C9A96E' }}>🟡 {reservadas} reservadas</span>
                    <span style={{ fontSize: '0.72rem', color: '#E07070' }}>🔴 {vendidas} vendidas</span>
                    <span style={{ fontSize: '0.72rem', color: '#6B6B65' }}>Total: {unidades.length}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', flexShrink: 0 }}>
                  <Link href={`/admin/edificios/${e.id}`} style={{
                    padding: '0.6rem 1.2rem', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.3)',
                    color: '#C9A96E', textDecoration: 'none'
                  }}>Editar</Link>
                  <Link href={`/admin/edificios/${e.id}/unidades`} style={{
                    padding: '0.6rem 1.2rem', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', background: 'rgba(201,169,110,0.1)',
                    color: '#C9A96E', textDecoration: 'none'
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