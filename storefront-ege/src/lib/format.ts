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

// Real product photos matched by keyword in the product name (case-insensitive).
// First matching rule wins, so order from most specific to most generic.
const PRODUCT_IMAGE_RULES: { match: RegExp; url: string }[] = [
  { match: /teneke|5\s*l\b|5lt|3\s*l\b/i,
    url: 'https://images.unsplash.com/photo-1610547939489-73202bc6afda?auto=format&fit=crop&w=800&q=80' },
  { match: /500\s*ml|soğuk\s*sık|cold\s*press/i,
    url: 'https://images.unsplash.com/photo-1574785289548-b6604d39125d?auto=format&fit=crop&w=800&q=80' },
  { match: /zeytinyağ|olive\s*oil|sızma|erken\s*hasat/i,
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
  { match: /ezme|paste|tapenade/i,
    url: 'https://images.unsplash.com/photo-1608547862740-481598c69eb0?auto=format&fit=crop&w=800&q=80' },
  { match: /siyah\s*zeytin|black\s*olive|gemlik|salamura/i,
    url: 'https://images.unsplash.com/photo-1596099477998-880bc06e09f9?auto=format&fit=crop&w=800&q=80' },
  { match: /yeşil\s*zeytin|green\s*olive/i,
    url: 'https://images.unsplash.com/photo-1622637012640-83ff490e189f?auto=format&fit=crop&w=800&q=80' },
]

export const imageFor = (name: string): string | null => {
  for (const r of PRODUCT_IMAGE_RULES) if (r.match.test(name)) return r.url
  return null
}
