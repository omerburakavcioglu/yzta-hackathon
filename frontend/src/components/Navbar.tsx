'use client'

import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, Sun, Languages } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const { activeUser, setActiveUser, theme, toggleTheme, lang, toggleLang, T } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    setActiveUser(null)
    router.push('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
      <Logo size={32} showWordmark wordmarkClassName="text-lg sm:text-xl" />

      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'Switch to Turkish' : 'İngilizceye geç'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Languages className="w-4 h-4" />
          {lang === 'en' ? 'TR' : 'EN'}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? T.darkMode : T.lightMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {activeUser && (
          <>
            <div className="hidden sm:block text-right ml-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activeUser.label}</p>
              <p className="text-xs text-gray-400 capitalize">{activeUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              title={T.logOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
