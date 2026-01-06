import { getAuthData } from '@/lib/auth'
import type { Receipt, ReceiptProduct } from './types'

const API_BASE_URL = 'http://taxx.runasp.net'

export async function fetchReceipts(): Promise<Receipt[]> {
  const auth = getAuthData()
  if (!auth) throw new Error('Authentication missing')

  const url = new URL(`${API_BASE_URL}/api/UI/GetAllReceipts`)
  url.searchParams.set('token', auth.access_token)
  url.searchParams.set('accountNumber', auth.account_number)

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json, text/plain, */*' },
  })

  if (!res.ok) throw new Error('Failed to fetch receipts')
  
  const text = await res.text()
  return text ? JSON.parse(text) : []
}

export async function fetchReceiptProducts(receiptId: number): Promise<ReceiptProduct[]> {
  const url = new URL(`${API_BASE_URL}/api/UI/GetAllReceiptProducts`)
  url.searchParams.set('ReceiptId', String(receiptId))

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json, text/plain, */*' },
  })

  if (!res.ok) throw new Error('Failed to fetch products')

  const text = await res.text()
  return text ? JSON.parse(text) : []
}