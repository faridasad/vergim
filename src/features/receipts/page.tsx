import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { fetchReceipts, fetchReceiptProducts } from './api'
import { ReceiptsTable } from './table'
import { ProductsPanel } from './products-panel'
import { API_BASE_URL } from '@/lib/constants'
import type { Receipt } from './types'

export function ReceiptsPage() {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const queryClient = useQueryClient()

  // SignalR Connection
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/WebhookHub`)
      .withAutomaticReconnect()
      .build()

    connection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err))

    connection.on("posterEvent", () => {
      console.log("New receipt notification received")
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
    })

    return () => {
      connection.stop().then(() => console.log('SignalR Disconnected'))
    }
  }, [queryClient])

  // 1. Query Receipts
  const {
    data: receipts = [],
    isLoading: isLoadingReceipts,
    error: receiptsError
  } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
    select: (data) => data.sort((a, b) =>
      new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
    )
  })

  // 2. Query Products
  const {
    data: products = [],
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['receiptProducts', selectedReceipt?.id],
    queryFn: () => fetchReceiptProducts(selectedReceipt!.id),
    enabled: !!selectedReceipt && isPanelOpen,
  })

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Clear selection after animation
    setTimeout(() => setSelectedReceipt(null), 300)
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Mobile Header */}
        <div className="px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Qəbzlər</h1>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            Yenilə
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {receiptsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Xəta baş verdi: {receiptsError instanceof Error ? receiptsError.message : 'Məlumat yüklənmədi'}
            </div>
          )}

          <ReceiptsTable
            receipts={receipts}
            isLoading={isLoadingReceipts}
            onView={handleViewReceipt}
          />
        </div>

        {/* Drawer */}
        <ProductsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          selectedReceipt={selectedReceipt}
          products={products}
          isLoading={isLoadingProducts}
        />
      </div>
    </div>
  )
}