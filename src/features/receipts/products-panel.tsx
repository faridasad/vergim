import { useState } from 'react'
import { X, Loader2, FileText, ShoppingCart } from 'lucide-react'
import type { Receipt, ReceiptProduct } from './types'
import { formatMoney, formatQuantity, formatTax } from './utils'

interface ProductsPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedReceipt: Receipt | null
  products: ReceiptProduct[]
  isLoading: boolean
}

type Tab = 'info' | 'products'

export function ProductsPanel({
  isOpen,
  onClose,
  selectedReceipt,
  products,
  isLoading,
}: ProductsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')

  if (!isOpen && activeTab !== 'info') {
    setTimeout(() => setActiveTab('info'), 300)
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
          
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            {selectedReceipt ? `Tranzaksiya: ${selectedReceipt.transaction_id}` : 'Məlumat'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'info' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} /> Qəbz
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'products' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart size={16} /> Məhsullar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          
          {/* TAB 1: Receipt Details */}
          {activeTab === 'info' && selectedReceipt && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                <DetailRow label="Ad / Kassir" value={selectedReceipt.name} />
                <DetailRow label="Masa / Yer" value={selectedReceipt.spot_id ? `ID: ${selectedReceipt.spot_id}` : '-'} />
                <DetailRow label="Qonaq sayı" value={selectedReceipt.guests_count} />
                <DetailRow label="Status" value={selectedReceipt.status} isStatus />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                <DetailRow label="Ödənilən məbləğ" value={`${formatMoney(selectedReceipt.payed_sum)} ₼`} isBold />
                <DetailRow label="Bəxşiş (Tip)" value={`${formatMoney(selectedReceipt.tip_sum)} ₼`} />
              </div>
            </div>
          )}

          {/* TAB 2: Products List */}
          {activeTab === 'products' && (
            <>
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} /> 
                  <span>Yüklənir...</span>
                </div>
              ) : !products.length ? (
                <div className="text-center text-gray-500 mt-10">Məhsul tapılmadı.</div>
              ) : (
                <div className="space-y-3">
                  {products.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      
                      {/* Name */}
                      <div className="font-semibold text-gray-900 mb-2">{item.product_name}</div>
                      
                      {/* Grid Stats */}
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-600">
                        <div>
                          <span className="text-xs text-gray-400 block mb-0.5">Say</span>
                          <span className="font-medium text-gray-900">{formatQuantity(item.num)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block mb-0.5">Məhsul Cəmi</span>
                          {formatMoney(item.product_sum)} ₼
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-400 block mb-0.5">Vergi ({item.tax_type || '-'})</span>
                          {formatTax(item.tax_value)}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block mb-0.5">Ödənilən</span>
                          <span className="font-bold text-indigo-600">{formatMoney(item.payed_sum)} ₼</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function DetailRow({ label, value, isBold, isStatus }: { label: string, value: string | number, isBold?: boolean, isStatus?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      {isStatus ? (
        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-xs uppercase">
          {value || 'Yoxdur'}
        </span>
      ) : (
        <span className={`text-gray-900 ${isBold ? 'font-bold text-base' : 'font-medium'}`}>
          {value || '-'}
        </span>
      )}
    </div>
  )
}