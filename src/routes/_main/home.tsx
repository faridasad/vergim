import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/shared/button'
import { Settings, Radio, Activity, Monitor } from 'lucide-react'
import type { AuthData } from '@/lib/auth'
import { useSignalR } from '@/contexts/SignalRContext'
import { fetchReceipts } from '@/features/receipts/api'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/features/receipts/utils'

export const Route = createFileRoute('/_main/home')({
  component: HomeComponent,
})

function HomeComponent() {
  const { data: auth } = useQuery<AuthData>({
    queryKey: ['auth'],
  })

  const { status: signalRStatus } = useSignalR()

  const { data: recentReceipts } = useQuery({
    queryKey: ['receipts', 'recent'],
    queryFn: () => fetchReceipts(1, 5)
  })

  // Read device status from LocalStorage
  const activeDeviceId = localStorage.getItem('invoys_active_device_id')
  const savedDevicesStr = localStorage.getItem('invoys_saved_devices')

  let activeDeviceName = null
  if (activeDeviceId && savedDevicesStr) {
    try {
      const savedDevices = JSON.parse(savedDevicesStr)
      const device = savedDevices.find((d: any) => d.id === activeDeviceId)
      activeDeviceName = device ? device.name : activeDeviceId
    } catch (e) {
      activeDeviceName = activeDeviceId
    }
  }

  if (!auth) return null

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center",
              signalRStatus === 'connected' ? "bg-green-100 text-green-600" :
                signalRStatus === 'connecting' ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
            )}>
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Sistem Statusu</h3>
              <p className="text-sm text-gray-500">
                {signalRStatus === 'connected' ? 'Canlı əlaqə quruldu' :
                  signalRStatus === 'connecting' ? 'Qoşulur...' :
                    'Əlaqə yoxdur'}
              </p>
            </div>
          </div>
          <div className={cn("h-3 w-3 rounded-full animate-pulse",
            signalRStatus === 'connected' ? "bg-green-500" :
              signalRStatus === 'connecting' ? "bg-yellow-500" :
                "bg-red-500"
          )} />
        </div>

        {/* Device Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Aktiv Cihaz</h3>
              <p className="text-sm text-gray-500">
                {activeDeviceName ? activeDeviceName : 'Cihaz qoşulmayıb'}
              </p>
            </div>
          </div>
          {!activeDeviceName && (
            <Link to="/local-devices">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Qoşul
              </Button>
            </Link>
          )}
          {activeDeviceName && (
            <div className="flex items-center text-sm text-green-600 font-medium gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Aktivdir
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Son Əməliyyatlar</h3>
          </div>
          <Link to="/receipts" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Hamısına Bax
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentReceipts?.receipts?.slice(0, 5).map((receipt) => (
            <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-gray-500">#{receipt.transaction_id}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                    receipt.innalokTaxStatus === false ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  )}>
                    {receipt.innalokTaxStatus === false ? "Uğursuz" : "Tamamlandı"}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-gray-900">{formatMoney(receipt.payed_sum)} ₼</span>
            </div>
          ))}
          {(!recentReceipts?.receipts || recentReceipts.receipts.length === 0) && (
            <div className="p-8 text-center text-gray-500 text-sm">
              Son əməliyyat tapılmadı.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
