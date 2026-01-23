import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/shared/button'
import { Input } from '@/components/shared/input'
import { Loader2, Monitor, Save, Trash2, Plus, Server, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/shared/switch'
import { Label } from '@/components/ui/label'
import { OmnisoftConfig, loginToPos } from '@/integrations/omnisoft/api'
import { usePOS } from '@/contexts/POSContext'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_main/local-devices')({
    component: LocalDevicesComponent,
})

type Device = {
    id: string
    name: string
    ip: string
    type: 'printer' | 'terminal' | 'other'
    port: number
    token?: string // We store the session token here
}

function LocalDevicesComponent() {
    // Persistence
    const [savedDevices, setSavedDevices] = useState<Device[]>([])

    // Manual Add State
    const [manualIp, setManualIp] = useState('10.11.46.180') // Default to your test IP
    const [manualPort, setManualPort] = useState('8989')     // Default to Omnisoft port
    const [manualName, setManualName] = useState('Test POS')
    const [isAddingManual, setIsAddingManual] = useState(false)

    // Connection State
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const { activeDevice, isOnline, setActiveDevice } = usePOS()
    const [autoSendToPos, setAutoSendToPos] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem('invoys_saved_devices')
        if (saved) {
            try {
                setSavedDevices(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse saved devices", e)
            }
        }

        const autoSend = localStorage.getItem('invoys_auto_send_to_pos')
        if (autoSend !== null) {
            setAutoSendToPos(autoSend === 'true')
        }
    }, [])

    const handleAutoSendToggle = (checked: boolean) => {
        setAutoSendToPos(checked)
        localStorage.setItem('invoys_auto_send_to_pos', String(checked))
        toast.info(checked ? "Avto-göndərmə aktiv edildi" : "Avto-göndərmə söndürüldü")
    }

    const updateDeviceList = (newDevices: Device[]) => {
        setSavedDevices(newDevices)
        localStorage.setItem('invoys_saved_devices', JSON.stringify(newDevices))
    }

    const saveDevice = (device: Device) => {
        if (savedDevices.some(d => d.id === device.id)) return
        updateDeviceList([...savedDevices, device])
        toast.success(`${device.name} cihazı saxlanıldı`)
    }

    const removeDevice = (id: string) => {
        const newSaved = savedDevices.filter(d => d.id !== id)
        updateDeviceList(newSaved)

        if (activeDevice?.id === id) {
            setActiveDevice(null)
        }
        toast.info("Cihaz silindi")
    }

    const handleManualAdd = () => {
        if (!manualIp) return
        const portVal = manualPort ? parseInt(manualPort) : 8989
        const id = `${manualIp}:${portVal}`

        const newDevice: Device = {
            id,
            name: manualName || `Device ${manualIp}`,
            ip: manualIp,
            port: portVal,
            type: 'terminal'
        }

        saveDevice(newDevice)
        setIsAddingManual(false)
        setManualIp('')
        setManualPort('')
        setManualName('')
    }

    // --- INTEGRATION LOGIC STARTS HERE ---
    const handleConnect = async (device: Device) => {
        setConnectingId(device.id)

        try {
            // 1. Prepare Configuration
            const config: OmnisoftConfig = {
                ip: device.ip,
                port: device.port,
                // These are defaults from your prompt, could be inputs later
                username: "SuperApi",
                password: "123"
            }

            // 2. Attempt Login via our Helper
            // This replaces the generic fetch. We expect an Access Token back.
            const token = await loginToPos(config)

            console.log("Omnisoft Token Acquired:", token)

            // 3. Update Device with Token
            const updatedDevices = savedDevices.map(d =>
                d.id === device.id ? { ...d, token: token } : d
            )
            updateDeviceList(updatedDevices)

            // 4. Set Active Globably
            const finalizedDevice = { ...device, token: token }
            setActiveDevice(finalizedDevice)

            toast.success(`${device.name} terminalına qoşuldu`, {
                description: "Sessiya tokeni uğurla alındı."
            })

        } catch (error: any) {
            console.error("Connection Failed", error)

            let errorMsg = "Cihaza qoşulmaq mümkün olmadı"

            // Handle CORS specifically in error message
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                errorMsg = "Şəbəkə/CORS xətası. VPN və ya Proksi yoxlayın."
            } else if (error.message) {
                errorMsg = error.message
            }

            toast.error(`Bağlantı xətası: ${device.name}`, {
                description: errorMsg
            })
        } finally {
            setConnectingId(null)
        }
    }

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">POS Terminalları</h1>
                <p className="text-gray-500">Omnisoft terminallarına bağlantıları idarə edin.</p>

                {/* Helper info for testing */}
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md border border-blue-200">
                    <p className="font-bold">Test Tələbləri:</p>
                    <ul className="list-disc pl-4 mt-1">
                        <li>FortiClient VPN-i <span className="font-mono">publicip1.omnitech.info.az</span> ünvanına qoşun</li>
                        <li>Hədəf IP: <span className="font-mono">10.11.46.180</span> Port: <span className="font-mono">8989</span></li>
                        <li>Qeyd: Əgər "Failed to fetch" xətası alırsınızsa, bu çox güman ki, CORS problemidir.</li>
                    </ul>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="auto-send" className="text-base font-semibold cursor-pointer">POS terminala avto göndər</Label>
                        <p className="text-sm text-gray-500">
                            Gələn məlumatların avtomatik terminala göndərilməsi.
                        </p>
                    </div>
                    <Switch
                        id="auto-send"
                        checked={autoSendToPos}
                        onCheckedChange={handleAutoSendToggle}
                    />
                </div>
            </div>

            {/* Saved Devices Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Save className="w-5 h-5" /> Saxlanılan Cihazlar
                    </h2>
                    <Button
                        variant={isAddingManual ? "secondary" : "default"}
                        onClick={() => setIsAddingManual(!isAddingManual)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {isAddingManual ? 'Ləğv et' : 'Cihaz Əlavə et'}
                    </Button>
                </div>

                {/* Add Manual Form */}
                {isAddingManual && (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="w-5 h-5 text-gray-500" />
                            <h3 className="font-medium">Yeni Terminal Əlavə et</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Ad</label>
                                <Input placeholder="Test POS" value={manualName} onChange={e => setManualName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">IP Ünvanı</label>
                                <Input placeholder="10.11.46.180" value={manualIp} onChange={e => setManualIp(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Port</label>
                                <Input placeholder="8989" value={manualPort} onChange={e => setManualPort(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleManualAdd} disabled={!manualIp}>
                                Cihazı Saxla
                            </Button>
                        </div>
                    </div>
                )}

                {/* List */}
                {savedDevices.length === 0 && !isAddingManual ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Monitor className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">Saxlanılan terminal yoxdur</h3>
                        <Button variant="outline" className="mt-4" onClick={() => setIsAddingManual(true)}>
                            Terminal Əlavə et
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {savedDevices.map((device) => {
                            const isConnected = activeDevice?.id === device.id
                            return (
                                <div key={device.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-all ${isConnected ? cn('border-primary ring-1 ring-primary/20', !isOnline && 'border-red-500 ring-red-500/20') : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConnected ? (isOnline ? 'bg-primary text-white' : 'bg-red-500 text-white') : 'bg-primary/10 text-primary'}`}>
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                {device.name}
                                                {isConnected && (
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                                        isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {isOnline ? 'Onlayn' : 'Oflayn'}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono flex gap-2">
                                                {device.ip}:{device.port}
                                                {device.token ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Token saxlanıldı
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Token yoxdur
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={isConnected && isOnline ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleConnect(device)}
                                            disabled={connectingId === device.id}
                                            className={isConnected && isOnline ? "border-green-200 text-green-700 hover:bg-green-50" : ""}
                                        >
                                            {connectingId === device.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                isConnected ? 'Yenidən qoşul' : 'Qoşul'
                                            )}
                                        </Button>

                                        <Button variant="ghost" size="icon" onClick={() => removeDevice(device.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}