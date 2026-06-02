'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevoEdificio() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    estado: 'en-construccion',
    entrega: '',
    orden: 0,
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.from('edificios').insert([form])
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('✓ Edificio creado correctamente')
      setTimeout(() => {
        router.push('/admin/edificios')
        router.refresh()
      }, 800)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'transparent', color: '#F5F2EE',
    fontSize: '0.9rem', padding: '0.75rem 0', outline: 'none',
    border: 'none', borderBottom: '1px solid rgba(201,169,110,0.25)',
    fontFamily: 'system-ui, sans-serif', marginBottom: '2rem'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const, color: '#C9A96E', marginBottom: '0.5rem'
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F2EE' }}>
          Nuevo edificio
        </h1>
        <p style={{ color: '#6B6B65', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          Completá la información básica del proyecto
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label style={labelStyle}>Nombre del proyecto *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange}
            placeholder="Ej: SOFIA X" required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Dirección</label>
          <input name="direccion" value={form.direccion} onChange={handleChange}
            placeholder="Ej: Bv. Gálvez 1471, Santa Fe" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
            placeholder="Descripción del proyecto..." rows={4}
            style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={labelStyle}>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="en-construccion">En construcción</option>
              <option value="entrega-inmediata">Entrega inmediata</option>
              <option value="proximamente">Próximamente</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Entrega estimada</label>
            <input name="entrega" value={form.entrega} onChange={handleChange}
              placeholder="Ej: Marzo 2026" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Orden en home (1 = primero)</label>
          <input name="orden" type="number" value={form.orden} onChange={handleChange}
            style={inputStyle} />
        </div>

        {msg && (
          <p style={{ color: msg.includes('Error') ? '#E07070' : '#5BC47A', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {msg}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} style={{
            background: '#C9A96E', color: '#0A0A0A', padding: '1rem 2.5rem',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            border: 'none', cursor: 'pointer', fontWeight: 500, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Guardando...' : 'Crear edificio'}
          </button>
          <a href="/admin/edificios" style={{
            padding: '1rem 2rem', fontSize: '0.78rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.3)',
            color: '#6B6B65', textDecoration: 'none'
          }}>
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
