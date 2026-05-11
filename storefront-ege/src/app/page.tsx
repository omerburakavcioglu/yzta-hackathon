'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, Product } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import { Leaf, Truck, ShieldCheck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    api.products().then(setProducts).catch(() => {})
  }, [])

  const featured = products.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-olive-50">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              <Leaf className="w-3.5 h-3.5" />
              Ayvalık'ın altın damlası
            </div>
            <h1 className="font-serif text-4xl md:text-6xl text-olive-900 font-bold leading-tight mb-5">
              Üreticiden<br />
              <span className="text-olive-700">sofranıza</span>
              <br />zeytinyağı
            </h1>
            <p className="text-lg text-ink-700 leading-relaxed max-w-md mb-8">
              Soğuk sıkım, natürel sızma. Aracısız, taze, koruyucusuz.
              Ege'nin bereketli topraklarından kapınıza kadar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-6 py-3 rounded-xl font-medium transition shadow-md hover:shadow-lg"
              >
                Ürünleri Keşfet
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hikaye"
                className="inline-flex items-center gap-2 bg-white hover:bg-cream-50 text-olive-800 px-6 py-3 rounded-xl font-medium transition border border-olive-200"
              >
                Hikayemiz
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-olive-200 via-olive-100 to-cream-100 rounded-3xl flex items-center justify-center text-[16rem] shadow-xl rotate-3 hover:rotate-0 transition-transform duration-700">
              🫒
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-olive-100">
              <div className="text-xs uppercase text-olive-600 font-bold tracking-wider">2024 Hasadı</div>
              <div className="font-serif text-2xl text-olive-900">Yeni Geldi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-olive-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: 'Soğuk Sıkım', desc: 'Hasattan 12 saat içinde sıkım' },
            { icon: Truck, title: 'Hızlı Kargo', desc: '2-4 iş günü, Türkiye geneli' },
            { icon: ShieldCheck, title: 'Koşulsuz İade', desc: '14 gün içinde sorgusuz' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="bg-olive-100 p-2.5 rounded-xl">
                <f.icon className="w-5 h-5 text-olive-700" />
              </div>
              <div>
                <div className="font-semibold text-ink-900">{f.title}</div>
                <div className="text-xs text-ink-500">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-olive-600 font-semibold mb-1">Seçili Ürünler</div>
            <h2 className="font-serif text-3xl md:text-4xl text-olive-900 font-bold">En çok sevilenler</h2>
          </div>
          <Link href="/urunler" className="text-sm text-olive-700 hover:text-olive-900 font-medium hidden sm:inline-flex items-center gap-1">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center text-ink-400 py-16">Ürünler yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Story strip */}
      <section className="bg-olive-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-7xl md:text-9xl text-center">🌿</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-olive-200 font-semibold mb-2">Hikayemiz</div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Dört nesildir aynı zeytinlikler
            </h2>
            <p className="text-olive-100 leading-relaxed mb-6">
              1958'den beri Ayvalık'ta zeytin yetiştiriyoruz. Kooperatifimiz 42 küçük
              üreticinin emeğini bir araya getiriyor. Hasat zamanı geldiğinde tüm köy
              ağaçlara çıkar; aynı gün soğuk sıkım yapılır, hiç beklemez.
            </p>
            <Link href="/urunler" className="inline-flex items-center gap-2 bg-white text-olive-800 px-5 py-2.5 rounded-xl font-medium hover:bg-cream-50 transition">
              Ürünlere Git <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
