'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DemoUser } from './api'
import t, { Lang, Translations } from './translations'

interface AppContextType {
  activeUser: DemoUser | null
  setActiveUser: (user: DemoUser | null) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  lang: Lang
  toggleLang: () => void
  T: Translations
}

const AppContext = createContext<AppContextType>({
  activeUser: null,
  setActiveUser: () => {},
  theme: 'light',
  toggleTheme: () => {},
  lang: 'en',
  toggleLang: () => {},
  T: t.en,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUserState] = useState<DemoUser | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('koopilot_user')
    const storedTheme = localStorage.getItem('koopilot_theme') as 'light' | 'dark' | null
    const storedLang = localStorage.getItem('koopilot_lang') as Lang | null

    if (stored) {
      try { setActiveUserState(JSON.parse(stored)) } catch { /* ignore */ }
    }
    if (storedTheme) setTheme(storedTheme)
    if (storedLang) setLang(storedLang)
  }, [])

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('koopilot_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('koopilot_lang', lang)
  }, [lang])

  const setActiveUser = (user: DemoUser | null) => {
    setActiveUserState(user)
    if (user) localStorage.setItem('koopilot_user', JSON.stringify(user))
    else localStorage.removeItem('koopilot_user')
  }

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  const toggleLang = () => setLang(prev => prev === 'en' ? 'tr' : 'en')

  return (
    <AppContext.Provider value={{ activeUser, setActiveUser, theme, toggleTheme, lang, toggleLang, T: t[lang] }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
