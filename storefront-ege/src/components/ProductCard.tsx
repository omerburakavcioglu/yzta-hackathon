'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Product } from '@/lib/api'
import { TL, visualFor, imageFor } from '@/lib/format'
import { ShoppingBag } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, showToast } = useStore()
  const v = visualFor(product.category)
  const img = imageFor(product.name)
  const inStock = product.stock_quantity > 0
  const lowStock = inStock && product.stock_quantity <= product.critical_threshold

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-olive-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <Link href={`/urunler/${product.id}`} className="block">
        {img ? (
          <div className="aspect-square overflow-hidden bg-olive-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className={`aspect-square bg-gradient-to-br ${v.bg} flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500`}>
            {v.emoji}
          </div>
        )}
      </Link>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-olive-600 font-semibold mb-1">
          {product.category}
        </div>
        <Link href={`/urunler/${product.id}`} className="block">
          <h3 className="font-serif text-lg text-ink-900 leading-tight mb-2 group-hover:text-olive-700 transition line-clamp-2 min-h-[3.25rem]">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xl font-bold text-olive-800">{TL(product.unit_price)}</div>
            {lowStock && (
              <div className="text-[11px] text-amber-700 font-medium">Son {product.stock_quantity} adet</div>
            )}
            {!inStock && (
              <div className="text-[11px] text-red-600 font-medium">Stokta yok</div>
            )}
          </div>
          <button
            onClick={() => {
              if (!inStock) return
              addToCart(product, 1)
              showToast(`${product.name} sepete eklendi`)
            }}
            disabled={!inStock}
            className="flex items-center gap-1.5 bg-olive-700 hover:bg-olive-800 disabled:bg-ink-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Ekle
          </button>
        </div>
      </div>
    </div>
  )
}
