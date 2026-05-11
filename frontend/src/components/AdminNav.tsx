'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/context'
import { LayoutDashboard, ShoppingCart } from 'lucide-react'
import clsx from 'clsx'

export default function AdminNav() {
  const { T } = useApp()
  const pathname = usePathname()

  const tabs = [
    { href: '/admin',        label: T.navOverview,       icon: LayoutDashboard },
    { href: '/admin/orders', label: T.navOrderManagement, icon: ShoppingCart },
  ]

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6">
      <nav className="flex gap-1 max-w-7xl mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                active
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
