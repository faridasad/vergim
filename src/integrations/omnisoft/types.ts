// src/integrations/omnisoft/types.ts

export type OmnisoftCheckType = 
    | 1   // Sale
    | 7   // Deposit
    | 8   // Withdraw
    | 10  // Rollback
    | 11  // Receipt copy
    | 12  // X-Report
    | 13  // Close shift & Z-Report
    | 14  // Shift status
    | 15  // Open shift
    | 16  // Reprint after printing error
    | 17  // Transaction history
    | 18  // Statement for requested period
    | 19  // Correction
    | 28  // Open money box
    | 29  // Close money box
    | 31  // Credit Pay
    | 32  // Credit Pay Rollback
    | 34  // Prepay
    | 40  // Login
    | 41  // Get Info
    | 100 // Money back / Credit Money back

export interface OmnisoftBaseRequest {
    requestData: {
        access_token?: string; // Optional for Login
        checkData: {
            check_type: OmnisoftCheckType;
        };
        // For Login
        name?: string; 
        password?: string;
        
        // For Rollback/Copy
        fiscalId?: string; 

        // For Document Creations (Sale, MoneyBack, etc)
        tokenData?: {
            parameters?: {
                doc_type?: 'sale' | 'rollback' | 'money_back' | 'prepay' | 'creditpay' | 'correction' | 'deposit'; 
                // correction uses doc_type 'correction'
                prev_doc_number?: number; // optional
                data?: any; // Specific data per operation
                // For Sale with Prepay
                parents?: string[]; 
            };
            operationId?: string; // e.g., "createDocument"
            version?: number;
        };
        
        // For history
        date_start?: string;
        date_end?: string;
    }
}

// --- Specific Data Interfaces ---

export interface OmnisoftItem {
    itemName: string;
    itemCodeType: 0 | 1 | 2 | 3 | 5; 
    // 0: plain, 1: EAN8, 2: EAN13, 3: service, 5: credit payment
    itemCode: string; // Max 32 chars
    itemQuantityType: 0 | 1 | 2 | 3 | 4 | 5; 
    // 0: pieces, 1: kg, 2: L, 3: m, 4: m2, 5: m3
    itemQuantity: number;
    itemPrice: number;
    itemSum: number;
    itemVatPercent?: number;
    discount?: number;
    itemMarginPrice?: number;
    itemMarginSum?: number;
}

export interface OmnisoftVatAmount {
    vatSum: number;
    vatPercent: number;
}

export interface OmnisoftSaleData {
    cashier: string;
    currency: string; // "AZN"
    items: OmnisoftItem[];
    sum: number;
    cashSum: number;
    cashlessSum: number;
    prepaymentSum: number;
    creditSum: number;
    bonusSum: number;
    incomingSum?: number; // Cash paid by buyer
    vatAmounts: OmnisoftVatAmount[];
}

export interface OmnisoftRollbackRequest {
    requestData: {
        access_token: string;
        checkData: {
            check_type: 10;
        };
        fiscalId: string; // The long_id of the sale receipt
    }
}

// Rollback can also be done via createDocument for Credit/Prepay rollback (Check 32)
// but standard Sale Rollback is Check 10.

export interface SignalRNotification {
    allData: OmnisoftBaseRequest & { receiptDetails?: any[] };
    transactionType: string; // "Sale", "Rollback", etc.
}

export interface OmnisoftShiftStatusResponse {
    code: number;
    desc?: string;
    message?: string;
    serial?: string;
    shiftStatus?: boolean; // true if open? checking example: "shift is close", shiftStatus: false
    shift_open_time?: string;
}
