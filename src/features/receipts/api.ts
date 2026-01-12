import { getAuthData } from '@/lib/auth'
import type { Receipt, ReceiptProduct } from './types'

const API_BASE_URL = 'https://innalok.faridasadli.com/api'

export async function fetchReceipts(): Promise<Receipt[]> {
  const auth = getAuthData()
  if (!auth) throw new Error('Authentication missing')

  const url = new URL(`${API_BASE_URL}/api/UI/GetAllReceipts`)
  url.searchParams.set('token', auth.access_token)
  url.searchParams.set('accountNumber', auth.account_number)
  url.searchParams.set('page', '1')
  url.searchParams.set('pageSize', '10')

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json, text/plain, */*' },
  })

  if (!res.ok) throw new Error('Failed to fetch receipts')

  const text = await res.text()
  if (!text) return []

  try {
    const data = JSON.parse(text)
    // Handle paginated response structure
    if (data.receipts && Array.isArray(data.receipts)) {
      return data.receipts
    }
    // Fallback for array response
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error parsing receipts:', e)
    return []
  }
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