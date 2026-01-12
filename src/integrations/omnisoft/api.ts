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