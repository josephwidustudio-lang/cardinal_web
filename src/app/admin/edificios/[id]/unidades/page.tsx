'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const TIPOS = ['mono','1amb','2amb','3amb','4amb','ph','local']
const TIPO_LABEL: Record<string,string> = {
  mono:'Monoambiente','1amb':'1 amb.','2amb':'2 amb.','3amb':'3 amb.','4amb':'4 amb.',ph:'PH',local:'Local'
}
const BADGE: Record<string,any> = {
  disponible: { bg:'rgba(45,130,75,0.15)',   color:'#5BC47A', label:'Disponible' },
  reservado:  { bg:'rgba(201,169,110,0.15)', color:'#C9A96E', label:'Reservado'  },
  vendido:    { bg:'rgba(180,60,60,0.12)',   color:'#E07070', label:'Vendido'    },
}
const inputStyle = {
  background:'transparent', color:'#F5F2EE', fontSize:'0.85rem',
  padding:'0.4rem 0.6rem', outline:'none', fontFamily:'system-ui,sans-serif',
  border:'1px solid rgba(201,169,110,0.3)', width:'100%'
}
const formInputStyle = {
  width:'100%', background:'transparent', color:'#F5F2EE',
  fontSize:'0.85rem', padding:'0.6rem 0', outline:'none',
  border:'none', borderBottom:'1px solid rgba(201,169,110,0.25)',
  fontFamily:'system-ui,sans-serif'
}
const labelStyle = {
  display:'block', fontSize:'0.6rem', letterSpacing:'0.2em',
  textTransform:'uppercase' as const, color:'#C9A96E', marginBottom:'0.3rem'
}

