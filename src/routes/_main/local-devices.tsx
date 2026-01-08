import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/shared/button'
import { Input } from '@/components/shared/input'
import { Loader2, Monitor, Wifi, Save, Trash2, Scan } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_main/local-devices')({
    component: LocalDevicesComponent,
})

type Device = {
    id: string
    name: string
    ip: string
    type: 'printer' | 'terminal' | 'other'
    port?: number
}

function LocalDevicesComponent() {
    // Settings
    const [subnet, setSubnet] = useState('192.168.1')
    const [port, setPort] = useState('80')
    const [scanLocalhost, setScanLocalhost] = useState(false)

    // Scanning State
    const [isScanning, setIsScanning] = useState(false)
    const [foundDevices, setFoundDevices] = useState<Device[]>([])
    const [hasScanned, setHasScanned] = useState(false)

    // Persistence
    const [savedDevices, setSavedDevices] = useState<Device[]>([])

    // Manual Add State
    const [manualIp, setManualIp] = useState('')
    const [manualPort, setManualPort] = useState('')
    const [manualName, setManualName] = useState('')
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

    const saveDevice = (device: Device) => {
        // Check if already saved
        if (savedDevices.some(d => d.id === device.id)) return

        const newSaved = [...savedDevices, device]
        setSavedDevices(newSaved)
        localStorage.setItem('invoys_saved_devices', JSON.stringify(newSaved))
        toast.success(`Device ${device.name} saved`)
    }

    const removeDevice = (id: string) => {
        const newSaved = savedDevices.filter(d => d.id !== id)
        setSavedDevices(newSaved)
        localStorage.setItem('invoys_saved_devices', JSON.stringify(newSaved))
        toast.info("Device removed")
    }

    const handleManualAdd = () => {
        if (!manualIp) return
        const id = `${manualIp}:${manualPort || '80'}`
        const newDevice: Device = {
            id,
            name: manualName || `Device ${manualIp}`,
            ip: manualIp,
            port: manualPort ? parseInt(manualPort) : undefined,
            type: 'other'
        }
        saveDevice(newDevice)
        setIsAddingManual(false)
        setManualIp('')
        setManualPort('')
        setManualName('')
    }

    const handleConnect = async (device: Device) => {
        setConnectingId(device.id)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const promise = fetch(`http://${device.ip}:${device.port || 80}/`, {
            mode: 'no-cors',
            signal: controller.signal,
            // @ts-ignore
            targetAddressSpace: 'local'
        }).then(() => {
            // Successful reachability (even if opaque/401)
            setActiveDeviceId(device.id)
            localStorage.setItem('invoys_active_device_id', device.id)
            // Save if not already saved
            if (!savedDevices.some(d => d.id === device.id)) {
                saveDevice(device)
            }
            return device.name
        })

        toast.promise(promise, {
            loading: `Connecting to ${device.name}...`,
            success: (name) => `${name} is active and connected`,
            error: (err) => {
                console.error(err)
                return `Could not reach ${device.name}`
            }
        })

        try {
            await promise
        } catch (e) {
            // Error handled by toast
        } finally {
            clearTimeout(timeoutId)
            setConnectingId(null)
        }
    }


    const handleScan = async () => {
        setIsScanning(true)
        setFoundDevices([])
        setHasScanned(false)

        const targetPort = parseInt(port) || 80
        const currentSubnet = subnet.trim()

        const checkIp = async (ip: string) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 1500) // 1.5s timeout

            try {
                await fetch(`http://${ip}:${targetPort}`, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal,
                    // @ts-ignore
                    targetAddressSpace: 'local'
                })
                // Reachable
                const newDevice: Device = {
                    id: `${ip}:${targetPort}`,
                    name: `Device ${ip}`,
                    ip: ip,
                    port: targetPort,
                    type: 'other'
                }
                setFoundDevices(prev => {
                    if (prev.some(d => d.id === newDevice.id)) return prev
                    return [...prev, newDevice]
                })
            } catch (err) {
                // Ignore
            } finally {
                clearTimeout(timeoutId)
            }
        }

        const ipsToCheck: string[] = []

        // Add Localhost if requested or relevant
        if (scanLocalhost || currentSubnet === '127.0.0') {
            ipsToCheck.push('127.0.0.1')
            ipsToCheck.push('localhost')
        }

        // Subnet generation
        if (currentSubnet && currentSubnet !== '127.0.0') {
            for (let i = 1; i < 255; i++) {
                ipsToCheck.push(`${currentSubnet}.${i}`)
            }
        }

        // Batch processing
        const batchSize = 10
        for (let i = 0; i < ipsToCheck.length; i += batchSize) {
            const batch = ipsToCheck.slice(i, i + batchSize).map(ip => checkIp(ip))
            await Promise.all(batch)
        }

        setIsScanning(false)
        setHasScanned(true)
    }

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">Local Devices</h1>
                <p className="text-gray-500">Manage and discover devices on your network.</p>
            </div>

            {/* Saved Devices Section */}
            {savedDevices.length > 0 && (
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Save className="w-5 h-5" /> Saved Devices
                    </h2>
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
                                                {isConnected && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Connected</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">{device.ip}{device.port ? `:${device.port}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isConnected ? (
                                            <Button variant="outline" size="sm" className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800" disabled>
                                                Active
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleConnect(device)}
                                                disabled={connectingId === device.id}
                                            >
                                                {connectingId === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                                            </Button>
                                        )}

                                        <Button variant="ghost" size="icon" onClick={() => removeDevice(device.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Manually Toggle */}
            <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setIsAddingManual(!isAddingManual)} className="text-sm">
                    {isAddingManual ? 'Cancel Manual Add' : '+ Add Manually'}
                </Button>
            </div>

            {isAddingManual && (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-medium">Add Device Manually</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Name (Optional)</label>
                            <Input placeholder="Receipt Printer" value={manualName} onChange={e => setManualName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">IP Address</label>
                            <Input placeholder="192.168.1.100" value={manualIp} onChange={e => setManualIp(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Port</label>
                            <Input placeholder="80" value={manualPort} onChange={e => setManualPort(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleManualAdd} disabled={!manualIp}>Save Device</Button>
                </div>
            )}


            {/* Scan Controls */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Scan className="w-5 h-5" /> Network Scan
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-500">Subnet</label>
                        <Input
                            value={subnet}
                            onChange={(e) => setSubnet(e.target.value)}
                            placeholder="192.168.1"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-500">Port(s)</label>
                        <Input
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            placeholder="80, 443, 8080..."
                        />
                    </div>
                    <Button onClick={handleScan} disabled={isScanning} className="w-full gap-2">
                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                        {isScanning ? 'Scanning...' : 'Start Scan'}
                    </Button>
                </div>

                {/* Scan Results */}
                {isScanning && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                        <p className="text-sm text-gray-500">Scanning {subnet}.x for active devices...</p>
                    </div>
                )}

                {!isScanning && hasScanned && foundDevices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No active devices found in this range.
                    </div>
                )}

                {foundDevices.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-600">Found Devices ({foundDevices.length})</h3>
                        {foundDevices.map((device) => {
                            const isConnected = activeDeviceId === device.id
                            return (
                                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <Wifi className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{device.ip}</p>
                                            <p className="text-xs text-gray-500">Port: {device.port}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleConnect(device)}
                                            disabled={connectingId === device.id || isConnected}
                                            className={isConnected ? "border-green-500 text-green-600 bg-green-50" : ""}
                                        >
                                            {connectingId === device.id ? <Loader2 className="w-3 h-3 animate-spin" /> : isConnected ? 'Connected' : 'Connect'}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => saveDevice(device)} disabled={savedDevices.some(d => d.id === device.id)}>
                                            {savedDevices.some(d => d.id === device.id) ? 'Saved' : 'Save'}
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
