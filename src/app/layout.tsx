import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'АвтоЗапчасти — легковые авто и спецтехника',
  description: 'Запчасти для легковых автомобилей, грузовиков и спецтехники. КамАЗ, МАЗ, Урал, Toyota, Lada и другие.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
