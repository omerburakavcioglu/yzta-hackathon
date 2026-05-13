'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import EgeLogo from '@/components/EgeLogo'

export default function LoginPage() {
  const router = useRouter()
  const { setCustomer, showToast } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const c = await api.login({ email, password })
      setCustomer(c)
      showToast(`Hoş geldin, ${c.full_name.split(' ')[0]}!`)
      router.push('/hesabim')
    } catch (e: any) {
      setError(e.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3"><EgeLogo size={56} /></div>
        <h1 className="font-serif text-3xl text-olive-900 font-bold">Giriş Yap</h1>
        <p className="text-sm text-ink-500 mt-2">Hesabınıza erişin, siparişlerinizi takip edin.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-olive-100 p-6 space-y-4">
        <Field label="E-posta" type="email" value={email} onChange={setEmail} required />
        <Field label="Parola" type="password" value={password} onChange={setPassword} required />

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
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Hesabınız yok mu?{' '}
        <Link href="/kayit" className="text-olive-700 hover:text-olive-900 font-medium">
          Kayıt olun
        </Link>
      </p>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-cream-50 border border-olive-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
      />
    </div>
  )
}
