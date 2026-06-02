'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LOGO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/cardinal_logotipo.svg'
const VIDEO = 'https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/brand/SALAS_VIDEO%20HORIZONTAL%202.mp4'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    if (data.session) {
      window.location.href = '/admin'
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: 'Panton, system-ui, sans-serif',
      background: '#0A2D38',
    }}>

      {/* Left — video */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="login-video-panel">
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={VIDEO} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,45,56,0.55)' }} />
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem' }}>
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#CEA279' }}>
            Arquitectura que trasciende
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        width: '100%', maxWidth: '480px', background: '#0D3542',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem 3.5rem',
        borderLeft: '1px solid rgba(206,162,121,0.15)',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '3.5rem' }}>
          <img src={LOGO} alt="Cardinal" style={{ height: '40px', filter: 'brightness(0) invert(1)', display: 'block', marginBottom: '1rem' }} />
          <div style={{ width: '30px', height: '1px', background: '#CEA279' }} />
        </div>

        {/* Titulo */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Panton, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: '#F5F0EA', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Panel de gestión
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#7A9BA8', lineHeight: 1.6 }}>
            Ingresá con tu cuenta para administrar Cardinal.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.6rem' }}>
              Email
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{
                width: '100%', background: 'transparent', color: '#F5F0EA',
                fontSize: '0.9rem', padding: '0.75rem 0', outline: 'none',
                border: 'none', borderBottom: '1px solid rgba(206,162,121,0.3)',
                fontFamily: 'Panton, system-ui, sans-serif',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CEA279', marginBottom: '0.6rem' }}>
              Contraseña
            </label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', background: 'transparent', color: '#F5F0EA',
                fontSize: '0.9rem', padding: '0.75rem 0', outline: 'none',
                border: 'none', borderBottom: '1px solid rgba(206,162,121,0.3)',
                fontFamily: 'Panton, system-ui, sans-serif',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#E07070', fontSize: '0.78rem', marginBottom: '1.2rem', letterSpacing: '0.05em' }}>
              ⚠ {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#CEA279', color: '#0A2D38',
            padding: '1rem', fontSize: '0.78rem', fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: 'none', cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: 'Panton, system-ui, sans-serif',
            transition: 'opacity 0.2s',
          }}>
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <a href="/" style={{
          display: 'block', marginTop: '2.5rem',
          fontSize: '0.72rem', color: 'rgba(122,155,168,0.6)',
          textDecoration: 'none', letterSpacing: '0.1em',
        }}>
          ← Volver a la web
        </a>

      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-video-panel { display: block !important; }
        }
      `}</style>
    </main>
  )
}
