'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { SITE, COLORS } from '@/lib/config'

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

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    color: '#F5F2EE', fontSize: '0.9rem', padding: '0.9rem 1rem',
    outline: 'none', fontFamily: 'system-ui, sans-serif',
    border: '1px solid rgba(201,169,110,0.2)',
    transition: 'border-color 0.2s',
    marginBottom: '1rem'
  }

  return (
    <main style={{
      background: '#0A0A0A', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundImage: `
        linear-gradient(to bottom, rgba(10,10,10,0.97), rgba(10,10,10,0.97)),
        url(${SITE.heroImagen}) center/cover
      `
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 2rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, letterSpacing: '0.35em', color: '#F5F2EE', marginBottom: '0.5rem' }}>
            {SITE.nombreCorto}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#C9A96E', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Panel de gestión
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#111111', padding: '2.5rem', border: '1px solid rgba(201,169,110,0.1)' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 300, color: '#F5F2EE', marginBottom: '0.5rem' }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#6B6B65', marginBottom: '2rem' }}>
            Ingresá con tu cuenta para acceder al panel
          </p>

          <form onSubmit={handleLogin}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '0.5rem' }}>
                Contraseña
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#E07070', fontSize: '0.82rem', marginBottom: '1rem' }}>
                ⚠ {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#C9A96E', color: '#0A0A0A',
              padding: '1rem', fontSize: '0.82rem', fontWeight: 500,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '0.5rem'
            }}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: '#6B6B65' }}>
          ← <a href="/" style={{ color: '#6B6B65', textDecoration: 'none' }}>Volver a la web</a>
        </p>

      </div>
    </main>
  )
}