import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'TruckLine — запчасти и ремонт тягачей в Хакасии',
  description: 'Запчасти и сервис для тягачей, полуприцепов, самосвалов и спецтехники. Volvo, Scania, DAF, Mercedes, КамАЗ. Свой автосервис в Усть-Абакане. Открытые цены, гарантия до 6 месяцев.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
