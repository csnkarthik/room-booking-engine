import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Nunito_Sans } from 'next/font/google'
import './globals.css'
import { Auth0Provider } from '@auth0/nextjs-auth0'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import Footer from '@/components/footer/Footer'
import { SiteHeader } from '@/components/header/SiteHeader'
import NextTopLoader from 'nextjs-toploader'
import { PageTransition } from '@/components/PageTransition'

const playfair = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
})

const nunitoSans = Nunito_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '800'],
})

export const metadata: Metadata = {
  title: 'Encore Boston Harbor — Room Booking',
  description:
    'Book your perfect room at Encore Boston Harbor. Luxury hotel rooms and suites with seamless online booking.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${nunitoSans.variable} h-full overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextTopLoader
          color="#D2A94A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <Auth0Provider>
          <QueryProvider>
            <SiteHeader />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </Auth0Provider>
      </body>
    </html>
  )
}
