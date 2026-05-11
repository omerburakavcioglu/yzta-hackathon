'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, DemoUser } from '@/lib/api'
import { useApp } from '@/lib/context'
import { Zap, ShieldCheck, Building2, User, Moon, Sun, Languages } from 'lucide-react'

const roleIcons: Record<string, React.ReactNode> = {
  admin:    <ShieldCheck className="w-8 h-8 text-purple-500" />,
  company:  <Building2 className="w-8 h-8 text-blue-500" />,
  customer: <User className="w-8 h-8 text-green-500" />,
}

const roleColors: Record<string, string> = {
  admin:    'border-purple-200 hover:border-purple-400 dark:border-purple-800 dark:hover:border-purple-500',
  company:  'border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-500',
  customer: 'border-green-200 hover:border-green-400 dark:border-green-800 dark:hover:border-green-500',
}

const roleBadge: Record<string, string> = {
  admin:    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  company:  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
}

export default function HomePage() {
  const [users, setUsers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)
  const { setActiveUser, theme, toggleTheme, lang, toggleLang, T } = useApp()
  const router = useRouter()

  useEffect(() => {
    api.getDemoUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (user: DemoUser) => {
    setActiveUser(user)
    if (user.role === 'admin') router.push('/admin')
    else if (user.role === 'company') router.push('/company')
    else router.push('/customer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Top-right toggles */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
        >
          <Languages className="w-4 h-4" />
          {lang === 'en' ? 'TR' : 'EN'}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
          title={theme === 'light' ? T.darkMode : T.lightMode}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-blue-500 p-3 rounded-2xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">Koopilot</h1>
        </div>
        <p className="text-blue-200 text-lg max-w-md">{T.heroSubtitle}</p>
      </div>

      {loading ? (
        <div className="text-blue-300 text-lg">{T.loading}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {users.map((user) => (
            <button
              key={user.user_id}
              onClick={() => handleSelect(user)}
              className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${roleColors[user.role]}`}
            >
              <div className="flex items-start justify-between mb-4">
                {roleIcons[user.role]}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${roleBadge[user.role]}`}>
                  {T[user.role as 'admin' | 'company' | 'customer']}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{user.label}</h3>
              {user.tenant_id && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono truncate">{user.tenant_id.slice(0, 8)}…</p>
              )}
            </button>
          ))}
        </div>
      )}

      <p className="mt-8 text-blue-300/60 text-sm">{T.hackathonNote}</p>
    </div>
  )
}
