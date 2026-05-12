'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ChatPanel from '@/components/ChatPanel'
import {
  ShoppingCart, PackageCheck, Truck, AlertTriangle,
  BarChart3, Sparkles, Package, RefreshCw,
  Plus, Pencil, Trash2, X, AlertCircle, CheckCircle, FileText
} from 'lucide-react'

const ORDER_STATUSES = ['preparing', 'packed', 'shipped', 'delivered', 'delayed', 'cancelled']

const EMPTY_FORM = {
  customer_id: '',
  public_order_no: '',
  status: 'preparing',
  total_amount: 0,
  order_date: new Date().toISOString().slice(0, 10),
}

const EMPTY_PRODUCT_FORM = {
  name: '',
  category: '',
  stock_quantity: 0,
  critical_threshold: 10,
  unit_price: 0,
}

export default function CompanyPage() {
  const { activeUser, lang, T } = useApp()
  const router = useRouter()

  const [dashboard, setDashboard] = useState<any>(null)
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [forecast, setForecast] = useState<any[]>([])
  const [monthlyReports, setMonthlyReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'forecast'>('orders')

  // Orders CRUD state
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Inventory CRUD state
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT_FORM })
  const [productSaving, setProductSaving] = useState(false)
  const [productDeleteTarget, setProductDeleteTarget] = useState<any | null>(null)
  const [productDeleting, setProductDeleting] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchOrders = useCallback(async () => {
    if (!activeUser) return
    setOrdersLoading(true)
    try {
      const data = await api.getCompanyOrders(activeUser)
      setOrders(data)
    } finally {
      setOrdersLoading(false)
    }
  }, [activeUser])

  useEffect(() => {
    if (!activeUser) { router.push('/login'); return }
    if (activeUser.role !== 'company') { router.push('/login'); return }

    Promise.all([
      api.getCompanyDashboard(activeUser),
      api.getCompanyForecast(activeUser),
      api.getCompanyOrders(activeUser),
      api.getCompanyCustomers(activeUser),
      api.getCompanyMonthlyReports(activeUser),
      api.getCompanyInventory(activeUser),
    ]).then(([d, f, o, c, mr, p]: any) => {
      setDashboard(d)
      setForecast(f)
      setOrders(o)
      setCustomers(c)
      setMonthlyReports(mr)
      setProducts(p)
    }).finally(() => setLoading(false))
  }, [activeUser])

  const fetchProducts = useCallback(async () => {
    if (!activeUser) return
    setProductsLoading(true)
    try {
      const data = await api.getCompanyInventory(activeUser)
      setProducts(data)
    } finally {
      setProductsLoading(false)
    }
  }, [activeUser])

  const openAddProduct = () => {
    setEditingProductId(null)
    setProductForm({ ...EMPTY_PRODUCT_FORM })
    setProductModalOpen(true)
  }

  const openEditProduct = (product: any) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      category: product.category,
      stock_quantity: product.stock_quantity,
      critical_threshold: product.critical_threshold,
      unit_price: Number(product.unit_price),
    })
    setProductModalOpen(true)
  }

  const closeProductModal = () => {
    setProductModalOpen(false)
    setEditingProductId(null)
    setProductForm({ ...EMPTY_PRODUCT_FORM })
  }

  const setProductField = (field: string, value: string | number) => {
    setProductForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProduct = async () => {
    if (!activeUser) return
    if (!productForm.name.trim() || !productForm.category.trim()) return
    setProductSaving(true)
    try {
      if (editingProductId) {
        await api.updateCompanyProduct(activeUser, editingProductId, productForm)
        showToast(T.productUpdated)
      } else {
        await api.createCompanyProduct(activeUser, productForm)
        showToast(T.productCreated)
      }
      closeProductModal()
      fetchProducts()
    } catch {
      showToast(T.errorOccurred, 'error')
    } finally {
      setProductSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!activeUser || !productDeleteTarget) return
    setProductDeleting(true)
    try {
      await api.deleteCompanyProduct(activeUser, productDeleteTarget.id)
      showToast(T.productDeleted)
      setProductDeleteTarget(null)
      fetchProducts()
    } catch (e: any) {
      const msg = String(e?.message ?? '')
      showToast(msg.includes('409') ? T.cannotDeleteReferenced : T.errorOccurred, 'error')
    } finally {
      setProductDeleting(false)
    }
  }

  const loadSummary = async () => {
    if (!activeUser) return
    setSummaryLoading(true)
    try {
      const res: any = await api.getCompanyOperationSummary(activeUser)
      setSummary(res.summary)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleChat = useCallback(async (message: string) => {
    if (!activeUser) return ''
    const res: any = await api.companyChat(activeUser, message)
    return res.answer
  }, [activeUser])

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setModalOpen(true)
  }

  const openEdit = (order: any) => {
    setEditingId(order.id)
    setForm({
      customer_id: order.customer_id,
      public_order_no: order.public_order_no,
      status: order.status,
      total_amount: order.total_amount,
      order_date: order.order_date,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  const handleSave = async () => {
    if (!activeUser) return
    if (!form.customer_id || !form.public_order_no || !form.order_date) return
    setSaving(true)
    try {
      if (editingId) {
        await api.updateCompanyOrder(activeUser, editingId, form)
        showToast(T.orderUpdated)
      } else {
        await api.createCompanyOrder(activeUser, form)
        showToast(T.orderCreated)
      }
      closeModal()
      fetchOrders()
    } catch {
      showToast(T.errorOccurred, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activeUser || !deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteCompanyOrder(activeUser, deleteTarget.id)
      showToast(T.orderDeleted)
      setDeleteTarget(null)
      fetchOrders()
    } catch {
      showToast(T.errorOccurred, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const setField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (!activeUser || activeUser.role !== 'company') return null

  const tabs = [
    { key: 'orders', label: T.tabOrders },
    { key: 'inventory', label: T.tabInventory },
    { key: 'forecast', label: T.tabForecast },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{T.companyTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{T.companySubtitle}</p>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-20">{T.loading}</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <StatCard title={T.todayOrders} value={dashboard?.today_order_count ?? 0} icon={ShoppingCart} color="blue" />
              <StatCard title={T.preparing} value={dashboard?.pending_order_count ?? 0} icon={Package} color="yellow" />
              <StatCard title={T.packed} value={dashboard?.packed_order_count ?? 0} icon={PackageCheck} color="purple" />
              <StatCard title={T.shipped} value={dashboard?.shipped_order_count ?? 0} icon={Truck} color="green" />
              <StatCard title={T.delayedOrders} value={dashboard?.delayed_order_count ?? 0} icon={AlertTriangle} color="red" />
              <StatCard title={T.criticalStock} value={dashboard?.critical_stock_count ?? 0} icon={AlertTriangle} color="red" />
              <StatCard title={T.delayedShips} value={dashboard?.delayed_shipment_count ?? 0} icon={Truck} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Operation Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h2 className="font-semibold text-gray-800 dark:text-white">{T.aiSummaryTitle}</h2>
                    </div>
                    <button
                      onClick={loadSummary}
                      disabled={summaryLoading}
                      className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
                      {summaryLoading ? T.generating : T.generate}
                    </button>
                  </div>
                  {summary ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">{T.aiSummaryPlaceholder || "Yapay zeka özeti için oluştur butonuna tıklayın."}</p>
                  )}
                </div>

                {/* Monthly Reports */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h2 className="font-semibold text-gray-800 dark:text-white">Aylık Raporlar</h2>
                  </div>
                  <div className="space-y-3">
                    {monthlyReports.length > 0 ? (
                      monthlyReports.map(report => (
                        <div
                          key={report.id}
                          onClick={() => router.push(`/company/reports/${report.id}`)}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">{report.month}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{report.date}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Henüz aylık rapor bulunmuyor.</p>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex border-b border-gray-100 dark:border-gray-700">
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-sm font-medium transition ${activeTab === tab.key
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'orders' && (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {orders.length} {lang === 'tr' ? 'sipariş' : 'orders'}
                        </span>
                        <button
                          onClick={openAdd}
                          className="flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <Plus className="w-4 h-4" />
                          {T.addOrder}
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        {ordersLoading ? (
                          <div className="text-center text-gray-400 py-10 text-sm">{T.loading}</div>
                        ) : orders.length === 0 ? (
                          <div className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">{T.noOrdersFound}</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                              <tr>
                                {[T.orderNo, T.customerCol, T.status, T.amount, T.date, T.actions].map(h => (
                                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {orders.map((o: any) => (
                                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                                  <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">{o.public_order_no}</td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{o.customer_name}</td>
                                  <td className="px-4 py-3"><StatusBadge status={o.status} lang={lang} /></td>
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">₺{Number(o.total_amount).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap">{o.order_date}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => openEdit(o)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                        title={T.editOrder}
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteTarget(o)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                        title={T.deleteOrder}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'inventory' && (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {products.length} {lang === 'tr' ? 'ürün' : 'products'}
                        </span>
                        <button
                          onClick={openAddProduct}
                          className="flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <Plus className="w-4 h-4" />
                          {T.addProduct}
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        {productsLoading ? (
                          <div className="text-center text-gray-400 py-10 text-sm">{T.loading}</div>
                        ) : products.length === 0 ? (
                          <div className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">{T.noProducts}</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                              <tr>
                                {[T.product, T.category, T.stock, T.threshold, T.status, T.price, T.actions].map(h => (
                                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {products.map((p: any) => {
                                const isCritical = p.stock_quantity <= p.critical_threshold
                                return (
                                  <tr
                                    key={p.id}
                                    className={isCritical
                                      ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}
                                  >
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category}</td>
                                    <td className={`px-4 py-3 font-bold ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                      {p.stock_quantity}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{p.critical_threshold}</td>
                                    <td className="px-4 py-3">
                                      {isCritical ? (
                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                                          {T.critical}
                                        </span>
                                      ) : (
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                                          OK
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">₺{Number(p.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => openEditProduct(p)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                          title={T.editProduct}
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setProductDeleteTarget(p)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                          title={T.deleteProduct}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'forecast' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            {[T.product, T.stock, T.avgPerDay, T.forecast7, T.daysToStockout, T.restockQty].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {forecast.map((f: any) => (
                            <tr key={f.product_id} className={f.stock_risk ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}>
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                {f.product_name}
                                {f.stock_risk && (
                                  <span className="ml-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">
                                    {T.atRisk}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{f.current_stock}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.average_daily_sales}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.forecast_7_days}</td>
                              <td className={`px-4 py-3 font-medium ${f.stock_risk ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {f.days_until_stockout ?? '—'}
                              </td>
                              <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-medium">{f.recommended_restock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: chat */}
              <div className="h-[600px]">
                <ChatPanel
                  onSend={handleChat}
                  title={T.operationsAssistant}
                  placeholder={T.chatPlaceholderCompany}
                  emptyText={T.chatPlaceholderCompany}
                />
              </div>
            </div>

            {/* Top selling */}
            {(dashboard?.top_selling_products ?? []).length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold text-gray-800 dark:text-white">{T.topSelling}</h2>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {dashboard.top_selling_products.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3">
                      <span className="text-2xl font-bold text-blue-400 dark:text-blue-500">#{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.product?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.total_sold} {T.unitsSold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? T.editOrder : T.newOrder}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.customerCol}</label>
                <select
                  value={form.customer_id}
                  onChange={e => setField('customer_id', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">{T.selectCustomer}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                  ))}
                </select>
              </div>

              {/* Order No */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.orderNoLabel}</label>
                <input
                  type="text"
                  value={form.public_order_no}
                  onChange={e => setField('public_order_no', e.target.value)}
                  placeholder="ORD-999"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.status}</label>
                  <select
                    value={form.status}
                    onChange={e => setField('status', e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.totalAmount} (₺)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.total_amount}
                    onChange={e => setField('total_amount', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.orderDate}</label>
                <input
                  type="date"
                  value={form.order_date}
                  onChange={e => setField('order_date', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {T.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.customer_id || !form.public_order_no}
                className="px-5 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? T.saving : T.saveOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Add / Edit Modal ───────────────────────── */}
      {productModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingProductId ? T.editProduct : T.newProduct}
              </h2>
              <button onClick={closeProductModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.productName}</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductField('name', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.category}</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={e => setProductField('category', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.stock}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={productForm.stock_quantity}
                    onChange={e => setProductField('stock_quantity', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.threshold}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={productForm.critical_threshold}
                    onChange={e => setProductField('critical_threshold', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.price} (₺)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={productForm.unit_price}
                  onChange={e => setProductField('unit_price', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={closeProductModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {T.cancel}
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={productSaving || !productForm.name.trim() || !productForm.category.trim()}
                className="px-5 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {productSaving ? T.saving : T.saveOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Delete Confirmation ─────────────────────── */}
      {productDeleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{T.deleteProduct}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {T.confirmDeleteProduct} <span className="font-semibold text-gray-900 dark:text-white">{productDeleteTarget.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {T.cancel}
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={productDeleting}
                className="px-5 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {productDeleting ? T.saving : T.deleteProduct}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{T.deleteOrder}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {T.confirmDelete} <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget.public_order_no}</span>{T.confirmDeleteSuffix}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {T.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? T.saving : T.deleteOrder}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
