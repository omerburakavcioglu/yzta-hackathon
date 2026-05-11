'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { api, Order } from '@/lib/api'
import { TL, STATUS_LABELS, SHIPMENT_LABELS, visualFor } from '@/lib/format'
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { customer } = useStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.orderDetail(id, customer?.id)
      .then(setOrder)
      .catch(e => setError(e.message || 'Sipariş bulunamadı.'))
      .finally(() => setLoading(false))
  }, [id, customer])

  if (loading) return <div className="text-center text-ink-400 py-20">Yükleniyor...</div>

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-olive-900 mb-2">Sipariş bulunamadı</h1>
        <p className="text-ink-500 mb-4">{error}</p>
        <Link href="/urunler" className="text-olive-700 hover:underline">Ürünlere dön</Link>
      </div>
    )
  }

  const shipment = (order as any).shipment
  const items = (order as any).items || []

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Success banner */}
      <div className="bg-olive-50 border border-olive-200 rounded-2xl p-6 mb-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-olive-600 mx-auto mb-3" />
        <h1 className="font-serif text-2xl md:text-3xl text-olive-900 font-bold mb-1">
          Siparişiniz alındı!
        </h1>
        <p className="text-sm text-ink-600">
          Sipariş numaranız: <span className="font-mono font-semibold">{order.public_order_no}</span>
        </p>
        <p className="text-xs text-ink-500 mt-2">
          Onay e-postası birkaç dakika içinde gönderilecektir.
        </p>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-2xl border border-olive-100 p-6 mb-6">
        <h2 className="font-serif text-lg text-olive-900 font-bold mb-4">Durum</h2>
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0">
            <Package className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-ink-900">{STATUS_LABELS[order.status] || order.status}</div>
            <div className="text-xs text-ink-500 mt-0.5">Sipariş tarihi: {order.order_date}</div>
          </div>
        </div>
        {shipment && (
          <div className="mt-4 pt-4 border-t border-olive-100 flex items-start gap-4">
            <div className="bg-blue-100 p-2.5 rounded-xl flex-shrink-0">
              <Truck className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-ink-900">
                Kargo: {SHIPMENT_LABELS[shipment.shipment_status] || shipment.shipment_status}
              </div>
              <div className="text-xs text-ink-500 mt-0.5">
                {shipment.carrier} · Takip No: <span className="font-mono">{shipment.tracking_no}</span>
              </div>
              {shipment.estimated_delivery && (
                <div className="text-xs text-ink-500">
                  Tahmini teslimat: {shipment.estimated_delivery}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-olive-100 p-6 mb-6">
        <h2 className="font-serif text-lg text-olive-900 font-bold mb-4">Ürünler</h2>
        <div className="space-y-3">
          {items.map((it: any) => {
            const cat = it.products?.category || ''
            const v = visualFor(cat)
            return (
              <div key={it.id || it.product_id} className="flex items-center gap-3 text-sm">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${v.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {v.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 line-clamp-1">{it.products?.name || 'Ürün'}</div>
                  <div className="text-xs text-ink-500">{it.quantity} adet · {TL(it.unit_price)}</div>
                </div>
                <div className="font-semibold text-ink-900">
                  {TL(Number(it.unit_price) * it.quantity)}
                </div>
              </div>
            )
          })}
        </div>
        <div className="border-t border-olive-100 mt-4 pt-4 flex items-baseline justify-between">
          <span className="font-semibold">Toplam</span>
          <span className="font-bold text-2xl text-olive-800">{TL(order.total_amount)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        {customer && (
          <Link
            href="/hesabim"
            className="flex-1 text-center bg-white border border-olive-200 text-olive-800 hover:bg-olive-50 px-5 py-3 rounded-xl font-medium transition"
          >
            Siparişlerime Git
          </Link>
        )}
        <Link
          href="/urunler"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-5 py-3 rounded-xl font-medium transition"
        >
          Alışverişe Devam
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
