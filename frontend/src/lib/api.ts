const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface DemoUser {
  label: string
  role: 'admin' | 'company' | 'customer'
  user_id: string
  tenant_id: string | null
  customer_id: string | null
}

function buildHeaders(user: DemoUser): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': user.user_id,
    'x-role': user.role,
  }
  if (user.tenant_id) h['x-tenant-id'] = user.tenant_id
  if (user.customer_id) h['x-customer-id'] = user.customer_id
  return h
}

async function get<T>(path: string, user: DemoUser): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: buildHeaders(user) })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function post<T>(path: string, body: unknown, user: DemoUser): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(user),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function put<T>(path: string, body: unknown, user: DemoUser): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(user),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function del(path: string, user: DemoUser): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(user),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
}

export interface OrderPayload {
  tenant_id: string
  customer_id: string
  public_order_no: string
  status: string
  total_amount: number
  order_date: string
}

export const api = {
  getDemoUsers: (): Promise<DemoUser[]> =>
    fetch(`${BASE_URL}/demo-users`).then(r => r.json()),

  // Admin
  getAdminSummary: (u: DemoUser) => get('/admin/summary', u),
  getAdminTenants: (u: DemoUser) => get('/admin/tenants', u),
  getAdminActivityLogs: (u: DemoUser) => get('/admin/activity-logs', u),

  // Admin — Order Management
  getAdminOrdersMeta: (u: DemoUser) => get<{ tenants: any[]; customers: any[] }>('/admin/orders/meta', u),
  getAdminOrders: (u: DemoUser, tenantId?: string, status?: string) => {
    const params = new URLSearchParams()
    if (tenantId) params.set('tenant_id', tenantId)
    if (status)   params.set('status', status)
    const qs = params.toString()
    return get<any[]>(`/admin/orders${qs ? `?${qs}` : ''}`, u)
  },
  createAdminOrder: (u: DemoUser, body: OrderPayload) =>
    post<any>('/admin/orders', body, u),
  updateAdminOrder: (u: DemoUser, orderId: string, body: Partial<OrderPayload>) =>
    put<any>(`/admin/orders/${orderId}`, body, u),
  deleteAdminOrder: (u: DemoUser, orderId: string) =>
    del(`/admin/orders/${orderId}`, u),

  // Company
  getCompanyDashboard: (u: DemoUser) => get('/company/dashboard', u),
  getCompanyOperationSummary: (u: DemoUser) => get('/company/operation-summary', u),
  getCompanyOrders: (u: DemoUser) => get<any[]>('/company/orders', u),
  getCompanyCustomers: (u: DemoUser) => get<any[]>('/company/customers', u),
  createCompanyOrder: (u: DemoUser, body: Omit<OrderPayload, 'tenant_id'>) =>
    post<any>('/company/orders', body, u),
  updateCompanyOrder: (u: DemoUser, orderId: string, body: Partial<Omit<OrderPayload, 'tenant_id'>>) =>
    put<any>(`/company/orders/${orderId}`, body, u),
  deleteCompanyOrder: (u: DemoUser, orderId: string) =>
    del(`/company/orders/${orderId}`, u),
  getCompanyInventory: (u: DemoUser) => get('/company/inventory', u),
  getCompanyCriticalInventory: (u: DemoUser) => get('/company/inventory/critical', u),
  getCompanyDelayedShipments: (u: DemoUser) => get('/company/shipments/delayed', u),
  getCompanyForecast: (u: DemoUser) => get('/company/forecast', u),
  companyChat: (u: DemoUser, message: string) => post<{ answer: string }>('/company/chat', { message }, u),

  // Customer
  getCustomerOrders: (u: DemoUser) => get('/customer/orders', u),
  getCustomerOrderDetail: (u: DemoUser, orderId: string) => get(`/customer/orders/${orderId}`, u),
  customerChat: (u: DemoUser, message: string) => post<{ answer: string }>('/customer/chat', { message }, u),
}
