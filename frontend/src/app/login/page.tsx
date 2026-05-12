'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Languages } from 'lucide-react'
import { useApp } from '@/lib/context'
import { dashboardPathFor } from '@/lib/auth'
import Logo from '@/components/Logo'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const { activeUser, theme, toggleTheme, lang, toggleLang, T } = useApp()
  const router = useRouter()

  // If already logged in, bounce to the appropriate dashboard.
  useEffect(() => {
    if (activeUser) router.replace(dashboardPathFor(activeUser))
  }, [activeUser, router])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Top-right toggles */}
      <div className="relative z-10 flex justify-end gap-2 p-4">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white/70 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 backdrop-blur transition border border-gray-200/60 dark:border-white/10"
        >
          <Languages className="w-4 h-4" />
          {lang === 'en' ? 'TR' : 'EN'}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/70 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 backdrop-blur transition border border-gray-200/60 dark:border-white/10"
          title={theme === 'light' ? T.darkMode : T.lightMode}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Centered card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-black/40 p-7 sm:p-9">
            {/* Logo + heading */}
            <div className="flex flex-col items-center text-center mb-7">
              <Logo size={56} />
              <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
                Koopilot
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {T.loginSubtitle}
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  )
}
