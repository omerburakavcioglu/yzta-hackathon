'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const NAV = [
  { href: '/',        label: 'Anasayfa' },
  { href: '/urunler', label: 'Ürünler' },
  { href: '/hikaye',  label: 'Hikayemiz' },
]

export default function Header() {
  const { customer, cartCount, logout } = useStore()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur border-b border-olive-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🫒</span>
          <div className="leading-tight">
            <div className="font-serif text-lg text-olive-800 font-bold tracking-tight">
              Ege Zeytinyağı
            </div>
            <div className="text-[10px] uppercase tracking-widest text-olive-600">
              Kooperatifi
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                'text-sm font-medium transition',
                pathname === n.href
                  ? 'text-olive-700'
                  : 'text-ink-700 hover:text-olive-700',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {customer ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/hesabim"
                className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-olive-700 px-3 py-2 rounded-lg hover:bg-olive-50 transition"
              >
                <User className="w-4 h-4" />
                {customer.full_name.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                title="Çıkış yap"
                className="p-2 text-ink-500 hover:text-olive-700 rounded-lg hover:bg-olive-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/giris"
              className="hidden md:flex items-center gap-1.5 text-sm text-ink-700 hover:text-olive-700 px-3 py-2 rounded-lg hover:bg-olive-50 transition"
            >
              <User className="w-4 h-4" />
              Giriş
            </Link>
          )}

          <Link
            href="/sepet"
            className="relative flex items-center gap-1.5 bg-olive-700 hover:bg-olive-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Sepet</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 text-ink-700 rounded-lg hover:bg-olive-50"
            aria-label="Menü"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-olive-100 bg-cream-50">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm font-medium text-ink-700 hover:text-olive-700"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={customer ? '/hesabim' : '/giris'}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-ink-700 hover:text-olive-700"
            >
              {customer ? `Hesabım (${customer.full_name.split(' ')[0]})` : 'Giriş yap'}
            </Link>
            {customer && (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="py-2.5 text-left text-sm font-medium text-ink-500"
              >
                Çıkış yap
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
