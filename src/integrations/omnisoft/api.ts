// src/lib/omnisoft-api.ts

// The base URL structure for Omnisoft
const API_VERSION = 'v2';

export interface OmnisoftConfig {
    ip: string;
    port: number;
    username?: string;
    password?: string;
}

export interface OmnisoftResponse {
    code?: number;
    access_token?: string; // Returned on Login
    message?: string;
    data?: any;
}

// Helper to construct the URL
const getUrl = (config: OmnisoftConfig) => `http://${config.ip}:${config.port}/${API_VERSION}`;

/**
 * 1. LOGIN (Check Type 40)
 * According to Section 6.1.2
 */
export const loginToPos = async (config: OmnisoftConfig): Promise<string> => {
    const payload = {
        requestData: {
            checkData: {
                check_type: 40
            },
            name: config.username || "SuperApi",
            password: config.password || "123"
        }
    };

    try {
        const response = await fetch(getUrl(config), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data: OmnisoftResponse = await response.json();

        // Check specifically for access_token as per PDF page 22
        if (data.access_token) {
            return data.access_token;
        } else {
            throw new Error(data.message || "Login failed: No token received");
        }
    } catch (error) {
        console.error("Omnisoft Login Error:", error);
        throw error;
    }
};

/**
 * 2. GET INFO (Check Type 41)
 * Useful for validating connection and token. Section 6.1.1
 */
export const getPosInfo = async (config: OmnisoftConfig, token: string) => {
    const payload = {
        requestData: {
            checkData: {
                check_type: 41
            },
            access_token: token
        }
    };

    const response = await fetch(getUrl(config), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    return await response.json();
};

/**
 * 3. SEND TO POS (Generic Forwarder)
 * Reads active device from localStorage, injects token, and sends to POS.
 */
export const sendToPos = async (requestData: any) => {
    try {
        // 1. Get Active Device config from LocalStorage
        const activeId = localStorage.getItem('invoys_active_device_id');
        const savedDevicesStr = localStorage.getItem('invoys_saved_devices');
        
        if (!activeId || !savedDevicesStr) {
            console.warn("No active POS device configured.");
            return; 
        }

        const devices: any[] = JSON.parse(savedDevicesStr);
        const activeDevice = devices.find(d => d.id === activeId);

        if (!activeDevice) {
            console.warn("Active device not found in saved devices.");
            return;
        }

        if (!activeDevice.token) {
            console.warn("Active device has no session token. Please login via Local Devices page.");
            // Optional: Could trigger a toast here if we were in a component
            return;
        }

        // 2. Prepare Config
        const config: OmnisoftConfig = {
            ip: activeDevice.ip,
            port: activeDevice.port
        };

        // 3. Inject Token
        // The payload from SignalR (requestData) has access_token: null
        // We override it with the active local token.
        const payload = { ...requestData };
        if (payload.requestData) {
            payload.requestData.access_token = activeDevice.token;
        }

        console.log("Forwarding to Omnisoft POS:", payload);

        // 4. Send
        const response = await fetch(getUrl(config), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`POS HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("POS Response:", data);
        return data;

    } catch (error) {
        console.error("Failed to forward to Omnisoft POS:", error);
        // We generally don't want to crash the main app flow if POS is offline, 
        // so we just log it. 
    }
};