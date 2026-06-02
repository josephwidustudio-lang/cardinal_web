import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F0EA', marginBottom: '0.5rem' }}>
        Bienvenido al panel
      </h1>
      <p style={{ color: '#7A9BA8', fontSize: '0.85rem', marginBottom: '3rem' }}>
        Gestioná edificios, unidades, propiedades y asesores desde acá.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { href: '/admin/edificios', label: '🏢 Edificios', desc: 'Gestionar proyectos y unidades' },
          { href: '/admin/propiedades', label: '🏠 Propiedades', desc: 'Venta y alquiler' },
          { href: '/admin/asesores', label: '👤 Asesores', desc: 'Gestionar equipo' },
          { href: '/admin/leads', label: '📋 Leads', desc: 'Consultas recibidas' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            background: '#0D3542', padding: '2rem',
            border: '1px solid rgba(206,162,121,0.15)',
            textDecoration: 'none', minWidth: '200px', display: 'block'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 500, color: '#CEA279', marginBottom: '0.5rem', fontFamily: 'Panton, system-ui, sans-serif' }}>{a.label}</div>
            <div style={{ fontSize: '0.78rem', color: '#7A9BA8' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
