'use client'

import { useEffect, useState, useMemo } from 'react'
import { api, Product } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')
  const [sort, setSort] = useState<'name' | 'price-asc' | 'price-desc'>('name')

  useEffect(() => {
    api.products()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))),
    [products],
  )

  const filtered = useMemo(() => {
    let list = products
    if (category !== 'all') list = list.filter(p => p.category === category)
    list = [...list]
    if (sort === 'name')        list.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    if (sort === 'price-asc')   list.sort((a, b) => a.unit_price - b.unit_price)
    if (sort === 'price-desc')  list.sort((a, b) => b.unit_price - a.unit_price)
    return list
  }, [products, category, sort])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-olive-600 font-semibold mb-1">Ürünlerimiz</div>
        <h1 className="font-serif text-4xl text-olive-900 font-bold">Tüm Ürünler</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-olive-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 text-sm rounded-full border transition ${
              category === 'all'
                ? 'bg-olive-700 text-white border-olive-700'
                : 'bg-white text-ink-700 border-olive-200 hover:border-olive-400'
            }`}
          >
            Hepsi
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 text-sm rounded-full border transition ${
                category === c
                  ? 'bg-olive-700 text-white border-olive-700'
                  : 'bg-white text-ink-700 border-olive-200 hover:border-olive-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="ml-auto bg-white border border-olive-200 rounded-full px-4 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-olive-300"
        >
          <option value="name">İsme göre</option>
          <option value="price-asc">Fiyat (artan)</option>
          <option value="price-desc">Fiyat (azalan)</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-ink-400 py-20">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-ink-400 py-20">Bu kategoride ürün yok.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
