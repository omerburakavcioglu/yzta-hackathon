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

// Emoji + label for product categories (used until real images are added)
export const CATEGORY_VISUAL: Record<string, { emoji: string; bg: string }> = {
  'Olive Oil': { emoji: '🫒', bg: 'from-olive-200 to-olive-100' },
  'Spreads':   { emoji: '🥄', bg: 'from-amber-200 to-cream-100' },
  'Olives':    { emoji: '🫒', bg: 'from-olive-300 to-olive-100' },
}

export const visualFor = (category: string) =>
  CATEGORY_VISUAL[category] || { emoji: '🌿', bg: 'from-olive-200 to-cream-100' }
