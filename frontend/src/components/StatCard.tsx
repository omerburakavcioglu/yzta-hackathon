'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  subtitle?: string
}

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/30',     icon: 'text-blue-500',   border: 'border-blue-100 dark:border-blue-800' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/30',   icon: 'text-green-500',  border: 'border-green-100 dark:border-green-800' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', icon: 'text-yellow-500', border: 'border-yellow-100 dark:border-yellow-800' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/30',       icon: 'text-red-500',    border: 'border-red-100 dark:border-red-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', icon: 'text-purple-500', border: 'border-purple-100 dark:border-purple-800' },
  gray:   { bg: 'bg-gray-50 dark:bg-gray-700/50',     icon: 'text-gray-500',   border: 'border-gray-100 dark:border-gray-700' },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }: Props) {
  const c = colorMap[color]
  return (
    <div className={clsx('rounded-xl border-2 p-5 flex items-center gap-4 bg-white dark:bg-gray-800 shadow-sm', c.border)}>
      <div className={clsx('rounded-lg p-3', c.bg)}>
        <Icon className={clsx('w-6 h-6', c.icon)} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
