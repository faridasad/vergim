import { useState } from 'react'
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { fetchReceipts, fetchReceiptProducts, refreshSale } from './api'
import { toast } from 'sonner'
import { ReceiptsTable } from './table'
import { ProductsPanel } from './products-panel'
import type { Receipt } from './types'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReceiptsPage() {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const search: any = useSearch({ strict: false })
  const navigate = useNavigate()

  const statusFilter = (search.status as 'all' | 'true' | 'false') || 'all'

  const setStatusFilter = (val: 'all' | 'true' | 'false') => {
    navigate({
      search: (prev: Record<string, any>) => ({
        ...prev,
        status: val === 'all' ? undefined : val
      })
    } as any)
  }

  // SignalR is now handled globally in _main.tsx
  // to ensure data is received even when not on this page.

  // 1. Query Receipts
  const {
    data,
    isFetching,
    error: receiptsError
  } = useQuery({
    queryKey: ['receipts', page, pageSize, statusFilter],
    queryFn: () => fetchReceipts(
      page,
      pageSize,
      statusFilter === 'all' ? undefined : statusFilter === 'true'
    ),
    placeholderData: keepPreviousData
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

  const receipts = data?.receipts ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Clear selection after animation
    setTimeout(() => setSelectedReceipt(null), 300)
  }

  // Refresh Sale Mutation
  const refreshMutation = useMutation({
    mutationFn: (receiptId: string) => refreshSale(receiptId),
    onSuccess: () => {
      toast.success("Satış yenilənməsi sorğusu göndərildi.")
    },
    onError: (error) => {
      toast.error(`Xəta baş verdi: ${error.message}`)
    }
  })

  const handleRefreshSale = (receipt: Receipt) => {
    console.log(receipt);

    if (confirm("Bu satışı yeniləmək istədiyinizə əminsiniz?")) {
      refreshMutation.mutate(receipt.transaction_id)
    }
  }

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Mobile Header */}
        <div className="px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <h1 className="text-xl font-bold text-gray-900">Qəbzlər</h1>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            Yenilə
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="w-48">
            <Select
              value={statusFilter}
              onValueChange={(val: 'all' | 'true' | 'false') => {
                setStatusFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamısı</SelectItem>
                <SelectItem value="true">Tamamlandı</SelectItem>
                <SelectItem value="false">Tamamlanmadı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isFetching && (
            <div className="flex items-center text-sm text-gray-500 animate-pulse">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yüklənir...
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {receiptsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Xəta baş verdi: {receiptsError instanceof Error ? receiptsError.message : 'Məlumat yüklənmədi'}
            </div>
          )}

          <ReceiptsTable
            receipts={receipts}
            isLoading={isFetching} // Use isFetching to show loading state during refetch/filter changes
            onView={handleViewReceipt}
            onRefresh={handleRefreshSale}
          />

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Geri
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İrəli
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{totalCount}</span> nəticədən{' '}
                    <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalCount)}</span>
                    {' - '}
                    <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> arası göstərilir
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      Səhifə {page} / {totalPages || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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