import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/shared/button'
import { Input } from '@/components/shared/input'
import { Loader2, Monitor, Save, Trash2, Plus, Server, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { OmnisoftConfig, loginToPos } from '@/integrations/omnisoft/api'

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
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('invoys_saved_devices')
        if (saved) {
            try {
                setSavedDevices(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse saved devices", e)
            }
        }
        const active = localStorage.getItem('invoys_active_device_id')
        if (active) setActiveDeviceId(active)
    }, [])

    const updateDeviceList = (newDevices: Device[]) => {
        setSavedDevices(newDevices)
        localStorage.setItem('invoys_saved_devices', JSON.stringify(newDevices))
    }

    const saveDevice = (device: Device) => {
        if (savedDevices.some(d => d.id === device.id)) return
        updateDeviceList([...savedDevices, device])
        toast.success(`Device ${device.name} saved`)
    }

    const removeDevice = (id: string) => {
        const newSaved = savedDevices.filter(d => d.id !== id)
        updateDeviceList(newSaved)

        if (activeDeviceId === id) {
            setActiveDeviceId(null)
            localStorage.removeItem('invoys_active_device_id')
        }
        toast.info("Device removed")
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

            // 4. Set Active
            setActiveDeviceId(device.id)
            localStorage.setItem('invoys_active_device_id', device.id)
            
            toast.success(`Connected to ${device.name}`, {
                description: "Session token acquired successfully."
            })

        } catch (error: any) {
            console.error("Connection Failed", error)
            
            let errorMsg = "Could not reach device"
            
            // Handle CORS specifically in error message
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                errorMsg = "Network/CORS Error. Check VPN or Proxy."
            } else if (error.message) {
                errorMsg = error.message
            }

            toast.error(`Connection Failed: ${device.name}`, {
                description: errorMsg
            })
        } finally {
            setConnectingId(null)
        }
    }

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">POS Terminals</h1>
                <p className="text-gray-500">Manage connections to Omnisoft terminals.</p>
                
                {/* Helper info for testing */}
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md border border-blue-200">
                    <p className="font-bold">Testing Requirements:</p>
                    <ul className="list-disc pl-4 mt-1">
                        <li>Connect FortiClient VPN to <span className="font-mono">publicip1.omnitech.info.az</span></li>
                        <li>Target IP: <span className="font-mono">10.11.46.180</span> Port: <span className="font-mono">8989</span></li>
                        <li>Note: If you get "Failed to fetch", it is likely a CORS issue.</li>
                    </ul>
                </div>
            </div>

            {/* Saved Devices Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Save className="w-5 h-5" /> Saved Devices
                    </h2>
                    <Button
                        variant={isAddingManual ? "secondary" : "default"}
                        onClick={() => setIsAddingManual(!isAddingManual)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {isAddingManual ? 'Cancel' : 'Add Device'}
                    </Button>
                </div>

                {/* Add Manual Form */}
                {isAddingManual && (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="w-5 h-5 text-gray-500" />
                            <h3 className="font-medium">Add New Terminal</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Name</label>
                                <Input placeholder="Test POS" value={manualName} onChange={e => setManualName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">IP Address</label>
                                <Input placeholder="10.11.46.180" value={manualIp} onChange={e => setManualIp(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Port</label>
                                <Input placeholder="8989" value={manualPort} onChange={e => setManualPort(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleManualAdd} disabled={!manualIp}>
                                Save Device
                            </Button>
                        </div>
                    </div>
                )}

                {/* List */}
                {savedDevices.length === 0 && !isAddingManual ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Monitor className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">No terminals saved</h3>
                        <Button variant="outline" className="mt-4" onClick={() => setIsAddingManual(true)}>
                            Add Terminal
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {savedDevices.map((device) => {
                            const isConnected = activeDeviceId === device.id
                            return (
                                <div key={device.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-all ${isConnected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConnected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                {device.name}
                                                {isConnected && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Online</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono flex gap-2">
                                                {device.ip}:{device.port}
                                                {device.token ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Token Saved</span> : <span className="text-orange-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> No Token</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={isConnected ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleConnect(device)}
                                            disabled={connectingId === device.id}
                                            className={isConnected ? "border-green-200 text-green-700 hover:bg-green-50" : ""}
                                        >
                                            {connectingId === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (isConnected ? 'Reconnect' : 'Connect')}
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