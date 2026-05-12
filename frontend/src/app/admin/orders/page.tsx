'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { api, OrderPayload } from '@/lib/api'
import Navbar from '@/components/Navbar'
import AdminNav from '@/components/AdminNav'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Pencil, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react'

const ORDER_STATUSES = ['preparing', 'packed', 'shipped', 'delivered', 'delayed', 'cancelled']

interface Tenant { id: string; name: string; sector: string }
interface Customer { id: string; tenant_id: string; full_name: string; email: string }
interface Order {
  id: string
  public_order_no: string
  tenant_id: string
  customer_id: string
  status: string
  total_amount: number
  order_date: string
  company_name: string
  customer_name: string
}

const EMPTY_FORM: OrderPayload = {
  tenant_id: '',
  customer_id: '',
  public_order_no: '',
  status: 'preparing',
  total_amount: 0,
  order_date: new Date().toISOString().slice(0, 10),
}

export default function AdminOrdersPage() {
  const { activeUser, lang, T } = useApp()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterTenant, setFilterTenant] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OrderPayload>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchOrders = useCallback(async () => {
    if (!activeUser) return
    setLoading(true)
    try {
      const data = await api.getAdminOrders(activeUser, filterTenant || undefined, filterStatus || undefined)
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }, [activeUser, filterTenant, filterStatus])

  useEffect(() => {
    if (!activeUser) { router.push('/login'); return }
    if (activeUser.role !== 'admin') { router.push('/login'); return }

    api.getAdminOrdersMeta(activeUser).then(({ tenants, customers }) => {
      setTenants(tenants)
      setCustomers(customers)
    })
  }, [activeUser])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Customers filtered by selected company in form
  const availableCustomers = form.tenant_id
    ? customers.filter(c => c.tenant_id === form.tenant_id)
    : customers

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditingId(order.id)
    setForm({
      tenant_id: order.tenant_id,
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
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!activeUser) return
    if (!form.tenant_id || !form.customer_id || !form.public_order_no || !form.order_date) return
    setSaving(true)
    try {
      if (editingId) {
        await api.updateAdminOrder(activeUser, editingId, form)
        showToast(T.orderUpdated)
      } else {
        await api.createAdminOrder(activeUser, form)
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
      await api.deleteAdminOrder(activeUser, deleteTarget.id)
      showToast(T.orderDeleted)
      setDeleteTarget(null)
      fetchOrders()
    } catch {
      showToast(T.errorOccurred, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const setField = (field: keyof OrderPayload, value: string | number) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Reset customer when company changes
      if (field === 'tenant_id') next.customer_id = ''
      return next
    })
  }

  if (!activeUser || activeUser.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <AdminNav />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />
          }
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{T.orderMgmtTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{T.orderMgmtSubtitle}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {T.addOrder}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterTenant}
            onChange={e => setFilterTenant(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">{T.allCompanies}</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">{T.allStatuses}</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span className="ml-auto text-sm text-gray-400 dark:text-gray-500 self-center">
            {orders.length} {lang === 'tr' ? 'sipariş' : 'orders'}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-400 py-20">{T.loading}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-20 text-sm">{T.noOrdersFound}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[T.orderNoLabel, T.company, T.customerCol, T.status, T.totalAmount, T.orderDate, T.actions].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{order.public_order_no}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{order.company_name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customer_name}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} lang={lang} /></td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">₺{Number(order.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap">{order.order_date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(order)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title={T.editOrder}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            title={T.deleteOrder}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? T.editOrder : T.newOrder}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.company}</label>
                <select
                  value={form.tenant_id}
                  onChange={e => setField('tenant_id', e.target.value)}
                  disabled={!!editingId}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                >
                  <option value="">{T.selectCompany}</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{T.customerCol}</label>
                <select
                  value={form.customer_id}
                  onChange={e => setField('customer_id', e.target.value)}
                  disabled={!form.tenant_id}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                >
                  <option value="">{T.selectCustomer}</option>
                  {availableCustomers.map(c => (
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

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {T.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.tenant_id || !form.customer_id || !form.public_order_no}
                className="px-5 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? T.saving : T.saveOrder}
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
