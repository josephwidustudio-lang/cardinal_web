'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditarEdificio() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [imagenes, setImagenes] = useState<any[]>([])
  const [form, setForm] = useState({
    nombre: '', descripcion: '', direccion: '',
    estado: 'en-construccion', entrega: '', orden: 0,
    imagen_principal: '', tour_360: ''
  })

  useEffect(() => { cargarDatos() }, [id])

  async function cargarDatos() {
    const [{ data: ed }, { data: imgs }] = await Promise.all([
      supabase.from('edificios').select('*').eq('id', id).single(),
      supabase.from('edificio_imagenes').select('*').eq('edificio_id', id).order('orden')
    ])
    if (ed) setForm({
      nombre: ed.nombre ?? '', descripcion: ed.descripcion ?? '',
      direccion: ed.direccion ?? '', estado: ed.estado ?? 'en-construccion',
      entrega: ed.entrega ?? '', orden: ed.orden ?? 0,
      imagen_principal: ed.imagen_principal ?? '', tour_360: ed.tour_360 ?? ''
    })
    setImagenes(imgs ?? [])
    setLoading(false)
  }

  async function handleSave(e: any) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('edificios').update(form).eq('id', id)
    setSaving(false)
    setMsg(error ? 'Error: ' + error.message : '✓ Guardado correctamente')
  }

  async function handleImagenPrincipal(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `edificios/${id}/principal.${ext}`
    const { error } = await supabase.storage.from('imagenes').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
      await supabase.from('edificios').update({ imagen_principal: data.publicUrl }).eq('id', id)
      setForm(f => ({ ...f, imagen_principal: data.publicUrl }))
      setMsg('✓ Imagen principal actualizada')
    }
    setUploading(false)
  }

  async function handleGaleria(e: any) {
    const files = Array.from(e.target.files ?? []) as File[]
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `edificios/${id}/galeria/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('imagenes').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
        await supabase.from('edificio_imagenes').insert([{
          edificio_id: id, url: data.publicUrl, categoria: 'galeria', orden: imagenes.length
        }])
      }
    }
    setUploading(false)
    cargarDatos()
    setMsg('✓ Imágenes agregadas a la galería')
  }

  async function eliminarImagen(imgId: string) {
    if (!confirm('¿Eliminar esta imagen?')) return
    await supabase.from('edificio_imagenes').delete().eq('id', imgId)
    cargarDatos()
  }

  const inputStyle = {
    width: '100%', background: 'transparent', color: '#F5F0EA',
    fontSize: '0.9rem', padding: '0.75rem 0', outline: 'none',
    border: 'none', borderBottom: '1px solid rgba(206,162,121,0.25)',
    fontFamily: 'system-ui, sans-serif', marginBottom: '1.5rem'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const, color: '#CEA279', marginBottom: '0.5rem'
  }

  if (loading) return <div style={{ color: '#7A9BA8', padding: '3rem' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/edificios" style={{ fontSize: '0.72rem', color: '#7A9BA8', textDecoration: 'none' }}>← Edificios</Link>
        <h1 style={{ fontFamily: 'Panton, Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA', marginTop: '0.3rem' }}>
          Editar — {form.nombre}
        </h1>
      </div>

      <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid rgba(206,162,121,0.15)' }}>
        {['Información', 'Imágenes', 'Tour 360°'].map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            background: 'transparent', border: 'none', padding: '0.8rem 1.5rem',
            fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: activeTab === i ? '#CEA279' : '#7A9BA8',
            borderBottom: activeTab === i ? '2px solid #CEA279' : '2px solid transparent',
            cursor: 'pointer', marginBottom: '-1px'
          }}>{tab}</button>
        ))}
      </div>

      {msg && <p style={{ color: msg.includes('Error') ? '#E07070' : '#5BC47A', fontSize: '0.85rem', marginBottom: '1rem' }}>{msg}</p>}

      {activeTab === 0 && (
        <form onSubmit={handleSave}>
          <label style={labelStyle}>Nombre *</label>
          <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={inputStyle} />
          <label style={labelStyle}>Dirección</label>
          <input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} style={inputStyle} />
          <label style={labelStyle}>Descripción</label>
          <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
            rows={4} style={{ ...inputStyle, resize: 'none' as const }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={labelStyle}>Estado</label>
              <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="en-construccion">En construcción</option>
                <option value="entrega-inmediata">Entrega inmediata</option>
                <option value="proximamente">Próximamente</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Entrega estimada</label>
              <input value={form.entrega} onChange={e => setForm({...form, entrega: e.target.value})} placeholder="Ej: Marzo 2026" style={inputStyle} />
            </div>
          </div>
          <label style={labelStyle}>Orden en home</label>
          <input type="number" value={form.orden} onChange={e => setForm({...form, orden: parseInt(e.target.value)})} style={inputStyle} />
          <button type="submit" disabled={saving} style={{
            background: '#CEA279', color: '#0A2D38', padding: '1rem 2.5rem',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            border: 'none', cursor: 'pointer', fontWeight: 500
          }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </form>
      )}

      {activeTab === 1 && (
        <div>
          <div style={{ marginBottom: '3rem' }}>
            <label style={labelStyle}>Imagen principal</label>
            {form.imagen_principal && (
              <img src={form.imagen_principal} alt="Principal" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '1rem', display: 'block' }} />
            )}
            <label style={{
              display: 'inline-block', background: '#0D3542',
              border: '1px dashed rgba(206,162,121,0.3)',
              padding: '1rem 2rem', cursor: 'pointer',
              fontSize: '0.78rem', color: '#CEA279', letterSpacing: '0.1em'
            }}>
              {uploading ? 'Subiendo...' : '+ Subir imagen principal'}
              <input type="file" accept="image/*" onChange={handleImagenPrincipal} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
          <div>
            <label style={labelStyle}>Galería de imágenes</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {imagenes.map(img => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <img src={img.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => eliminarImagen(img.id)} style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    color: '#E07070', padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer'
                  }}>✕</button>
                </div>
              ))}
            </div>
            <label style={{
              display: 'inline-block', background: '#0D3542',
              border: '1px dashed rgba(206,162,121,0.3)',
              padding: '1rem 2rem', cursor: 'pointer',
              fontSize: '0.78rem', color: '#CEA279', letterSpacing: '0.1em'
            }}>
              {uploading ? 'Subiendo...' : '+ Agregar imágenes a galería'}
              <input type="file" accept="image/*" multiple onChange={handleGaleria} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <label style={labelStyle}>URL del tour 360° (embed)</label>
          <input value={form.tour_360} onChange={e => setForm({...form, tour_360: e.target.value})}
            placeholder="Ej: https://kuula.co/share/..." style={inputStyle} />
          <p style={{ fontSize: '0.78rem', color: '#7A9BA8', marginBottom: '2rem' }}>
            Podés usar Kuula, Matterport o cualquier servicio con link embed.
          </p>
          {form.tour_360 && (
            <iframe src={form.tour_360} style={{ width: '100%', height: '400px', border: 'none', marginBottom: '1.5rem' }} />
          )}
          <button onClick={handleSave} style={{
            background: '#CEA279', color: '#0A2D38', padding: '1rem 2.5rem',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            border: 'none', cursor: 'pointer', fontWeight: 500
          }}>Guardar URL</button>
        </div>
      )}
    </div>
  )
}