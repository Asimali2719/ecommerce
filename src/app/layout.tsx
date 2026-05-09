// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Luxe Shop — Premium eCommerce',
    template: '%s | Luxe Shop',
  },
  description:
    'Discover premium products curated for quality and style. Shop electronics, fashion, home goods, and more.',
  keywords: ['ecommerce', 'shopping', 'premium', 'online store'],
  authors: [{ name: 'Luxe Shop' }],
  creator: 'Luxe Shop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Luxe Shop — Premium eCommerce',
    description: 'Discover premium products curated for quality and style.',
    siteName: 'Luxe Shop',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-stone-50 font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1c1917',
                color: '#fafaf9',
                border: '1px solid #44403c',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
