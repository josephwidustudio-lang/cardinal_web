'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function GaleriaAdmin() {
  const [imagenes, setImagenes]     = useState<any[]>([])
  const [edificioId, setEdificioId] = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [msg, setMsg]               = useState('')
  const [lightbox, setLightbox]     = useState<string | null>(null)
  const [hoverId, setHoverId]       = useState<string | null>(null)

  // Form subida
  const [tituloUpload, setTituloUpload] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Modal edición
  const [editImg, setEditImg]       = useState<any | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editOrden, setEditOrden]   = useState(0)
  const [editFile, setEditFile]     = useState<File | null>(null)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data: eds } = await supabase.from('edificios').select('id').eq('activo', true).order('orden').limit(1)
    if (eds && eds.length > 0) {
      const id = eds[0].id
      setEdificioId(id)
      const { data: imgs } = await supabase.from('edificio_imagenes').select('*').eq('edificio_id', id).order('orden')
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
          titulo: tituloUpload || null,
        }])
        count++
      }
    }
    setMsg(`✓ ${count} imagen${count !== 1 ? 'es' : ''} subida${count !== 1 ? 's' : ''} correctamente`)
    setUploading(false)
    setTituloUpload('')
    if (fileRef.current) fileRef.current.value = ''
    cargar()
  }

  async function handleEliminar(img: any) {
    if (!confirm('¿Eliminar esta imagen?')) return
    await supabase.from('edificio_imagenes').delete().eq('id', img.id)
    const path = img.url.split('/imagenes/')[1]
    if (path) await supabase.storage.from('imagenes').remove([path])
    setMsg('✓ Imagen eliminada')
    cargar()
  }

  function abrirEditar(img: any) {
    setEditImg(img)
    setEditTitulo(img.titulo ?? '')
    setEditOrden(img.orden ?? 0)
    setEditFile(null)
  }

  async function handleGuardarEdicion() {
    if (!editImg || !edificioId) return
    setSaving(true)
    let urlActualizada = editImg.url

    // Si cambió la imagen, subir nueva
    if (editFile) {
      const ext = editFile.name.split('.').pop()
      const path = `edificios/${edificioId}/galeria/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('imagenes').upload(path, editFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
        urlActualizada = data.publicUrl
        // Borrar imagen anterior del storage
        const oldPath = editImg.url.split('/imagenes/')[1]
        if (oldPath) await supabase.storage.from('imagenes').remove([oldPath])
      }
    }

    await supabase.from('edificio_imagenes').update({
      titulo: editTitulo || null,
      orden: editOrden,
      url: urlActualizada,
    }).eq('id', editImg.id)

    setMsg('✓ Imagen actualizada correctamente')
    setSaving(false)
    setEditImg(null)
    cargar()
  }

  const inputStyle = {
    background: 'transparent', color: '#F5F0EA', fontSize: '0.85rem',
    padding: '0.6rem 0.8rem', outline: 'none',
    border: '1px solid rgba(206,162,121,0.25)',
    fontFamily: 'Panton, system-ui, sans-serif', width: '100%',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.6rem', letterSpacing: '0.22em',
    textTransform: 'uppercase' as const, color: '#CEA279', marginBottom: '0.4rem'
  }

  if (loading) return <div style={{ color: '#7A9BA8', padding: '3rem' }}>Cargando...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.4rem' }}>Panel</p>
        <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA' }}>Galería</h1>
        <p style={{ color: '#7A9BA8', fontSize: '0.85rem', marginTop: '0.3rem' }}>{imagenes.length} imágenes en la galería</p>
      </div>

      {/* Upload box */}
      <div style={{ background: '#0D3542', border: '1px solid rgba(206,162,121,0.15)', padding: '1.8rem', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.72rem', color: '#CEA279', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Subir nuevas imágenes</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Título (opcional)</label>
            <input
              value={tituloUpload}
              onChange={e => setTituloUpload(e.target.value)}
              placeholder="Ej: Dormitorio principal"
              style={inputStyle}
            />
          </div>
          <label style={{
            background: uploading ? 'rgba(206,162,121,0.3)' : '#CEA279',
            color: '#0A2D38', padding: '0.65rem 1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: uploading ? 'default' : 'pointer', fontWeight: 500,
            display: 'inline-block', whiteSpace: 'nowrap',
            fontFamily: 'Panton, system-ui, sans-serif',
          }}>
            {uploading ? 'Subiendo...' : '+ Elegir archivos'}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#7A9BA8', marginTop: '0.8rem' }}>Podés seleccionar múltiples imágenes a la vez. El título se aplica a todas las imágenes subidas en esta tanda.</p>
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
          <p style={{ fontSize: '0.82rem' }}>Usá el formulario de arriba para agregar fotos</p>
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
              <img
                src={img.url} alt={img.titulo ?? ''}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transform: hoverId === img.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                }}
              />

              {/* Titulo */}
              {img.titulo && (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'rgba(10,45,56,0.85)', backdropFilter: 'blur(4px)',
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.62rem', color: '#CEA279', letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>{img.titulo}</div>
              )}

              {/* Orden badge */}
              <div style={{
                position: 'absolute', top: '0.5rem', left: '0.5rem',
                background: 'rgba(10,45,56,0.7)', padding: '0.2rem 0.5rem',
                fontSize: '0.6rem', color: '#7A9BA8',
              }}>#{img.orden ?? '—'}</div>

              {/* Overlay acciones */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,45,56,0.8)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                opacity: hoverId === img.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setLightbox(img.url)} style={{
                    background: 'rgba(206,162,121,0.15)', border: '1px solid rgba(206,162,121,0.3)',
                    color: '#CEA279', padding: '0.5rem 1rem',
                    fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>Ver</button>
                  <button onClick={() => abrirEditar(img)} style={{
                    background: 'rgba(206,162,121,0.15)', border: '1px solid rgba(206,162,121,0.3)',
                    color: '#CEA279', padding: '0.5rem 1rem',
                    fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>Editar</button>
                  <button onClick={() => handleEliminar(img)} style={{
                    background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.3)',
                    color: '#E07070', padding: '0.5rem 1rem',
                    fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {editImg && (
        <div onClick={() => setEditImg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(10,45,56,0.92)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0D3542', border: '1px solid rgba(206,162,121,0.2)',
            width: '100%', maxWidth: '520px', padding: '2.5rem',
            fontFamily: 'Panton, system-ui, sans-serif',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '1.4rem', fontWeight: 300, color: '#F5F0EA' }}>Editar imagen</h2>
              <button onClick={() => setEditImg(null)} style={{ background: 'transparent', border: 'none', color: '#7A9BA8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: '1.5rem', aspectRatio: '16/9', overflow: 'hidden', background: '#0A2D38' }}>
              <img
                src={editFile ? URL.createObjectURL(editFile) : editImg.url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Cambiar imagen */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Reemplazar imagen</label>
              <label style={{
                display: 'inline-block', border: '1px dashed rgba(206,162,121,0.3)',
                color: '#7A9BA8', padding: '0.6rem 1.2rem',
                fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.1em',
              }}>
                {editFile ? editFile.name : '+ Elegir nueva imagen'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => setEditFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            {/* Título */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Título</label>
              <input
                value={editTitulo}
                onChange={e => setEditTitulo(e.target.value)}
                placeholder="Ej: Living con balcón"
                style={inputStyle}
              />
            </div>

            {/* Orden */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Orden</label>
              <input
                type="number"
                value={editOrden}
                onChange={e => setEditOrden(parseInt(e.target.value))}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={handleGuardarEdicion} disabled={saving} style={{
                background: '#CEA279', color: '#0A2D38', border: 'none',
                padding: '0.9rem 2rem', fontSize: '0.72rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer',
                fontWeight: 500, opacity: saving ? 0.7 : 1,
                fontFamily: 'Panton, system-ui, sans-serif',
              }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              <button onClick={() => setEditImg(null)} style={{
                background: 'transparent', border: '1px solid rgba(206,162,121,0.2)',
                color: '#7A9BA8', padding: '0.9rem 1.5rem',
                fontSize: '0.72rem', cursor: 'pointer',
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,45,56,0.96)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
        }}>
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: '2rem', right: '2rem',
            background: 'transparent', border: '1px solid rgba(206,162,121,0.3)',
            color: '#CEA279', width: '44px', height: '44px', fontSize: '1.2rem', cursor: 'pointer',
          }}>✕</button>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'default' }} />
        </div>
      )}
    </div>
  )
}