export default function UnidadesPage() {
  const { id } = useParams()
  const [edificio,   setEdificio]   = useState<any>(null)
  const [unidades,   setUnidades]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [editingId,  setEditingId]  = useState<string|null>(null)
  const [editForm,   setEditForm]   = useState<any>({})
  const [uploading,  setUploading]  = useState<string|null>(null)
  const [form, setForm] = useState({
    codigo:'', tipo:'2amb', piso:'', m2:'', ambientes:'',
    dormitorios:'', banos:'', precio_texto:'', estado:'disponible'
  })

  useEffect(() => { cargarDatos() }, [id])

  async function cargarDatos() {
    setLoading(true)
    const [{ data: ed }, { data: un }] = await Promise.all([
      supabase.from('edificios').select('*').eq('id', id).single(),
      supabase.from('unidades').select('*').eq('edificio_id', id).order('piso')
    ])
    setEdificio(ed)
    setUnidades(un ?? [])
    setLoading(false)
  }

  async function cambiarEstado(unidadId: string, nuevoEstado: string) {
    await supabase.from('unidades').update({ estado: nuevoEstado }).eq('id', unidadId)
    cargarDatos()
  }

  async function eliminarUnidad(unidadId: string) {
    if (!confirm('Eliminar esta unidad?')) return
    await supabase.from('unidades').delete().eq('id', unidadId)
    cargarDatos()
  }

  function startEdit(u: any) {
    setEditingId(u.id)
    setEditForm({
      codigo: u.codigo, tipo: u.tipo, piso: u.piso ?? '',
      m2: u.m2 ?? '', ambientes: u.ambientes ?? '',
      dormitorios: u.dormitorios ?? '', banos: u.banos ?? '',
      precio_texto: u.precio_texto ?? '', estado: u.estado,
      imagen_axo: u.imagen_axo ?? ''
    })
  }

  async function saveEdit(unidadId: string) {
    setSaving(true)
    await supabase.from('unidades').update({
      codigo:       editForm.codigo,
      tipo:         editForm.tipo,
      piso:         editForm.piso,
      m2:           editForm.m2 ? parseFloat(editForm.m2) : null,
      ambientes:    editForm.ambientes ? parseInt(editForm.ambientes) : null,
      dormitorios:  editForm.dormitorios ? parseInt(editForm.dormitorios) : null,
      banos:        editForm.banos ? parseInt(editForm.banos) : null,
      precio_texto: editForm.precio_texto,
      estado:       editForm.estado,
    }).eq('id', unidadId)
    setEditingId(null)
    setSaving(false)
    cargarDatos()
  }

  async function handleAxoUpload(unidadId: string, file: File) {
    setUploading(unidadId)
    const ext = file.name.split('.').pop()
    const path = `edificios/${id}/unidades/${unidadId}/axo.${ext}`
    const { error } = await supabase.storage.from('imagenes').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
      await supabase.from('unidades').update({ imagen_axo: data.publicUrl }).eq('id', unidadId)
      cargarDatos()
    }
    setUploading(null)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('unidades').insert([{
      edificio_id:  id,
      codigo:       form.codigo,
      tipo:         form.tipo,
      piso:         form.piso,
      m2:           form.m2 ? parseFloat(form.m2) : null,
      ambientes:    form.ambientes ? parseInt(form.ambientes) : null,
      dormitorios:  form.dormitorios ? parseInt(form.dormitorios) : null,
      banos:        form.banos ? parseInt(form.banos) : null,
      precio_texto: form.precio_texto,
      estado:       form.estado,
    }])
    setForm({ codigo:'', tipo:'2amb', piso:'', m2:'', ambientes:'', dormitorios:'', banos:'', precio_texto:'', estado:'disponible' })
    setShowForm(false)
    setSaving(false)
    cargarDatos()
  }

  if (loading) return <div style={{ color:'#6B6B65', padding:'3rem' }}>Cargando...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <div>
          <Link href="/admin/edificios" style={{ fontSize:'0.72rem', color:'#6B6B65', textDecoration:'none' }}>← Edificios</Link>
          <h1 style={{ fontFamily:'Georgia, serif', fontSize:'2rem', fontWeight:300, color:'#F5F2EE', marginTop:'0.3rem' }}>
            {edificio?.nombre} — Unidades
          </h1>
          <p style={{ color:'#6B6B65', fontSize:'0.85rem' }}>
            {unidades.length} unidades · {unidades.filter(u=>u.estado==='disponible').length} disponibles
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:'#C9A96E', color:'#0A0A0A', padding:'0.8rem 1.8rem',
          fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase',
          border:'none', cursor:'pointer', fontWeight:500
        }}>
          {showForm ? 'Cancelar' : '+ Nueva unidad'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background:'#1C1C1C', padding:'2rem', marginBottom:'2rem', border:'1px solid rgba(201,169,110,0.2)' }}>
          <h3 style={{ fontFamily:'Georgia, serif', fontSize:'1.2rem', fontWeight:300, color:'#F5F2EE', marginBottom:'1.5rem' }}>Nueva unidad</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem', marginBottom:'1.5rem' }}>
            <div><label style={labelStyle}>Código *</label>
              <input value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} placeholder="101" required style={formInputStyle} /></div>
            <div><label style={labelStyle}>Tipo</label>
              <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={{ ...formInputStyle, cursor:'pointer' }}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}</select></div>
            <div><label style={labelStyle}>Piso</label>
              <input value={form.piso} onChange={e=>setForm({...form,piso:e.target.value})} placeholder="3°" style={formInputStyle} /></div>
            <div><label style={labelStyle}>m²</label>
              <input type="number" value={form.m2} onChange={e=>setForm({...form,m2:e.target.value})} placeholder="68" style={formInputStyle} /></div>
            <div><label style={labelStyle}>Ambientes</label>
              <input type="number" value={form.ambientes} onChange={e=>setForm({...form,ambientes:e.target.value})} placeholder="2" style={formInputStyle} /></div>
            <div><label style={labelStyle}>Dormitorios</label>
              <input type="number" value={form.dormitorios} onChange={e=>setForm({...form,dormitorios:e.target.value})} placeholder="1" style={formInputStyle} /></div>
            <div><label style={labelStyle}>Baños</label>
              <input type="number" value={form.banos} onChange={e=>setForm({...form,banos:e.target.value})} placeholder="1" style={formInputStyle} /></div>
            <div><label style={labelStyle}>Precio</label>
              <input value={form.precio_texto} onChange={e=>setForm({...form,precio_texto:e.target.value})} placeholder="USD 138.000" style={formInputStyle} /></div>
          </div>
          <div style={{ marginBottom:'1.5rem' }}>
            <label style={labelStyle}>Estado</label>
            <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={{ ...formInputStyle, cursor:'pointer', maxWidth:'200px' }}>
              <option value="disponible">🟢 Disponible</option>
              <option value="reservado">🟡 Reservado</option>
              <option value="vendido">🔴 Vendido</option>
            </select>
          </div>
          <button type="submit" disabled={saving} style={{
            background:'#C9A96E', color:'#0A0A0A', padding:'0.8rem 2rem',
            fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase',
            border:'none', cursor:'pointer', fontWeight:500
          }}>{saving ? 'Guardando...' : 'Guardar unidad'}</button>
        </form>
      )}

      {unidades.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', border:'1px dashed rgba(201,169,110,0.2)', color:'#6B6B65' }}>
          No hay unidades cargadas. Agrega la primera.
        </div>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Código','Tipo','Piso','m²','Dorm.','Baños','Precio','Estado','Axo','Acciones'].map(h => (
                <th key={h} style={{
                  textAlign:'left', padding:'0.8rem 0.8rem',
                  fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase',
                  color:'#6B6B65', borderBottom:'1px solid rgba(201,169,110,0.1)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                {editingId === u.id ? (
                  <>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input value={editForm.codigo} onChange={e=>setEditForm({...editForm,codigo:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}>
                      <select value={editForm.tipo} onChange={e=>setEditForm({...editForm,tipo:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                        {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input value={editForm.piso} onChange={e=>setEditForm({...editForm,piso:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input type="number" value={editForm.m2} onChange={e=>setEditForm({...editForm,m2:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input type="number" value={editForm.dormitorios} onChange={e=>setEditForm({...editForm,dormitorios:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input type="number" value={editForm.banos} onChange={e=>setEditForm({...editForm,banos:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}><input value={editForm.precio_texto} onChange={e=>setEditForm({...editForm,precio_texto:e.target.value})} style={inputStyle} /></td>
                    <td style={{ padding:'0.6rem 0.8rem' }}>
                      <select value={editForm.estado} onChange={e=>setEditForm({...editForm,estado:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                        <option value="disponible">🟢 Disponible</option>
                        <option value="reservado">🟡 Reservado</option>
                        <option value="vendido">🔴 Vendido</option>
                      </select>
                    </td>
                    <td style={{ padding:'0.6rem 0.8rem', color:'#6B6B65', fontSize:'0.72rem' }}>—</td>
                    <td style={{ padding:'0.6rem 0.8rem' }}>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button onClick={() => saveEdit(u.id)} disabled={saving} style={{
                          background:'#5BC47A', color:'#0A0A0A', border:'none',
                          padding:'0.4rem 0.8rem', fontSize:'0.65rem', cursor:'pointer', fontWeight:500
                        }}>{saving ? '...' : '✓'}</button>
                        <button onClick={() => setEditingId(null)} style={{
                          background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
                          color:'#6B6B65', padding:'0.4rem 0.8rem', fontSize:'0.65rem', cursor:'pointer'
                        }}>✕</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding:'0.8rem', color:'#F5F2EE', fontWeight:500 }}>{u.codigo}</td>
                    <td style={{ padding:'0.8rem', color:'#C8C8C0' }}>{TIPO_LABEL[u.tipo] ?? u.tipo}</td>
                    <td style={{ padding:'0.8rem', color:'#C8C8C0' }}>{u.piso ?? '—'}</td>
                    <td style={{ padding:'0.8rem', color:'#C8C8C0' }}>{u.m2 ? `${u.m2}m²` : '—'}</td>
                    <td style={{ padding:'0.8rem', color:'#C8C8C0' }}>{u.dormitorios ?? '—'}</td>
                    <td style={{ padding:'0.8rem', color:'#C8C8C0' }}>{u.banos ?? '—'}</td>
                    <td style={{ padding:'0.8rem', color:'#F5F2EE' }}>{u.precio_texto ?? '—'}</td>
                    <td style={{ padding:'0.8rem' }}>
                      <select value={u.estado} onChange={e => cambiarEstado(u.id, e.target.value)} style={{
                        background: BADGE[u.estado]?.bg, color: BADGE[u.estado]?.color,
                        border:`1px solid ${BADGE[u.estado]?.color}`,
                        padding:'0.3rem 0.5rem', fontSize:'0.6rem',
                        letterSpacing:'0.1em', textTransform:'uppercase',
                        cursor:'pointer', outline:'none', fontFamily:'system-ui'
                      }}>
                        <option value="disponible">🟢 Disponible</option>
                        <option value="reservado">🟡 Reservado</option>
                        <option value="vendido">🔴 Vendido</option>
                      </select>
                    </td>
                    <td style={{ padding:'0.8rem' }}>
                      <label style={{ cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
                        {u.imagen_axo ? (
                          <img src={u.imagen_axo} alt="axo" style={{ width:'40px', height:'40px', objectFit:'cover', display:'block' }} />
                        ) : (
                          <span style={{ fontSize:'0.6rem', color:'#6B6B65', whiteSpace:'nowrap' }}>
                            {uploading === u.id ? 'Subiendo...' : '+ Subir'}
                          </span>
                        )}
                        <input type="file" accept="image/*" style={{ display:'none' }}
                          onChange={e => { const f = e.target.files?.[0]; if(f) handleAxoUpload(u.id, f) }}
                          disabled={uploading === u.id} />
                      </label>
                    </td>
                    <td style={{ padding:'0.8rem' }}>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button onClick={() => startEdit(u)} style={{
                          background:'transparent', border:'1px solid rgba(201,169,110,0.3)',
                          color:'#C9A96E', padding:'0.3rem 0.7rem', fontSize:'0.65rem', cursor:'pointer'
                        }}>Editar</button>
                        <button onClick={() => eliminarUnidad(u.id)} style={{
                          background:'transparent', border:'1px solid rgba(224,112,112,0.3)',
                          color:'#E07070', padding:'0.3rem 0.7rem', fontSize:'0.65rem', cursor:'pointer'
                        }}>Eliminar</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}