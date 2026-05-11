const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const PREFIX = '/storefront/ege'

export interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  critical_threshold: number
  unit_price: number
}

export interface Customer {
  id: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
}

export interface Order {
  id: string
  public_order_no: string
  status: string
  total_amount: number
  order_date: string
  is_guest?: boolean
  shipment?: any
  items?: any[]
}

export interface CartLine {
  product_id: string
  quantity: number
}

export interface GuestInfo {
  full_name: string
  email: string
  phone?: string
  address?: string
}

async function http<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${PREFIX}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).detail || '' } catch {}
    throw new Error(detail || `API ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  products: () => http<Product[]>('GET', '/products'),
  product: (id: string) => http<Product>('GET', `/products/${id}`),

  signup: (body: {
    full_name: string
    email: string
    password: string
    phone?: string
    address?: string
  }) => http<Customer>('POST', '/signup', body),

  login: (body: { email: string; password: string }) =>
    http<Customer>('POST', '/login', body),

  me: (customer_id: string) =>
    http<Customer>('GET', `/me?customer_id=${customer_id}`),

  createOrder: (body: {
    items: CartLine[]
    customer_id?: string
    guest?: GuestInfo
  }) => http<{ order: Order; customer: Customer; items: any[] }>(
    'POST',
    '/orders',
    body,
  ),

  myOrders: (customer_id: string) =>
    http<Order[]>('GET', `/orders?customer_id=${customer_id}`),

  orderDetail: (id: string, customer_id?: string) => {
    const qs = customer_id ? `?customer_id=${customer_id}` : ''
    return http<Order>('GET', `/orders/${id}${qs}`)
  },

  trackOrder: (order_no: string) =>
    http<Order>('GET', `/track/${order_no}`),

  chat: (body: { message: string; customer_id?: string }) =>
    http<{ answer: string }>('POST', '/chat', body),
}
