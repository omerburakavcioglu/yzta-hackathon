'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { setCustomer, showToast } = useStore()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '', address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (k: string, v: string) => setForm(s => ({ ...s, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Parola en az 6 karakter olmalı.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const c = await api.signup(form)
      setCustomer(c)
      showToast('Hoş geldin! Hesabın oluşturuldu.')
      router.push('/hesabim')
    } catch (e: any) {
      setError(e.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🌿</div>
        <h1 className="font-serif text-3xl text-olive-900 font-bold">Kayıt Ol</h1>
        <p className="text-sm text-ink-500 mt-2">Hesap oluşturun, alışverişiniz hızlansın.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-olive-100 p-6 space-y-4">
        <Field label="Ad Soyad" value={form.full_name} onChange={v => setField('full_name', v)} required />
        <Field label="E-posta" type="email" value={form.email} onChange={v => setField('email', v)} required />
        <Field label="Parola (en az 6 karakter)" type="password" value={form.password} onChange={v => setField('password', v)} required />
        <Field label="Telefon" value={form.phone} onChange={v => setField('phone', v)} placeholder="0532 000 0000" />
        <Field label="Adres" value={form.address} onChange={v => setField('address', v)} placeholder="Mahalle, sokak, ilçe, şehir" />

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Kayıt oluşturuluyor...' : 'Hesap Oluştur'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Hesabınız var mı?{' '}
        <Link href="/giris" className="text-olive-700 hover:text-olive-900 font-medium">
          Giriş yapın
        </Link>
      </p>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-cream-50 border border-olive-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
      />
    </div>
  )
}
