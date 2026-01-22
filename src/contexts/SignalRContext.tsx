import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { HubConnectionBuilder, HttpTransportType, HubConnectionState } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { getAuthData } from '@/lib/auth'
import { API_BASE_URL } from '@/lib/constants'
import { sendToPos } from '@/integrations/omnisoft/api'
import { SignalRNotification } from '@/integrations/omnisoft/types'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

interface SignalRContextType {
    status: ConnectionStatus
    lastMessage: SignalRNotification | null
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined)

export function SignalRProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected')
    const [lastMessage, setLastMessage] = useState<SignalRNotification | null>(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        let isActive = true
        const auth = getAuthData()
        const token = auth?.access_token || ''

        if (!token) {
            setStatus('disconnected')
            return
        }

        setStatus('connecting')

        const connection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/api/WebhookHub?token=${encodeURIComponent(token)}`, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build()

        const startConnection = async () => {
            try {
                await connection.start()
                if (isActive) {
                    console.log('SignalR Connected (Global)')
                    setStatus('connected')
                } else {
                    await connection.stop()
                }
            } catch (err) {
                console.error('SignalR Connection Error: ', err)
                if (isActive) setStatus('disconnected')
            }
        }

        startConnection()

        connection.on("posterEvent", async (data: SignalRNotification) => {
            console.log("Global notification received:", data)
            setLastMessage(data)

            // Forward to Local POS
            if (data && data.allData) {
                await sendToPos(data.allData, token)
            }

            // Always invalidate receipts query so data is fresh
            queryClient.invalidateQueries({ queryKey: ['receipts'] })
        })

        connection.onreconnecting(() => {
            console.log('SignalR Reconnecting')
            setStatus('reconnecting')
        })

        connection.onreconnected(() => {
            console.log('SignalR Reconnected')
            setStatus('connected')
        })

        connection.onclose(() => {
            console.log('SignalR Closed')
            setStatus('disconnected')
        })

        return () => {
            isActive = false
            connection.stop().then(() => console.log('SignalR Disconnected'))
        }
    }, [queryClient])

    return (
        <SignalRContext.Provider value={{ status, lastMessage }}>
            {children}
        </SignalRContext.Provider>
    )
}

export function useSignalR() {
    const context = useContext(SignalRContext)
    if (context === undefined) {
        throw new Error('useSignalR must be used within a SignalRProvider')
    }
    return context
}
