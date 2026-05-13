'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, Product } from '@/lib/api'
import { useStore } from '@/lib/store'
import { TL, visualFor, imageFor } from '@/lib/format'
import { ShoppingBag, ArrowLeft, Leaf, Truck, ShieldCheck, Minus, Plus } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart, showToast } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    api.product(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-olive-900 mb-2">Ürün bulunamadı</h1>
        <Link href="/urunler" className="text-olive-700 hover:underline">Ürünlere dön</Link>
      </div>
    )
  }

  if (!product) {
    return <div className="text-center text-ink-400 py-20">Yükleniyor...</div>
  }

  const v = visualFor(product.category)
  const img = imageFor(product.name)
  const inStock = product.stock_quantity > 0
  const lowStock = inStock && product.stock_quantity <= product.critical_threshold

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link href="/urunler" className="inline-flex items-center gap-1.5 text-sm text-olive-700 hover:text-olive-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Ürünlere dön
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        {img ? (
          <div className="aspect-square rounded-3xl overflow-hidden shadow-lg bg-olive-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={product.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`aspect-square bg-gradient-to-br ${v.bg} rounded-3xl flex items-center justify-center text-[14rem] shadow-lg`}>
            {v.emoji}
          </div>
        )}

        {/* Details */}
        <div>
          <div className="text-xs uppercase tracking-widest text-olive-600 font-semibold mb-2">
            {product.category}
          </div>
          <h1 className="font-serif text-4xl text-olive-900 font-bold mb-4">{product.name}</h1>
          <div className="text-3xl font-bold text-olive-800 mb-2">{TL(product.unit_price)}</div>

          {inStock ? (
            lowStock ? (
              <div className="inline-block text-sm text-amber-700 font-medium bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-6">
                ⚠ Son {product.stock_quantity} adet
              </div>
            ) : (
              <div className="inline-block text-sm text-olive-700 font-medium bg-olive-50 border border-olive-200 px-3 py-1 rounded-full mb-6">
                ✓ Stokta mevcut
              </div>
            )
          ) : (
            <div className="inline-block text-sm text-red-700 font-medium bg-red-50 border border-red-200 px-3 py-1 rounded-full mb-6">
              Stokta yok
            </div>
          )}

          <p className="text-ink-700 leading-relaxed mb-8">
            Ayvalık zeytinliklerimizden, hasat günü soğuk sıkım yöntemiyle elde edilmiştir.
            Hiçbir koruyucu veya katkı maddesi içermez. Polifenol açısından zengin, taze ve
            aromalı bir lezzet sunar.
          </p>

          {/* Quantity + Add */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center bg-cream-100 rounded-xl">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="p-3 hover:text-olive-700 transition"
                disabled={qty <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                className="p-3 hover:text-olive-700 transition"
                disabled={qty >= product.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                addToCart(product, qty)
                showToast(`${qty} adet ${product.name} sepete eklendi`)
              }}
              disabled={!inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 disabled:bg-ink-400 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Sepete Ekle
            </button>
          </div>

          <button
            onClick={() => {
              addToCart(product, qty)
              router.push('/sepet')
            }}
            disabled={!inStock}
            className="w-full bg-white border-2 border-olive-700 text-olive-700 hover:bg-olive-50 px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            Hemen Satın Al
          </button>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-olive-100">
            {[
              { icon: Leaf, label: 'Soğuk Sıkım' },
              { icon: Truck, label: '2-4 İş Günü' },
              { icon: ShieldCheck, label: '14 Gün İade' },
            ].map(t => (
              <div key={t.label} className="text-center">
                <t.icon className="w-5 h-5 text-olive-600 mx-auto mb-1.5" />
                <div className="text-xs text-ink-700 font-medium">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
