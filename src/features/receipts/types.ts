// src/features/receipts/types.ts
export type ReceiptsResponse = {
  receipts: Receipt[]
  page: number
  pageSize: number
  totalCount: number
}

export type Receipt = {
  id: number
  createDate: string
  transaction_id: string
  date_start: string
  date_start_new: string
  date_close: string
  status: string
  guests_count: string
  discount: string
  bonus: string
  pay_type: string
  payed_bonus: string
  payed_card: string
  payed_cash: string
  payed_sum: string
  payed_cert: string
  payed_third_party: string
  payed_card_type: string
  payed_ewallet: string
  round_sum: string
  tip_sum: string
  tips_card: string
  tips_cash: string
  sum: string
  tax_sum: string
  payment_method_id: string
  spot_id: string
  table_id: string
  name: string
  fiscalId: string
  innalokTaxStatus?: boolean
}

// src/features/receipts/productTypes.ts

export type ReceiptProduct = {
  id: number
  createDate: string

  product_id: string
  product_name: string

  modification_id: string
  modificator_name: string
  modificator_barcode: string
  modificator_product_code: string

  weight_flag: string
  num: string
  time: string
  workshop: string

  barcode: string
  product_code: string

  tax_id: string
  nodiscount: string

  payed_sum: string
  product_sum: string
  discount: string
  bonus_sum: string

  round_sum: number

  client_id: string
  promotion_id: string

  cert_sum: string

  product_cost: string
  product_cost_netto: string
  product_profit: string
  product_profit_netto: string

  bonus_accrual: string

  tax_value: string
  tax_type: string
  tax_fiscal: string

  category_id: string

  receiptDataId: number

  receiptData?: unknown
}

