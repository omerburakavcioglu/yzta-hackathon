'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import ChatPanel from '@/components/ChatPanel'
import { ShoppingBag, Package, ChevronDown, ChevronUp, Truck } from 'lucide-react'

export default function CustomerPage() {
  const { activeUser, lang, T } = useApp()
  const router = useRouter()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!activeUser) { router.push('/'); return }
    if (activeUser.role !== 'customer') { router.push('/'); return }

    api.getCustomerOrders(activeUser as any)
      .then((data: any) => setOrders(data))
      .finally(() => setLoading(false))
  }, [activeUser])

  const toggleOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    setExpandedOrder(orderId)
    if (!orderDetails[orderId]) {
      const detail: any = await api.getCustomerOrderDetail(activeUser as any, orderId)
      setOrderDetails(prev => ({ ...prev, [orderId]: detail }))
    }
  }

  const handleChat = useCallback(async (message: string) => {
    if (!activeUser) return ''
    const res: any = await api.customerChat(activeUser as any, message)
    return res.answer
  }, [activeUser])

  if (!activeUser || activeUser.role !== 'customer') return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{T.customerTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{T.customerSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-gray-400 text-center py-20">{T.loading}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{T.noOrders}</p>
              </div>
            ) : (
              orders.map((order: any) => {
                const isExpanded = expandedOrder === order.id
                const detail = orderDetails[order.id]
                const shipment = order.shipment

                return (
                  <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <button
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                          <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{order.public_order_no}</span>
                            <StatusBadge status={order.status} lang={lang} />
                          </div>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                            {order.order_date} · ₺{Number(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {shipment && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <StatusBadge status={shipment.shipment_status} lang={lang} />
                            {shipment.delay_risk && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-semibold">!</span>
                            )}
                          </div>
                        )}
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        }
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-gray-50/50 dark:bg-gray-700/20">
                        {detail ? (
                          <>
                            {/* Items */}
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">{T.items}</h4>
                              <div className="space-y-1">
                                {(detail.items ?? []).map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{item.products?.name ?? 'Product'}</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {item.quantity} {T.qty} × ₺{Number(item.unit_price).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipment */}
                            {detail.shipment && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">{T.shipment}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400 dark:text-gray-500">{T.carrier}: </span>
                                    <span className="text-gray-700 dark:text-gray-300">{detail.shipment.carrier}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 dark:text-gray-500">{T.tracking}: </span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300">{detail.shipment.tracking_no}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 dark:text-gray-500">{T.status}: </span>
                                    <StatusBadge status={detail.shipment.shipment_status} lang={lang} />
                                  </div>
                                  <div>
                                    <span className="text-gray-400 dark:text-gray-500">{T.estDelivery}: </span>
                                    <span className="text-gray-700 dark:text-gray-300">{detail.shipment.estimated_delivery ?? '—'}</span>
                                  </div>
                                  {detail.shipment.delay_risk && (
                                    <div className="col-span-2">
                                      <span className="text-red-600 dark:text-red-400 text-xs font-semibold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                                        {T.delayRisk}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">{T.loadingDetails}</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Chat panel */}
          <div className="h-[600px]">
            <ChatPanel
              onSend={handleChat}
              title={T.customerAssistant}
              placeholder={T.chatPlaceholderCustomer}
              emptyText={T.chatPlaceholderCustomer}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
