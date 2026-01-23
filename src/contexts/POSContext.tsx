import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getPosInfo, OmnisoftConfig } from '@/integrations/omnisoft/api'

export type POSStatus = 'online' | 'offline' | 'checking' | 'unknown'

export type Device = {
    id: string
    name: string
    ip: string
    type: 'printer' | 'terminal' | 'other'
    port: number
    token?: string
}

interface POSContextType {
    activeDevice: Device | null
    isOnline: boolean
    isChecking: boolean
    lastCheck: Date | null
    checkHealth: () => Promise<void>
    setActiveDevice: (device: Device | null) => void
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: React.ReactNode }) {
    const [activeDevice, setActiveDeviceState] = useState<Device | null>(null)
    const [isOnline, setIsOnline] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [lastCheck, setLastCheck] = useState<Date | null>(null)

    const setActiveDevice = useCallback((device: Device | null) => {
        setActiveDeviceState(device)
        if (device) {
            localStorage.setItem('invoys_active_device_id', device.id)
        } else {
            localStorage.removeItem('invoys_active_device_id')
            setIsOnline(false)
        }
    }, [])

    const checkHealth = useCallback(async () => {
        if (!activeDevice || !activeDevice.token) {
            setIsOnline(false)
            return
        }

        setIsChecking(true)
        try {
            const config: OmnisoftConfig = {
                ip: activeDevice.ip,
                port: activeDevice.port
            }
            const data = await getPosInfo(config, activeDevice.token)

            // Omnisoft returns code 0 for success
            if (data && (data.code === 0 || data.access_token)) {
                setIsOnline(true)
            } else {
                setIsOnline(false)
            }
        } catch (error) {
            console.error("[POS Health] Check failed:", error)
            setIsOnline(false)
        } finally {
            setIsChecking(false)
            setLastCheck(new Date())
        }
    }, [activeDevice])

    // Load active device on mount
    useEffect(() => {
        const activeId = localStorage.getItem('invoys_active_device_id')
        const savedDevicesStr = localStorage.getItem('invoys_saved_devices')

        if (activeId && savedDevicesStr) {
            try {
                const devices: Device[] = JSON.parse(savedDevicesStr)
                const active = devices.find(d => d.id === activeId)
                if (active) {
                    setActiveDeviceState(active)
                }
            } catch (e) {
                console.error("Failed to parse saved devices for health check", e)
            }
        }
    }, [])

    // Background health check loop
    useEffect(() => {
        if (!activeDevice) return

        // Initial check
        checkHealth()

        const intervalIdx = setInterval(checkHealth, 30000) // Every 30s
        return () => clearInterval(intervalIdx)
    }, [activeDevice, checkHealth])

    return (
        <POSContext.Provider value={{
            activeDevice,
            isOnline,
            isChecking,
            lastCheck,
            checkHealth,
            setActiveDevice
        }}>
            {children}
        </POSContext.Provider>
    )
}

export function usePOS() {
    const context = useContext(POSContext)
    if (context === undefined) {
        throw new Error('usePOS must be used within a POSProvider')
    }
    return context
}
