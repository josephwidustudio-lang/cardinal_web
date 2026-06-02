import type { Metadata } from 'next'
import './globals.css'
import { SITE } from '@/lib/config'

export const metadata: Metadata = {
  title: SITE.seoTitle,
  description: SITE.seoDesc,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/fonts/Panton%20Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/fonts/Panton%20Light.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://owrawcvokdhdvnucanat.supabase.co/storage/v1/object/public/imagenes/fonts/Panton%20Bold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}