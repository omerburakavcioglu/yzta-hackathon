'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { TL, visualFor } from '@/lib/format'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { cart, setQuantity, removeFromCart, cartTotal } = useStore()

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="font-serif text-3xl text-olive-900 mb-2">Sepetiniz boş</h1>
        <p className="text-ink-500 mb-6">Henüz sepete ürün eklemediniz.</p>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl md:text-4xl text-olive-900 font-bold mb-8">Sepetim</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const v = visualFor(item.product.category)
            return (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-olive-100 p-4 flex items-center gap-4"
              >
                <Link href={`/urunler/${item.product.id}`} className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br ${v.bg} flex items-center justify-center text-4xl`}>
                  {v.emoji}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/urunler/${item.product.id}`} className="font-serif text-base sm:text-lg text-ink-900 hover:text-olive-700 transition line-clamp-2">
                    {item.product.name}
                  </Link>
                  <div className="text-sm text-ink-500">{TL(item.product.unit_price)} / adet</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-cream-100 rounded-lg">
                      <button
                        onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 hover:text-olive-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="p-1.5 hover:text-olive-700 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-ink-400 hover:text-red-600 p-1.5"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-lg text-olive-800">
                    {TL(item.product.unit_price * item.quantity)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-olive-100 p-6 sticky top-24">
            <h2 className="font-serif text-xl text-olive-900 font-bold mb-4">Sipariş Özeti</h2>
            <div className="space-y-2 text-sm border-b border-olive-100 pb-4 mb-4">
              <div className="flex justify-between text-ink-700">
                <span>Ara Toplam</span>
                <span>{TL(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Kargo</span>
                <span className="text-olive-700 font-medium">Ücretsiz</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-semibold text-ink-900">Toplam</span>
              <span className="font-bold text-2xl text-olive-800">{TL(cartTotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full inline-flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
            >
              Ödemeye Geç
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/urunler"
              className="block text-center text-sm text-olive-700 hover:text-olive-900 mt-3"
            >
              Alışverişe devam et
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
