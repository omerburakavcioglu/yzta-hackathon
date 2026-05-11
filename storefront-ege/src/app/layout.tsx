import type { Metadata } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Chatbot from '@/components/Chatbot'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Ege Zeytinyağı Kooperatifi — Soğuk Sıkım Natürel Sızma Zeytinyağı',
  description:
    'Ayvalık\'tan üreticiden sofranıza, soğuk sıkım natürel sızma zeytinyağı ve zeytin ürünleri.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <StoreProvider>
          <Header />
          <Toast />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <Chatbot />
        </StoreProvider>
      </body>
    </html>
  )
}
