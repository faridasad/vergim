// src/lib/auth.ts
const API_BASE_URL = 'https://innalok.faridasadli.com/api'
const AUTH_KEY = 'invoys_auth'

export type AuthData = {
  account_number: string
  access_token: string
  ownerInfo: {
    name: string
    company_name: string
  }
}

export function getAuthData(): AuthData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthData
  } catch {
    return null
  }
}

export function storeAuthData(data: AuthData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export function clearAuthData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEY)
}

export async function verifyPosterAuth(code: string, account: string): Promise<AuthData> {
  const url = new URL(`${API_BASE_URL}/api/Auth/callback`)
  url.searchParams.set('code', code)
  url.searchParams.set('account', account)

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Failed to verify account')
  }

  return (await res.json()) as AuthData
}
