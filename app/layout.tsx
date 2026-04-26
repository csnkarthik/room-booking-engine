import type { Metadata } from 'next'
import { Playfair_Display, Nunito_Sans } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import Footer from '@/components/footer/Footer'
import { SiteHeader } from '@/components/header/SiteHeader'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunitoSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <SiteHeader />
          {children}
          <Footer />
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
