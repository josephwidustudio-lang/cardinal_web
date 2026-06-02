'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={logout} style={{
      background: 'transparent', border: 'none',
      color: '#E07070', fontSize: '0.72rem',
      cursor: 'pointer', textAlign: 'left', padding: 0
    }}>
      Cerrar sesión →
    </button>
  )
}
