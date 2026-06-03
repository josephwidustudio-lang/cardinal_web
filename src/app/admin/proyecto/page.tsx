'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'imagenes'
const PISOS = [9,8,7,6,5,4,3,2,1]

type Config = {
  id: string
  nombre: string
  direccion: string
  descripcion: string
  wa_number: string
  render_url: string
  frente_axo_url: string
  contrafrente_axo_url: string
  frente_dormitorios: number
  frente_m2: number
  frente_items: [string, string][]
  contrafrente_dormitorios: number
  contrafrente_m2: number
  contrafrente_items: [string, string][]
  precio_texto: string
  financiacion_texto: string
}

export default function AdminProyecto() {
  const [cfg, setCfg]       = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [tab, setTab]         = useState<'info' | 'fotos' | 'tipologias' | 'contacto'>('info')
  const [pisoSel, setPisoSel]   = useState(9)
  const [ladoSel, setLadoSel]   = useState<'frente'|'contrafrente'>('frente')
  const [unidades, setUnidades] = useState<any[]>([])
  const [savingU, setSavingU]   = useState<string | null>(null)
  const [edificioId, setEdificioId] = useState<string|null>(null)

  const renderRef   = useRef<HTMLInputElement>(null)
  const frenteRef   = useRef<HTMLInputElement>(null)
  const cfRef       = useRef<HTMLInputElement>(null)

  useEffect(() => { cargar() }, [])
  useEffect(() => { if (edificioId) cargarUnidades() }, [pisoSel, edificioId])

  async function cargar() {
    setLoading(true)
    const [{ data: cfgData }, { data: eds }] = await Promise.all([
      supabase.from('proyecto_config').select('*').limit(1).single(),
      supabase.from('edificios').select('id').eq('activo', true).order('orden').limit(1),
    ])
    if (cfgData) setCfg(cfgData)
    if (eds?.[0]) setEdificioId(eds[0].id)
    setLoading(false)
  }

  async function cargarUnidades() {
    const { data } = await supabase
      .from('unidades').select('*')
      .eq('edificio_id', edificioId)
      .eq('piso', pisoSel)
      .order('codigo')
    setUnidades(data ?? [])
  }

  async function actualizarEstado(id: string, estado: string) {
    setSavingU(id)
    await supabase.from('unidades').update({ estado }).eq('id', id)
    setSavingU(null)
    cargarUnidades()
  }

  // Guarda override de piso en proyecto_config.pisos_override
  async function guardarPisoOverride() {
    if (!cfg) return
    setSavingU('piso')
    const overrides = (cfg as any).pisos_override ?? {}
    const key = String(pisoSel)
    overrides[key] = { ...(overrides[key] ?? {}), [ladoSel]: pisoCfg }
    const { error } = await supabase.from('proyecto_config')
      .update({ pisos_override: overrides }).eq('id', cfg.id)
    setCfg((prev: any) => prev ? { ...prev, pisos_override: overrides } : prev)
    setMsg(error ? `✗ Error: ${error.message}` : `✓ Piso ${pisoSel} / ${ladoSel} guardado`)
    setSavingU(null)
  }

  // Config del piso+lado actual (con fallback a global)
  const overrides = (cfg as any)?.pisos_override ?? {}
  const pisoOverride = overrides[String(pisoSel)]?.[ladoSel] ?? null
  const globalItems = ladoSel === 'frente' ? cfg?.frente_items : cfg?.contrafrente_items
  const globalDorm  = ladoSel === 'frente' ? cfg?.frente_dormitorios : cfg?.contrafrente_dormitorios
  const globalM2    = ladoSel === 'frente' ? cfg?.frente_m2 : cfg?.contrafrente_m2

  const [pisoCfg, setPisoCfg] = useState<any>({ dormitorios: '', m2: '', items: [] })

  useEffect(() => {
    if (!cfg) return
    const ov = ((cfg as any).pisos_override ?? {})[String(pisoSel)]?.[ladoSel]
    setPisoCfg({
      dormitorios: ov?.dormitorios ?? '',
      m2:          ov?.m2 ?? '',
      items:       ov?.items ?? [],
    })
  }, [pisoSel, ladoSel, cfg])

  async function guardar() {
    if (!cfg) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('proyecto_config').update({
      nombre: cfg.nombre,
      direccion: cfg.direccion,
      descripcion: cfg.descripcion,
      wa_number: cfg.wa_number,
      render_url: cfg.render_url,
      frente_axo_url: cfg.frente_axo_url,
      contrafrente_axo_url: cfg.contrafrente_axo_url,
      frente_dormitorios: cfg.frente_dormitorios,
      frente_m2: cfg.frente_m2,
      frente_items: cfg.frente_items,
      contrafrente_dormitorios: cfg.contrafrente_dormitorios,
      contrafrente_m2: cfg.contrafrente_m2,
      contrafrente_items: cfg.contrafrente_items,
      precio_texto: cfg.precio_texto,
      financiacion_texto: cfg.financiacion_texto,
    }).eq('id', cfg.id)
    setMsg(error ? `✗ Error: ${error.message}` : '✓ Cambios guardados correctamente')
    setSaving(false)
  }

  async function subirImagen(file: File, campo: 'render_url' | 'frente_axo_url' | 'contrafrente_axo_url') {
    const ext = file.name.split('.').pop()
    const path = `proyecto/${campo}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      setCfg(prev => prev ? { ...prev, [campo]: data.publicUrl } : prev)
      setMsg('✓ Imagen subida. Guardá los cambios.')
    }
  }

  function updateItem(tipo: 'frente' | 'contrafrente', idx: number, col: 0 | 1, val: string) {
    setCfg(prev => {
      if (!prev) return prev
      const key = `${tipo}_items` as 'frente_items' | 'contrafrente_items'
      const items = prev[key].map((item, i) =>
        i === idx ? (col === 0 ? [val, item[1]] : [item[0], val]) as [string,string] : item
      )
      return { ...prev, [key]: items }
    })
  }

  function addItem(tipo: 'frente' | 'contrafrente') {
    const key = `${tipo}_items` as 'frente_items' | 'contrafrente_items'
    setCfg(prev => prev ? { ...prev, [key]: [...prev[key], ['', '']] } : prev)
  }

  function removeItem(tipo: 'frente' | 'contrafrente', idx: number) {
    const key = `${tipo}_items` as 'frente_items' | 'contrafrente_items'
    setCfg(prev => prev ? { ...prev, [key]: prev[key].filter((_, i) => i !== idx) } : prev)
  }

  const inp = {
    background: 'transparent', color: '#F5F0EA', fontSize: '0.85rem',
    padding: '0.65rem 0.9rem', outline: 'none', width: '100%',
    border: '1px solid rgba(206,162,121,0.25)',
    fontFamily: 'Panton, system-ui, sans-serif',
  }
  const lbl = {
    display: 'block', fontSize: '0.6rem', letterSpacing: '0.22em',
    textTransform: 'uppercase' as const, color: '#CEA279', marginBottom: '0.4rem'
  }
  const tabs = [
    { key: 'info',       label: 'Información'  },
    { key: 'fotos',      label: 'Fotos / Axo'  },
    { key: 'tipologias', label: 'Tipologías'   },
    { key: 'contacto',   label: 'Contacto'     },
  ] as const

  if (loading) return <div style={{ color: '#7A9BA8', padding: '3rem' }}>Cargando...</div>
  if (!cfg)    return <div style={{ color: '#E07070', padding: '3rem' }}>No se encontró configuración.</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.4rem' }}>Panel</p>
          <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA' }}>Página de Proyecto</h1>
        </div>
        <button onClick={guardar} disabled={saving} style={{
          background: '#CEA279', color: '#0A2D38', border: 'none',
          padding: '0.85rem 2rem', fontSize: '0.72rem', letterSpacing: '0.15em',
          textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer',
          fontWeight: 500, opacity: saving ? 0.7 : 1,
          fontFamily: 'Panton, system-ui, sans-serif',
        }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
      </div>

      {msg && (
        <p style={{ color: msg.startsWith('✓') ? '#5BC47A' : '#E07070', fontSize: '0.82rem', marginBottom: '1.5rem' }}>{msg}</p>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '2.5rem', borderBottom: '1px solid rgba(206,162,121,0.15)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? '#CEA279' : 'transparent',
            border: 'none', color: tab === t.key ? '#0A2D38' : '#7A9BA8',
            padding: '0.7rem 1.4rem', fontSize: '0.68rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'Panton, system-ui, sans-serif', fontWeight: tab === t.key ? 600 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── INFO ── */}
      {tab === 'info' && (
        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
          <div>
            <label style={lbl}>Nombre del proyecto</label>
            <input style={inp} value={cfg.nombre} onChange={e => setCfg({ ...cfg, nombre: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>Dirección</label>
            <input style={inp} value={cfg.direccion} onChange={e => setCfg({ ...cfg, direccion: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>Descripción corta (pisos, depto, ciudad)</label>
            <input style={inp} value={cfg.descripcion} onChange={e => setCfg({ ...cfg, descripcion: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>Texto de precio</label>
            <input style={inp} value={cfg.precio_texto} onChange={e => setCfg({ ...cfg, precio_texto: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>Texto de financiación</label>
            <input style={inp} value={cfg.financiacion_texto} onChange={e => setCfg({ ...cfg, financiacion_texto: e.target.value })} />
          </div>
        </div>
      )}

      {/* ── FOTOS ── */}
      {tab === 'fotos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {([
            { label: 'Foto principal (render lateral)', campo: 'render_url' as const, ref: renderRef },
            { label: 'Axonométrica Frente',             campo: 'frente_axo_url' as const, ref: frenteRef },
            { label: 'Axonométrica Contrafrente',       campo: 'contrafrente_axo_url' as const, ref: cfRef },
          ]).map(({ label, campo, ref }) => (
            <div key={campo} style={{ background: '#0D3542', border: '1px solid rgba(206,162,121,0.15)', padding: '1.5rem' }}>
              <p style={{ ...lbl, marginBottom: '1rem' }}>{label}</p>
              {cfg[campo] && (
                <div style={{ marginBottom: '1rem', aspectRatio: '4/3', overflow: 'hidden', background: '#0A2D38' }}>
                  <img src={cfg[campo]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <label style={{
                display: 'block', border: '1px dashed rgba(206,162,121,0.3)',
                color: '#7A9BA8', padding: '0.7rem 1rem', fontSize: '0.72rem',
                cursor: 'pointer', letterSpacing: '0.08em', textAlign: 'center',
              }}>
                + Reemplazar imagen
                <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) subirImagen(f, campo) }} />
              </label>
              <div style={{ marginTop: '0.8rem' }}>
                <label style={{ ...lbl, marginBottom: '0.3rem' }}>O pegar URL</label>
                <input style={{ ...inp, fontSize: '0.72rem' }} value={cfg[campo]} onChange={e => setCfg({ ...cfg, [campo]: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TIPOLOGÍAS ── */}
      {tab === 'tipologias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* ── Selector piso + lado ── */}
          <div style={{ background: '#0D3542', border: '1px solid rgba(206,162,121,0.15)', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.72rem', color: '#CEA279', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Editar por piso
              </p>
              <select value={pisoSel} onChange={e => setPisoSel(Number(e.target.value))}
                style={{ background: '#0A2D38', color: '#F5F0EA', border: '1px solid rgba(206,162,121,0.3)', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Panton, system-ui, sans-serif', outline: 'none' }}>
                {PISOS.map(p => <option key={p} value={p}>Piso {p}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {(['frente','contrafrente'] as const).map(l => (
                  <button key={l} onClick={() => setLadoSel(l)} style={{
                    background: ladoSel === l ? '#CEA279' : 'transparent',
                    border: '1px solid ' + (ladoSel === l ? '#CEA279' : 'rgba(206,162,121,0.3)'),
                    color: ladoSel === l ? '#0A2D38' : '#CEA279',
                    padding: '0.45rem 1rem', fontSize: '0.68rem', cursor: 'pointer',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: 'Panton, system-ui, sans-serif',
                  }}>{l === 'frente' ? 'Frente' : 'Contrafrente'}</button>
                ))}
              </div>
            </div>

            {/* Info específica del piso */}
            <div style={{ background: '#0A2D38', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(206,162,121,0.1)' }}>
              <p style={{ fontSize: '0.62rem', color: '#CEA279', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
                Piso {pisoSel} — {ladoSel === 'frente' ? 'Frente' : 'Contrafrente'}
                {pisoOverride && <span style={{ color: '#5BC47A', marginLeft: '0.8rem' }}>● Personalizado</span>}
                {!pisoOverride && <span style={{ color: '#7A9BA8', marginLeft: '0.8rem' }}>○ Usando valores globales</span>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={lbl}>Dormitorios <span style={{ color: '#7A9BA8' }}>(global: {globalDorm})</span></label>
                  <input type="number" style={inp} value={pisoCfg.dormitorios}
                    placeholder={String(globalDorm)}
                    onChange={e => setPisoCfg((p: any) => ({ ...p, dormitorios: e.target.value ? parseInt(e.target.value) : '' }))} />
                </div>
                <div>
                  <label style={lbl}>Superficie m² <span style={{ color: '#7A9BA8' }}>(global: {globalM2})</span></label>
                  <input type="number" style={inp} value={pisoCfg.m2}
                    placeholder={String(globalM2)}
                    onChange={e => setPisoCfg((p: any) => ({ ...p, m2: e.target.value ? parseInt(e.target.value) : '' }))} />
                </div>
              </div>
              <label style={{ ...lbl, marginBottom: '0.8rem' }}>Características <span style={{ color: '#7A9BA8' }}>(vacío = usa las globales)</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.8rem' }}>
                {(pisoCfg.items ?? []).map((item: [string,string], idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
                    <input style={{ ...inp, fontSize: '0.78rem' }} value={item[0]}
                      onChange={e => setPisoCfg((p: any) => { const items = [...p.items]; items[idx] = [e.target.value, items[idx][1]]; return { ...p, items } })}
                      placeholder="Ambiente" />
                    <input style={{ ...inp, fontSize: '0.78rem' }} value={item[1]}
                      onChange={e => setPisoCfg((p: any) => { const items = [...p.items]; items[idx] = [items[idx][0], e.target.value]; return { ...p, items } })}
                      placeholder="Medida" />
                    <button onClick={() => setPisoCfg((p: any) => ({ ...p, items: p.items.filter((_: any, i: number) => i !== idx) }))}
                      style={{ background: 'transparent', border: '1px solid rgba(224,112,112,0.3)', color: '#E07070', padding: '0.4rem 0.6rem', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setPisoCfg((p: any) => ({ ...p, items: [...(p.items ?? []), ['', '']] }))}
                  style={{ background: 'transparent', border: '1px dashed rgba(206,162,121,0.3)', color: '#CEA279', padding: '0.4rem 0.8rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  + Agregar fila
                </button>
                <button onClick={guardarPisoOverride} disabled={savingU === 'piso'}
                  style={{ background: '#CEA279', border: 'none', color: '#0A2D38', padding: '0.5rem 1.5rem', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Panton, system-ui, sans-serif', fontWeight: 500 }}>
                  {savingU === 'piso' ? 'Guardando...' : `Guardar Piso ${pisoSel}`}
                </button>
                {pisoOverride && (
                  <button onClick={async () => {
                    const ov = { ...((cfg as any).pisos_override ?? {}) }
                    if (ov[String(pisoSel)]) { delete ov[String(pisoSel)][ladoSel] }
                    await supabase.from('proyecto_config').update({ pisos_override: ov }).eq('id', cfg!.id)
                    setCfg((prev: any) => prev ? { ...prev, pisos_override: ov } : prev)
                    setPisoCfg({ dormitorios: '', m2: '', items: [] })
                    setMsg('✓ Override eliminado, vuelve a usar valores globales')
                  }} style={{ background: 'transparent', border: '1px solid rgba(224,112,112,0.3)', color: '#E07070', padding: '0.5rem 1rem', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Restablecer global
                  </button>
                )}
              </div>
            </div>

            {/* Disponibilidad */}
            <p style={{ fontSize: '0.68rem', color: '#CEA279', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>Disponibilidad de unidades</p>

            {unidades.length === 0 ? (
              <p style={{ color: '#7A9BA8', fontSize: '0.82rem' }}>No hay unidades registradas para el piso {pisoSel}.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {unidades.map(u => {
                  const colores: Record<string, string> = { disponible: '#5BC47A', reservado: '#CEA279', vendido: '#E07070' }
                  const color = colores[u.estado] ?? '#7A9BA8'
                  const isSaving = savingU === u.id
                  const items: [string,string][] = u.items ?? []
                  return (
                    <div key={u.id} style={{ background: '#0A2D38', border: `1px solid ${color}30`, padding: '1.5rem' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div>
                          <p style={{ fontSize: '0.6rem', color: '#7A9BA8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unidad</p>
                          <p style={{ fontSize: '1.1rem', color: '#F5F0EA', fontWeight: 500 }}>{u.codigo ?? `${u.piso}${u.tipo}`}</p>
                          <p style={{ fontSize: '0.72rem', color: '#CEA279', marginTop: '0.1rem' }}>{u.tipo} · {u.m2} m²</p>
                        </div>
                        {/* Estado */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                          <select value={u.estado} disabled={isSaving}
                            onChange={e => actualizarEstado(u.id, e.target.value)}
                            style={{
                              background: '#0D3542', color, border: `1px solid ${color}50`,
                              padding: '0.45rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer',
                              outline: 'none', fontFamily: 'Panton, system-ui, sans-serif',
                              opacity: isSaving ? 0.5 : 1,
                            }}>
                            <option value="disponible">Disponible</option>
                            <option value="reservado">Reservado</option>
                            <option value="vendido">Vendido</option>
                          </select>
                        </div>
                      </div>

                      {u.m2 && <p style={{ fontSize: '0.7rem', color: '#7A9BA8' }}>{u.m2} m²{u.precio_texto ? ` · ${u.precio_texto}` : ''}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Características por tipología ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            {(['frente', 'contrafrente'] as const).map(tipo => {
              const dormKey  = `${tipo}_dormitorios` as 'frente_dormitorios' | 'contrafrente_dormitorios'
              const m2Key    = `${tipo}_m2` as 'frente_m2' | 'contrafrente_m2'
              const itemsKey = `${tipo}_items` as 'frente_items' | 'contrafrente_items'
              return (
                <div key={tipo}>
                  <p style={{ fontSize: '0.72rem', color: '#CEA279', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    {tipo === 'frente' ? 'Frente' : 'Contrafrente'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={lbl}>Dormitorios</label>
                      <input type="number" style={inp} value={cfg[dormKey]}
                        onChange={e => setCfg({ ...cfg, [dormKey]: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label style={lbl}>Superficie (m²)</label>
                      <input type="number" style={inp} value={cfg[m2Key]}
                        onChange={e => setCfg({ ...cfg, [m2Key]: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <p style={{ ...lbl, marginBottom: '0.8rem' }}>Características</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cfg[itemsKey].map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input style={{ ...inp, fontSize: '0.78rem' }} value={item[0]}
                          onChange={e => updateItem(tipo, idx, 0, e.target.value)} placeholder="Ambiente" />
                        <input style={{ ...inp, fontSize: '0.78rem' }} value={item[1]}
                          onChange={e => updateItem(tipo, idx, 1, e.target.value)} placeholder="Medida" />
                        <button onClick={() => removeItem(tipo, idx)} style={{
                          background: 'transparent', border: '1px solid rgba(224,112,112,0.3)',
                          color: '#E07070', padding: '0.5rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem',
                        }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => addItem(tipo)} style={{
                      background: 'transparent', border: '1px dashed rgba(206,162,121,0.3)',
                      color: '#CEA279', padding: '0.6rem', fontSize: '0.68rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.3rem',
                    }}>+ Agregar fila</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CONTACTO ── */}
      {tab === 'contacto' && (
        <div style={{ maxWidth: '400px' }}>
          <div>
            <label style={lbl}>Número de WhatsApp</label>
            <input style={inp} value={cfg.wa_number}
              onChange={e => setCfg({ ...cfg, wa_number: e.target.value })}
              placeholder="5493425083468" />
            <p style={{ fontSize: '0.68rem', color: '#7A9BA8', marginTop: '0.5rem' }}>
              Sin espacios ni guiones. Ej: 5493425083468
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
