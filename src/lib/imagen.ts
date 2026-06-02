const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

/**
 * Genera URL optimizada para cada uso
 * Supabase Image Transformation API
 */
export function imgUrl(url: string, uso: 'card' | 'hero' | 'galeria' | 'thumb' | 'axo'): string {
  if (!url) return ''
  
  // Si no es de Supabase, devolver original
  if (!url.includes('supabase.co')) return url

  // Convertir de /object/public/ a /render/image/public/
  const renderUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const params: Record<string, string> = {
    card:    'width=600&height=800&resize=cover&quality=80',
    hero:    'width=1400&height=900&resize=cover&quality=85',
    galeria: 'width=1200&quality=85',
    thumb:   'width=200&height=200&resize=cover&quality=70',
    axo:     'width=1200&quality=90',
  }

  return `${renderUrl}?${params[uso]}`
}
