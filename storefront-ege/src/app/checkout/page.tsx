'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { TL, visualFor } from '@/lib/format'
import { CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const { cart, customer, cartTotal, clearCart, showToast } = useStore()
  const router = useRouter()

  const [full_name, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [placing, setPlacing] = useState(false)

  // Prefill from customer if logged in
  useEffect(() => {
    if (customer) {
      setFullName(customer.full_name)
      setEmail(customer.email)
      setPhone(customer.phone ?? '')
      setAddress(customer.address ?? '')
    }
  }, [customer])

  useEffect(() => {
    if (cart.length === 0 && !placing) router.push('/sepet')
  }, [cart.length, placing, router])

  const placeOrder = async () => {
    if (!full_name || !email || !phone || !address) {
      showToast('Lütfen teslimat bilgilerini eksiksiz doldurun.', 'error')
      return
    }
    if (!card.number || !card.expiry || !card.cvv) {
      showToast('Lütfen ödeme bilgilerini doldurun. (Mock — gerçek ücret alınmaz)', 'error')
      return
    }
    setPlacing(true)
    try {
      const res = await api.createOrder({
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        customer_id: customer?.id,
        guest: customer ? undefined : { full_name, email, phone, address },
      })
      clearCart()
      router.push(`/siparis/${res.order.id}`)
    } catch (e: any) {
      showToast(e.message || 'Sipariş oluşturulamadı.', 'error')
      setPlacing(false)
    }
  }

  if (cart.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/sepet" className="inline-flex items-center gap-1.5 text-sm text-olive-700 hover:text-olive-900 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Sepete dön
      </Link>
      <h1 className="font-serif text-3xl md:text-4xl text-olive-900 font-bold mb-8">Ödeme</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auth status */}
          {customer ? (
            <div className="bg-olive-50 border border-olive-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              <span className="text-olive-800">
                <strong>{customer.full_name}</strong> olarak giriş yaptınız ({customer.email})
              </span>
            </div>
          ) : (
            <div className="bg-cream-100 border border-olive-100 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              <span className="text-ink-700">Hesabınız var mı?</span>
              <Link href="/giris" className="text-olive-700 hover:text-olive-900 font-medium">
                Giriş yap
              </Link>
            </div>
          )}

          {/* Delivery info */}
          <div className="bg-white rounded-2xl border border-olive-100 p-6">
            <h2 className="font-serif text-xl text-olive-900 font-bold mb-4">Teslimat Bilgileri</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Ad Soyad" value={full_name} onChange={setFullName} placeholder="Ahmet Yılmaz" />
              <Field label="E-posta" value={email} onChange={setEmail} type="email" placeholder="ornek@mail.com" />
              <Field label="Telefon" value={phone} onChange={setPhone} placeholder="0532 000 0000" />
              <Field label="Adres" value={address} onChange={setAddress} placeholder="Sokak, Mahalle, İlçe, Şehir" full />
            </div>
          </div>

          {/* Mock Payment */}
          <div className="bg-white rounded-2xl border border-olive-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-olive-900 font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-olive-600" />
                Ödeme Bilgileri
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-olive-700 bg-olive-50 px-2 py-1 rounded-full font-medium">
                <Lock className="w-3 h-3" />
                Mock ödeme (hackathon)
              </span>
            </div>
            <div className="bg-gradient-to-br from-olive-700 to-olive-900 text-white rounded-2xl p-5 mb-4 max-w-sm">
              <div className="text-xs uppercase tracking-wider text-olive-200 mb-6">Kart</div>
              <div className="font-mono text-lg tracking-widest mb-4">
                {card.number || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <div className="text-olive-200 uppercase">Ad</div>
                  <div className="uppercase">{full_name || 'AD SOYAD'}</div>
                </div>
                <div>
                  <div className="text-olive-200 uppercase">Skt</div>
                  <div>{card.expiry || 'AA/YY'}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-4">
                <Field
                  label="Kart Numarası"
                  value={card.number}
                  onChange={v => setCard(c => ({ ...c, number: v.replace(/[^\d ]/g, '').slice(0, 19) }))}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <Field label="Son Kullanma" value={card.expiry} onChange={v => setCard(c => ({ ...c, expiry: v.slice(0, 5) }))} placeholder="12/26" />
              <Field label="CVV" value={card.cvv} onChange={v => setCard(c => ({ ...c, cvv: v.replace(/\D/g, '').slice(0, 3) }))} placeholder="123" />
            </div>
            <p className="text-[11px] text-ink-400 mt-3">
              Bu sayfada gerçek ödeme alınmaz. Hackathon MVP için kart bilgileri doğrulanmaz.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-olive-100 p-6 sticky top-24">
            <h2 className="font-serif text-xl text-olive-900 font-bold mb-4">Sipariş</h2>
            <div className="space-y-3 mb-4">
              {cart.map(i => {
                const v = visualFor(i.product.category)
                return (
                  <div key={i.product.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${v.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {v.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 line-clamp-1">{i.product.name}</div>
                      <div className="text-xs text-ink-500">{i.quantity} adet · {TL(i.product.unit_price)}</div>
                    </div>
                    <div className="font-semibold text-ink-900">
                      {TL(i.product.unit_price * i.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-olive-100 pt-4 mb-4">
              <div className="flex justify-between text-sm text-ink-700 mb-1">
                <span>Ara toplam</span>
                <span>{TL(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-700 mb-3">
                <span>Kargo</span>
                <span className="text-olive-700">Ücretsiz</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Toplam</span>
                <span className="font-bold text-2xl text-olive-800">{TL(cartTotal)}</span>
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
            >
              {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {placing ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', full = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-cream-50 border border-olive-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
      />
    </div>
  )
}
