'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApp } from '@/lib/context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import StatCard from '@/components/StatCard'
import {
    ArrowLeft, Download, TrendingUp, ShoppingCart,
    DollarSign, AlertTriangle, Package
} from 'lucide-react'
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

type Report = {
    month: string
    generated_at: string
    total_orders: number
    total_revenue: number
    status_distribution: Record<string, number>
    daily_sales: Array<{ date: string; revenue: number }>
    top_products: Array<{ name?: string; category?: string; sales?: number }>
    critical_inventory: Array<{ name?: string; category?: string; stock_quantity?: number; critical_threshold?: number }>
}

export default function MonthlyReportPage() {
    const { activeUser, lang } = useApp()
    const router = useRouter()
    const params = useParams()
    const reportId = params.id as string

    const [report, setReport] = useState<Report | null>(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!activeUser) {
            router.push('/login')
            return
        }

        const loadReport = async () => {
            try {
                const data = await api.getCompanyMonthlyReport(activeUser, reportId)
                setReport(data as Report)
            } catch (err) {
                console.error('Failed to load report:', err)
                router.push('/company')
            } finally {
                setLoading(false)
            }
        }

        loadReport()
    }, [activeUser, reportId, router])

    const handleExportExcel = async () => {
        if (!report) return

        setExporting(true)
        try {
            const view = buildReportView(report)
            const { Workbook } = await import('exceljs')
            const wb = new Workbook()

            // Sheet 1: Summary
            const wsSummary = wb.addWorksheet('Özet')
            wsSummary.columns = [
                { header: 'Metrik', key: 'metric', width: 30 },
                { header: 'Değer', key: 'value', width: 20 },
            ]

            wsSummary.addRows([
                { metric: 'Ay', value: report.month },
                { metric: 'Toplam Siparişler', value: view.totalOrders },
                { metric: 'Toplam Gelir', value: `₺${view.totalRevenue.toFixed(2)}` },
                { metric: 'Rapor Tarihi', value: report.generated_at },
                ...(view.isDemo ? [{ metric: 'Not', value: 'Bu raporda bazı alanlar örnek veriyle gösterildi.' }] : []),
            ])

            wsSummary.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            wsSummary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

            // Sheet 2: Status Distribution
            const wsStatus = wb.addWorksheet('Durum Dağılımı')
            wsStatus.columns = [
                { header: 'Durum', key: 'status', width: 20 },
                { header: 'Sipariş Sayısı', key: 'count', width: 20 },
            ]

            const statusRows = Object.entries(view.statusDistribution).map(([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count: count,
            }))

            wsStatus.addRows(statusRows)
            wsStatus.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            wsStatus.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

            // Sheet 3: Daily Sales
            const wsSales = wb.addWorksheet('Günlük Satışlar')
            wsSales.columns = [
                { header: 'Tarih', key: 'date', width: 15 },
                { header: 'Gelir (₺)', key: 'revenue', width: 15 },
            ]

            wsSales.addRows(view.dailySales.map((s: any) => ({
                date: s.date,
                revenue: s.revenue.toFixed(2),
            })))

            wsSales.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            wsSales.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

            // Sheet 4: Top Products
            const wsProducts = wb.addWorksheet('En Çok Satılan')
            wsProducts.columns = [
                { header: 'Ürün', key: 'name', width: 30 },
                { header: 'Kategori', key: 'category', width: 20 },
                { header: 'Satılan Miktar', key: 'sales', width: 15 },
            ]

            wsProducts.addRows(view.topProducts.map((p: any) => ({
                name: p.name || 'Unknown',
                category: p.category || 'N/A',
                sales: p.sales || 0,
            })))

            wsProducts.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            wsProducts.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

            // Sheet 5: Critical Inventory
            if (view.criticalInventory.length > 0) {
                const wsCritical = wb.addWorksheet('Kritik Stok')
                wsCritical.columns = [
                    { header: 'Ürün', key: 'name', width: 30 },
                    { header: 'Kategori', key: 'category', width: 20 },
                    { header: 'Mevcut Stok', key: 'stock', width: 15 },
                    { header: 'Kritik Seviye', key: 'threshold', width: 15 },
                ]

                wsCritical.addRows(view.criticalInventory.map((p: any) => ({
                    name: p.name || 'Unknown',
                    category: p.category || 'N/A',
                    stock: p.stock_quantity || 0,
                    threshold: p.critical_threshold || 0,
                })))

                wsCritical.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                wsCritical.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }
            }

            const buffer = await wb.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${report.month}_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`
            link.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
            alert('Excel indirme başarısız oldu')
        } finally {
            setExporting(false)
        }
    }

    if (!activeUser || activeUser.role !== 'company') return null

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-500">Rapor yükleniyor...</div>
                </div>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-500">Rapor bulunamadı</div>
                </div>
            </div>
        )
    }

    const view = buildReportView(report)
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    const statusEntries = Object.entries(view.statusDistribution).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        value: v,
    }))

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{report.month} Raporu</h1>
                            {view.isDemo && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                    Örnek veri gösterimi
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Oluşturulma: {report.generated_at}</p>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'İndiriliyor...' : 'Excel İndir'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Toplam Siparişler" value={view.totalOrders} icon={ShoppingCart} color="blue" />
                    <StatCard title="Toplam Gelir" value={`₺${view.totalRevenue.toFixed(0)}`} icon={DollarSign} color="green" />
                    <StatCard title="Ort. Sipariş Değeri" value={`₺${view.avgOrderValue.toFixed(0)}`} icon={TrendingUp} color="purple" />
                    <StatCard title="Kritik Stok" value={view.criticalInventory.length} icon={AlertTriangle} color="red" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Daily Sales Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Günlük Satışlar</h2>
                            {view.demoFlags.dailySales && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">(örnek)</span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={view.dailySales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sipariş Durumu Dağılımı</h2>
                            {view.demoFlags.statusDistribution && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">(örnek)</span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusEntries}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusEntries.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                {view.topProducts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">En Çok Satılan Ürünler</h2>
                            {view.demoFlags.topProducts && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">(örnek)</span>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Ürün</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Kategori</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Satış Miktarı</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {view.topProducts.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{p.name || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category || '—'}</td>
                                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">{p.sales ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Critical Inventory */}
                {view.criticalInventory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-900/50 shadow-sm bg-red-50/50 dark:bg-red-900/10">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kritik Stok Seviyesi</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-red-100 dark:bg-red-900/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-red-900 dark:text-red-300">Ürün</th>
                                        <th className="px-4 py-3 text-left font-medium text-red-900 dark:text-red-300">Kategori</th>
                                        <th className="px-4 py-3 text-left font-medium text-red-900 dark:text-red-300">Mevcut Stok</th>
                                        <th className="px-4 py-3 text-left font-medium text-red-900 dark:text-red-300">Kritik Seviye</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-200 dark:divide-red-900/50">
                                    {view.criticalInventory.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-red-100/50 dark:hover:bg-red-900/20">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{p.name || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category || '—'}</td>
                                            <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">{p.stock_quantity ?? 0}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.critical_threshold ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function buildReportView(report: Report) {
    const dailySalesUsable = Array.isArray(report.daily_sales) && report.daily_sales.length >= 5
    const statusUsable = report.status_distribution && Object.values(report.status_distribution).some(v => Number(v) > 0)

    const topProductsUsable = Array.isArray(report.top_products) && report.top_products.some(p => {
        const nameOk = Boolean(p?.name && String(p.name).trim() && String(p.name).toLowerCase() !== 'unknown')
        const salesOk = Number(p?.sales ?? 0) > 0
        return nameOk || salesOk
    })

    const demoFlags = {
        dailySales: !dailySalesUsable,
        statusDistribution: !statusUsable,
        topProducts: !topProductsUsable,
    }

    const dailySales = dailySalesUsable ? report.daily_sales : makeMockDailySales(7)
    const statusDistribution = statusUsable ? report.status_distribution : {
        delivered: 24,
        shipped: 9,
        preparing: 7,
        delayed: 2,
    }
    const topProducts = topProductsUsable ? report.top_products : makeMockTopProducts()

    const totalOrders = Number(report.total_orders ?? 0)
    const totalRevenue = Number(report.total_revenue ?? 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
        isDemo: demoFlags.dailySales || demoFlags.statusDistribution || demoFlags.topProducts,
        demoFlags,
        dailySales,
        statusDistribution,
        topProducts,
        criticalInventory: Array.isArray(report.critical_inventory) ? report.critical_inventory : [],
        totalOrders,
        totalRevenue,
        avgOrderValue,
    }
}

function makeMockDailySales(days: number) {
    const today = new Date()
    const out: Array<{ date: string; revenue: number }> = []
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const iso = d.toISOString().slice(0, 10)
        const base = 40 + (days - i) * 8
        const jitter = (i % 3) * 6
        out.push({ date: iso, revenue: base + jitter })
    }
    return out
}

function makeMockTopProducts() {
    return [
        { name: 'Taze Peynir (1kg)', category: 'Süt Ürünleri', sales: 38 },
        { name: 'Organik Yumurta (10lu)', category: 'Kahvaltılık', sales: 31 },
        { name: 'Zeytinyağı (1L)', category: 'Yağ', sales: 22 },
        { name: 'Bal (450g)', category: 'Doğal Ürün', sales: 17 },
        { name: 'Tam Buğday Unu (2kg)', category: 'Bakliyat', sales: 12 },
    ]
}
