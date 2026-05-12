'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { dashboardPathFor } from '@/lib/auth'
import Logo from '@/components/Logo'

export default function HomePage() {
  const { activeUser } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (activeUser) router.replace(dashboardPathFor(activeUser))
    else router.replace('/login')
  }, [activeUser, router])

  // Brief brand splash while the redirect runs.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Logo size={56} />
    </div>
  )
}
