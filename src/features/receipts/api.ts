import { getAuthData } from '@/lib/auth'
import type { ReceiptProduct, ReceiptsResponse } from './types'
import { API_BASE_URL } from '@/lib/constants'

export async function fetchReceipts(page = 1, pageSize = 10, innalokTaxStatus?: boolean): Promise<ReceiptsResponse> {
  const auth = getAuthData()
  if (!auth) throw new Error('Authentication missing')

  const url = new URL(`${API_BASE_URL}/api/UI/GetAllReceipts`)
  url.searchParams.set('token', auth.access_token)
  url.searchParams.set('accountNumber', auth.account_number)
  url.searchParams.set('page', page.toString())
  url.searchParams.set('pageSize', pageSize.toString())

  if (innalokTaxStatus !== undefined) {
    url.searchParams.set('Status', String(innalokTaxStatus))
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json, text/plain, */*' },
  })

  if (!res.ok) throw new Error('Failed to fetch receipts')

  const text = await res.text()
  if (!text) return { receipts: [], page, pageSize, totalCount: 0 }

  try {
    const data = JSON.parse(text)
    // Handle paginated response structure
    if (data.receipts && Array.isArray(data.receipts)) {
      return {
        receipts: data.receipts,
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || data.receipts.length
      }
    }
    // Fallback for older array response (should not happen based on new requirements but good for safety)
    const list = Array.isArray(data) ? data : []
    return {
      receipts: list,
      page,
      pageSize,
      totalCount: list.length
    }
  } catch (e) {
    console.error('Error parsing receipts:', e)
    return { receipts: [], page, pageSize, totalCount: 0 }
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

export async function refreshSale(receiptId: string): Promise<boolean> {
  const auth = getAuthData()
  if (!auth) throw new Error('Authentication missing')

  const url = new URL(`${API_BASE_URL}/api/Tax/RefreshSale`)
  url.searchParams.set('Token', auth.access_token)
  url.searchParams.set('ReceiptId', String(receiptId))

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { Accept: 'application/json, text/plain, */*' },
  })

  // Returns 200 OK on success, so we just check ok status
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`)
  }

  return true
}