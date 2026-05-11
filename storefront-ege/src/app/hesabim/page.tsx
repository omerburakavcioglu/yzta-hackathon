'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { api, Order } from '@/lib/api'
import { TL, STATUS_LABELS } from '@/lib/format'
import { Package, LogOut, User as UserIcon, MapPin, Phone, Mail } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  preparing: 'bg-amber-100 text-amber-700',
  packed:    'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-olive-100 text-olive-800',
  delayed:   'bg-red-100 text-red-700',
  cancelled: 'bg-ink-400/20 text-ink-500',
}

export default function AccountPage() {
  const { customer, logout } = useStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer) {
      router.push('/giris')
      return
    }
    api.myOrders(customer.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [customer, router])

  if (!customer) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-olive-900 font-bold">
            Merhaba, {customer.full_name.split(' ')[0]}
          </h1>
          <p className="text-ink-500 text-sm mt-1">Hesabınızı ve siparişlerinizi yönetin.</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-olive-100 p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center text-olive-700 font-bold text-lg">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-serif text-lg text-ink-900">{customer.full_name}</div>
                <div className="text-xs text-ink-500">Müşteri</div>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <Row icon={Mail}  text={customer.email} />
              <Row icon={Phone} text={customer.phone || '—'} />
              <Row icon={MapPin} text={customer.address || '—'} />
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-olive-700" />
            <h2 className="font-serif text-xl text-olive-900 font-bold">Siparişlerim</h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-olive-100 p-10 text-center text-ink-400">Yükleniyor...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-olive-100 p-10 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-ink-500 mb-4">Henüz bir siparişiniz yok.</p>
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <Link
                  key={o.id}
                  href={`/siparis/${o.id}`}
                  className="block bg-white rounded-2xl border border-olive-100 hover:border-olive-300 hover:shadow-sm transition p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-sm text-olive-700 font-semibold">{o.public_order_no}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{o.order_date}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] || 'bg-ink-400/20 text-ink-500'}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-olive-800">{TL(o.total_amount)}</div>
                      {o.shipment && (
                        <div className="text-xs text-ink-500 mt-0.5">
                          Kargo: {o.shipment.tracking_no}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2 text-ink-700">
      <Icon className="w-4 h-4 text-olive-600 mt-0.5 flex-shrink-0" />
      <span className="break-words">{text}</span>
    </div>
  )
}
