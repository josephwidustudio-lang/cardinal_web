// Fetch directo a Supabase REST API sin caché de Next.js
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function fetchProyectoConfig(): Promise<any | null> {
  try {
    const res = await fetch(
      `${URL}/rest/v1/proyecto_config?select=*&limit=1`,
      {
        headers: {
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.[0] ?? null
  } catch {
    return null
  }
}
