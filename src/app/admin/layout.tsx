'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setChecking(false)
      }
    })
  }, [])

  if (checking) {
    return (
      <div style={{
        background: '#0A2D38', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.3em', color: '#CEA279' }}>
          CARDINAL
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin',              icon: '◈',  label: 'Dashboard'    },
    { href: '/admin/edificios',    icon: '🏢', label: 'Edificios'    },
    { href: '/admin/proyecto',     icon: '📐', label: 'Proyecto'     },
    { href: '/admin/galeria',      icon: '🖼️', label: 'Galería'      },
    { href: '/admin/propiedades',  icon: '🏠', label: 'Propiedades'  },
    { href: '/admin/asesores',     icon: '👤', label: 'Asesores'     },
    { href: '/admin/leads',        icon: '📋', label: 'Leads'        },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A2D38' }}>
      <aside style={{
        width: '240px', background: '#0D3542',
        borderRight: '1px solid rgba(206,162,121,0.15)',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(206,162,121,0.15)' }}>
          <div style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '1.4rem', fontWeight: 300, letterSpacing: '0.35em', color: '#F5F0EA' }}>CARDINAL</div>
          <div style={{ fontSize: '0.6rem', color: '#CEA279', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.3rem' }}>Panel de gestión</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.85rem 1.5rem', fontSize: '0.82rem',
                color: isActive ? '#CEA279' : '#7A9BA8',
                textDecoration: 'none',
                borderLeft: isActive ? '2px solid #CEA279' : '2px solid transparent',
                background: isActive ? 'rgba(206,162,121,0.08)' : 'transparent',
                fontFamily: 'Panton, system-ui, sans-serif',
                letterSpacing: '0.05em',
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(206,162,121,0.15)' }}>
          {user && (
            <p style={{ fontSize: '0.68rem', color: '#7A9BA8', marginBottom: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          )}
          <Link href="/" style={{ fontSize: '0.72rem', color: '#7A9BA8', textDecoration: 'none', display: 'block', marginBottom: '0.8rem' }}>
            ← Ver web pública
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main style={{ marginLeft: '240px', flex: 1, padding: '2.5rem', background: '#0A2D38' }}>
        {children}
      </main>
    </div>
  )
}