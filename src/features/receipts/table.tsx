import { Eye } from 'lucide-react'
import type { Receipt } from './types'
import { formatMoney } from './utils'

interface ReceiptsTableProps {
  receipts: Receipt[]
  isLoading: boolean
  onView: (receipt: Receipt) => void
}

export function ReceiptsTable({ receipts, isLoading, onView }: ReceiptsTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Yüklənir...
      </div>
    )
  }

  if (!receipts.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Qəbz tapılmadı.
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Tranzaksiya</th>
              {/* <th className="px-4 py-3">Ödəniş növü</th> */}
              <th className="px-4 py-3 text-right">Məbləğ (₼)</th>
              <th className="px-4 py-3 text-center">Bax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-gray-600 text-xs">
                  {receipt.transaction_id || '-'}
                </td>
                {/* <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {receipt.pay_type || 'Naməlum'}
                  </span>
                </td> */}
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatMoney(receipt.payed_sum)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onView(receipt)}
                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}