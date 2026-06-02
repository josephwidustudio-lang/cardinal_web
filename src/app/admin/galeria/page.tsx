'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function GaleriaAdmin() {
  const [imagenes, setImagenes]   = useState<any[]>([])
  const [edificioId, setEdificioId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]             = useState('')
  const [editId, setEditId]       = useState<string | null>(null)
  const [editOrden, setEditOrden] = useState<number>(0)
  const [lightbox, setLightbox]   = useState<string | null>(null)
  const [hoverId, setHoverId]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data: eds } = await supabase.from('edificios').select('id').eq('activo', true).order('orden').limit(1)
    if (eds && eds.length > 0) {
      const id = eds[0].id
      setEdificioId(id)
      const { data: imgs } = await supabase
        .from('edificio_imagenes').select('*').eq('edificio_id', id).order('orden')
      setImagenes(imgs ?? [])
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []) as File[]
    if (!files.length || !edificioId) return
    setUploading(true)
    setMsg('')
    let count = 0
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `edificios/${edificioId}/galeria/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('imagenes').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
        await supabase.from('edificio_imagenes').insert([{
          edificio_id: edificioId,
          url: data.publicUrl,
          categoria: 'galeria',
          orden: imagenes.length + count,
        }])
        count++
      }
    }
    setMsg(`✓ ${count} imagen${count !== 1 ? 'es' : ''} subida${count !== 1 ? 's' : ''} correctamente`)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    cargar()
  }

  async function handleEliminar(img: any) {
    if (!confirm('¿Eliminar esta imagen?')) return
    await supabase.from('edificio_imagenes').delete().eq('id', img.id)
    // Intentar borrar del storage
    const path = img.url.split('/imagenes/')[1]
    if (path) await supabase.storage.from('imagenes').remove([path])
    setMsg('✓ Imagen eliminada')
    cargar()
  }

  async function handleGuardarOrden(img: any) {
    await supabase.from('edificio_imagenes').update({ orden: editOrden }).eq('id', img.id)
    setEditId(null)
    setMsg('✓ Orden actualizado')
    cargar()
  }

  const labelStyle = {
    display: 'block', fontSize: '0.62rem', letterSpacing: '0.25em',
    textTransform: 'uppercase' as const, color: '#CEA279', marginBottom: '0.5rem'
  }

  if (loading) return <div style={{ color: '#7A9BA8', padding: '3rem' }}>Cargando...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.4rem' }}>Panel</p>
          <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA' }}>Galería</h1>
          <p style={{ color: '#7A9BA8', fontSize: '0.85rem', marginTop: '0.3rem' }}>{imagenes.length} imágenes en la galería</p>
        </div>

        {/* Upload */}
        <label style={{
          background: '#CEA279', color: '#0A2D38', padding: '0.85rem 1.8rem',
          fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: uploading ? 'default' : 'pointer', fontWeight: 500,
          opacity: uploading ? 0.7 : 1, display: 'inline-block',
          fontFamily: 'Panton, system-ui, sans-serif',
        }}>
          {uploading ? 'Subiendo...' : '+ Subir imágenes'}
          <input
            ref={fileRef}
            type="file" accept="image/*" multiple
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {msg && (
        <p style={{ color: msg.includes('Error') ? '#E07070' : '#5BC47A', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          {msg}
        </p>
      )}

      {/* Grid */}
      {imagenes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed rgba(206,162,121,0.2)', color: '#7A9BA8' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>No hay imágenes en la galería</p>
          <p style={{ fontSize: '0.82rem' }}>Hacé click en Subir imágenes para agregar fotos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '3px' }}>
          {imagenes.map(img => (
            <div
              key={img.id}
              onMouseEnter={() => setHoverId(img.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#0D3542' }}
            >
              {/* Imagen */}
              <img
                src={img.url} alt=""
                onClick={() => setLightbox(img.url)}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  cursor: 'zoom-in',
                  transform: hoverId === img.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                }}
              />

              {/* Overlay con acciones */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,45,56,0.75)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                opacity: hoverId === img.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
                padding: '1rem',
              }}>
                {/* Orden */}
                {editId === img.id ? (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={editOrden}
                      onChange={e => setEditOrden(parseInt(e.target.value))}
                      style={{
                        width: '60px', background: 'transparent',
                        border: '1px solid rgba(206,162,121,0.4)',
                        color: '#F5F0EA', padding: '0.3rem 0.5rem',
                        fontSize: '0.78rem', outline: 'none', textAlign: 'center',
                      }}
                    />
                    <button onClick={() => handleGuardarOrden(img)} style={{
                      background: '#5BC47A', border: 'none', color: '#0A2D38',
                      padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500,
                    }}>✓</button>
                    <button onClick={() => setEditId(null)} style={{
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#7A9BA8', padding: '0.3rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer',
                    }}>✕</button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: 'rgba(206,162,121,0.7)', letterSpacing: '0.1em' }}>
                    Orden: {img.orden ?? '—'}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { setLightbox(img.url) }}
                    style={{
                      background: 'rgba(206,162,121,0.15)', border: '1px solid rgba(206,162,121,0.3)',
                      color: '#CEA279', padding: '0.45rem 0.9rem',
                      fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}>Ver</button>
                  <button
                    onClick={() => { setEditId(img.id); setEditOrden(img.orden ?? 0) }}
                    style={{
                      background: 'rgba(206,162,121,0.15)', border: '1px solid rgba(206,162,121,0.3)',
                      color: '#CEA279', padding: '0.45rem 0.9rem',
                      fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}>Orden</button>
                  <button
                    onClick={() => handleEliminar(img)}
                    style={{
                      background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.3)',
                      color: '#E07070', padding: '0.45rem 0.9rem',
                      fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
}
