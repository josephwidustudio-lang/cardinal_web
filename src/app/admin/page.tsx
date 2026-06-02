import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#F5F2EE', marginBottom: '0.5rem' }}>
        Bienvenido al panel
      </h1>
      <p style={{ color: '#6B6B65', fontSize: '0.85rem', marginBottom: '3rem' }}>
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
            background: '#1C1C1C', padding: '2rem',
            border: '1px solid rgba(201,169,110,0.15)',
            textDecoration: 'none', minWidth: '200px', display: 'block'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 500, color: '#C9A96E', marginBottom: '0.5rem' }}>{a.label}</div>
            <div style={{ fontSize: '0.78rem', color: '#6B6B65' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
