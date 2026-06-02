'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export default function NavMobile() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'

  const menu = open && mounted ? createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#FFFFFF',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Botón cerrar */}
      <button onClick={() => setOpen(false)} style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        background: 'transparent', border: 'none',
        color: '#0D3542', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1
      }}>✕</button>

      {/* Logo */}
      <img src={LOGO} alt="Cardinal" style={{ height: '60px', marginBottom: '3rem' }} />

      {/* Links */}
      {[
        { label: 'Proyecto',  href: '/proyecto'  },
        { label: 'Unidades',  href: '#unidades'  },
        { label: 'Galería',   href: '#galeria'   },
        { label: 'Nosotros',  href: '#nosotros'  },
        { label: 'Contacto',  href: '#contacto'  },
      ].map(link => (
        <a key={link.label} href={link.href} onClick={() => setOpen(false)} style={{
          fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 300,
          color: '#0D3542', textDecoration: 'none',
          padding: '1rem 0', textAlign: 'center', display: 'block',
          width: '100%', borderBottom: '1px solid rgba(13,53,66,0.1)'
        }}>
          {link.label}
        </a>
      ))}

      {/* WhatsApp */}
      <a href={`https://wa.me/${WA}`} target="_blank" onClick={() => setOpen(false)} style={{
        display: 'block', textAlign: 'center',
        backgroundColor: '#CEA279', color: '#FFFFFF',
        padding: '1rem 3rem', fontSize: '0.85rem', fontWeight: 500,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        textDecoration: 'none', marginTop: '2.5rem', width: '100%'
      }}>
        Consultar por WhatsApp
      </a>

      {/* Panel */}
      <Link href="/admin" onClick={() => setOpen(false)} style={{
        display: 'block', textAlign: 'center', color: 'rgba(13,53,66,0.4)',
        fontSize: '0.72rem', textDecoration: 'none', marginTop: '1.5rem'
      }}>
        Panel →
      </Link>
    </div>,
    document.body
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="nav-hamburger"
        style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
      >
        <span style={{ display: 'block', width: '24px', height: '1.5px', background: '#F5F0EA', transition: 'all 0.3s' }} />
        <span style={{ display: 'block', width: '24px', height: '1.5px', background: '#F5F0EA', transition: 'all 0.3s' }} />
        <span style={{ display: 'block', width: '24px', height: '1.5px', background: '#F5F0EA', transition: 'all 0.3s' }} />
      </button>
      {menu}
    </>
  )
}