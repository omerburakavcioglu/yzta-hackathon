export const TL = (n: number | string) =>
  `₺${Number(n).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const STATUS_LABELS: Record<string, string> = {
  preparing: 'Hazırlanıyor',
  packed: 'Paketlendi',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  delayed: 'Gecikti',
  cancelled: 'İptal Edildi',
}

export const SHIPMENT_LABELS: Record<string, string> = {
  waiting: 'Bekliyor',
  in_transit: 'Yolda',
  out_for_delivery: 'Dağıtımda',
  delivered: 'Teslim Edildi',
  delayed: 'Gecikti',
}

// Emoji + label for product categories (fallback when no product image matches)
export const CATEGORY_VISUAL: Record<string, { emoji: string; bg: string }> = {
  'Olive Oil': { emoji: '🫒', bg: 'from-olive-200 to-olive-100' },
  'Spreads':   { emoji: '🥄', bg: 'from-amber-200 to-cream-100' },
  'Olives':    { emoji: '🫒', bg: 'from-olive-300 to-olive-100' },
}

export const visualFor = (category: string) =>
  CATEGORY_VISUAL[category] || { emoji: '🌿', bg: 'from-olive-200 to-cream-100' }

// Real Ege Zeytincilik product photos, matched by keyword in the product name.
// First matching rule wins, so order from most specific to most generic.
// Files live in /public/products/.
const PRODUCT_IMAGE_RULES: { match: RegExp; url: string }[] = [
  { match: /ezme|paste|tapenade/i,                                url: '/products/paste-200g.jpg' },
  { match: /çizik|yeşil\s*zeytin|green\s*olive/i,                 url: '/products/green-olives-1kg.jpg' },
  { match: /sele|siyah\s*zeytin|black\s*olive|gemlik|salamura/i,  url: '/products/black-olives-1kg.jpg' },
  { match: /teneke|2\s*l\b|2lt|3\s*l\b|5\s*l\b|5lt|organik/i,     url: '/products/tin-2l.jpg' },
  { match: /500\s*ml|soğuk\s*sık|erken\s*hasat|cold\s*press/i,    url: '/products/bottle-500ml.jpg' },
  { match: /zeytinyağ|olive\s*oil|sızma|natürel/i,                url: '/products/bottle-1l.jpg' },
]

export const imageFor = (name: string): string | null => {
  for (const r of PRODUCT_IMAGE_RULES) if (r.match.test(name)) return r.url
  return null
}
