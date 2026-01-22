// src/lib/omnisoft-api.ts
import { API_BASE_URL } from '../../lib/constants';

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
 * @param requestData The Omnisoft payload
 * @param posterToken The token from the Poster/Backend (used for callbacks)
 */
export const sendToPos = async (requestData: any, posterToken?: string) => {
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

        // Sanitization Logic for Quantity
        try {
            const params = payload.requestData?.tokenData?.parameters;
            if (params?.doc_type === 'sale' && params?.data?.items) {
                const items = params.data.items;
                if (Array.isArray(items)) {
                    items.forEach((item: any) => {
                        // If we have a valid sum and price, but quantity looks wrong
                        if (item.itemSum > 0 && item.itemPrice > 0) {
                            const calculatedQty = item.itemSum / item.itemPrice;

                            // If quantity is practically zero (like 4e-7) or significantly mismatched
                            if (item.itemQuantity < 0.0001 || Math.abs(item.itemQuantity - calculatedQty) > 0.01) {
                                console.warn(`[Auto-Fix] Correcting quantity for ${item.itemName}: ${item.itemQuantity} -> ${calculatedQty}`);
                                item.itemQuantity = calculatedQty;
                            }
                        }
                    });
                }
            }
        } catch (e) {
            console.warn("Error sanitizing payload:", e);
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

        // --- Callback Logic for Sale/Rollback ---
        try {
            const docType = payload.requestData?.tokenData?.parameters?.doc_type;

            // Only proceed if operation was successful (code === 0) and we have a token
            if (data.code === 0 && activeDevice.token && (docType === 'sale' || docType === 'rollback')) {

                const receiptId = payload.requestData?.int_ref || data.document_number; // Prioritize int_ref from request
                const fiscalId = data.long_id;         // mapped from long_id

                if (docType === 'sale') {
                    // SaleResponse: Token, ReceiptId, FiscalId
                    if (receiptId && fiscalId) {
                        const queryParams = new URLSearchParams({
                            Token: posterToken || activeDevice.token,
                            ReceiptId: String(receiptId),
                            FiscalId: fiscalId
                        });
                        const url = `${API_BASE_URL}/api/Tax/SaleResponse?${queryParams.toString()}`;
                        console.log(`[Callback] Sending SaleResponse to ${url}`);

                        // Await callback to ensure revalidation happens after success
                        try {
                            const r = await fetch(url, { method: 'POST' });
                            r.ok ? console.log("[Callback] SaleResponse Success") : console.warn(`[Callback] SaleResponse Failed: ${r.status}`);
                        } catch (e) {
                            console.warn("[Callback] SaleResponse Error:", e);
                        }
                    } else {
                        console.warn("[Callback] Missing ReceiptId or FiscalId in Sale response", data);
                    }

                } else if (docType === 'rollback') {
                    // RollBackResponse: Token, ReceiptId
                    if (receiptId) {
                        const queryParams = new URLSearchParams({
                            Token: posterToken || activeDevice.token,
                            ReceiptId: String(receiptId)
                        });
                        const url = `${API_BASE_URL}/api/Tax/RollBackResponse?${queryParams.toString()}`;
                        console.log(`[Callback] Sending RollBackResponse to ${url}`);

                        // Await callback
                        try {
                            const r = await fetch(url, { method: 'POST' });
                            r.ok ? console.log("[Callback] RollBackResponse Success") : console.warn(`[Callback] RollBackResponse Failed: ${r.status}`);
                        } catch (e) {
                            console.warn("[Callback] RollBackResponse Error:", e);
                        }
                    } else {
                        console.warn("[Callback] Missing ReceiptId in Rollback response", data);
                    }
                }
            }
        } catch (callbackError) {
            console.warn("Error processing callback logic:", callbackError);
        }
        // ----------------------------------------

        return data;

    } catch (error) {
        console.error("Failed to forward to Omnisoft POS:", error);
        // We generally don't want to crash the main app flow if POS is offline, 
        // so we just log it. 
    }
};