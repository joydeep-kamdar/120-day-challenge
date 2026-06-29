import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: '120 Day Challenge',
  description: 'Your crew. Your goals. 120 days to transform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '120 Day Challenge',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '24px',
              boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
            },
          }}
        />
      </body>
    </html>
  )
}
