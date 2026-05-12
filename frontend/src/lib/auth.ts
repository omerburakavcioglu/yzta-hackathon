import { DemoUser } from './api'

interface Credential {
  username: string
  password: string
  user: DemoUser
}

// Hardcoded demo credentials. user_id / tenant_id / customer_id mirror the
// backend's DEMO_USERS so the existing tenant-based logic keeps working.
const CREDENTIALS: Credential[] = [
  {
    username: 'admin',
    password: 'deneme123',
    user: {
      label: 'Admin',
      role: 'admin',
      user_id: 'aaaaaaaa-0000-0000-0000-000000000001',
      tenant_id: null,
      customer_id: null,
    },
  },
  {
    username: 'ege',
    password: 'deneme123',
    user: {
      label: 'Ege Olive Oil Cooperative',
      role: 'company',
      user_id: 'bbbbbbbb-0000-0000-0000-000000000001',
      tenant_id: '11111111-0000-0000-0000-000000000001',
      customer_id: null,
    },
  },
  {
    username: 'aura',
    password: 'deneme123',
    user: {
      label: 'Aura Candle Studio',
      role: 'company',
      user_id: 'bbbbbbbb-0000-0000-0000-000000000002',
      tenant_id: '22222222-0000-0000-0000-000000000002',
      customer_id: null,
    },
  },
  {
    username: 'ayse',
    password: 'deneme123',
    user: {
      label: 'Ayşe',
      role: 'customer',
      user_id: 'cccccccc-0000-0000-0000-000000000001',
      tenant_id: '11111111-0000-0000-0000-000000000001',
      customer_id: 'dddddddd-0000-0000-0000-000000000001',
    },
  },
  {
    username: 'elif',
    password: 'deneme123',
    user: {
      label: 'Elif',
      role: 'customer',
      user_id: 'cccccccc-0000-0000-0000-000000000003',
      tenant_id: '22222222-0000-0000-0000-000000000002',
      customer_id: 'dddddddd-0000-0000-0000-000000000003',
    },
  },
]

export function authenticate(username: string, password: string): DemoUser | null {
  const u = username.trim().toLowerCase()
  const match = CREDENTIALS.find(c => c.username === u && c.password === password)
  return match ? match.user : null
}

export function dashboardPathFor(user: DemoUser): string {
  if (user.role === 'admin') return '/admin'
  if (user.role === 'company') return '/company'
  return '/customer'
}
