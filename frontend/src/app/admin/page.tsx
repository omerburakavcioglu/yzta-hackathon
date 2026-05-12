'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import AdminNav from '@/components/AdminNav'
import StatCard from '@/components/StatCard'
import { Building2, ShoppingCart, Users, MessageSquare, AlertTriangle, Truck, Activity } from 'lucide-react'

export default function AdminPage() {
  const { activeUser, T } = useApp()
  const router = useRouter()
  const [summary, setSummary] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeUser) { router.push('/login'); return }
    if (activeUser.role !== 'admin') { router.push('/login'); return }

    Promise.all([
      api.getAdminSummary(activeUser),
      api.getAdminTenants(activeUser),
      api.getAdminActivityLogs(activeUser),
    ]).then(([s, t, l]: any) => {
      setSummary(s)
      setTenants(t)
      setLogs(l)
    }).finally(() => setLoading(false))
  }, [activeUser])

  if (!activeUser || activeUser.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <AdminNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{T.adminTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{T.adminSubtitle}</p>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-20">{T.loading}</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title={T.totalCompanies}     value={summary?.total_companies ?? 0}         icon={Building2}     color="purple" />
              <StatCard title={T.totalOrders}        value={summary?.total_orders ?? 0}            icon={ShoppingCart}  color="blue" />
              <StatCard title={T.totalCustomers}     value={summary?.total_customers ?? 0}         icon={Users}         color="green" />
              <StatCard title={T.chatMessages}       value={summary?.total_chat_messages ?? 0}     icon={MessageSquare} color="gray" />
              <StatCard title={T.criticalStock}      value={summary?.total_critical_products ?? 0} icon={AlertTriangle} color="red" />
              <StatCard title={T.delayedShipments}   value={summary?.total_delayed_shipments ?? 0} icon={Truck}         color="yellow" />
            </div>

            {/* Company table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-800 dark:text-white">{T.companiesTable}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {[T.companiesTable, T.sector, T.orders, T.customers, T.criticalStockCol, T.delayedShipsCol, T.chatMsgsCol].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {tenants.map((t: any) => (
                      <tr key={t.tenant_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.company_name}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.sector}</td>
                        <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">{t.order_count}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t.customer_count}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${t.critical_stock_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {t.critical_stock_count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${t.delayed_shipment_count > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {t.delayed_shipment_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.chatbot_message_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-800 dark:text-white">{T.recentActivity}</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.slice(0, 15).map((log: any) => (
                  <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200">{log.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {log.tenants?.name ?? T.platform} · {log.action_type.replace(/_/g, ' ')} · {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
