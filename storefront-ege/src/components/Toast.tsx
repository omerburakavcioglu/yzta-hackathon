'use client'

import { useStore } from '@/lib/store'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      toast.type === 'success' ? 'bg-olive-700 text-white' : 'bg-red-500 text-white'
    }`}>
      {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  )
}
