export interface Listing {
  id: number;
  sellerId: number;
  meterId: number;
  location: string | null;
  pricePerKwh: number;
  totalGeneratedKwh: number;
  consumedKwh: number;
  availableKwh: number;
  isActive: boolean;
  isDeleted: boolean;
  lastUpdated: string;
}

export interface Meter {
  id: number;
  sellerId: number;
  deviceId: string;
  totalGeneratedKwh: number;
  consumedKwh: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  buyerId: number;
  sellerId: number;
  requestedKwh: number;
  deliveredKwh: number;
  pricePerKwhSnapshot: number;
  totalAmount: number;
  platformFee: number;
  paymentReference: string | null;
  status: TransactionStatus;
  createdAt: string;
}

export type TransactionStatus =
  | 'PendingPayment'
  | 'Paid'
  | 'EnergyLocked'
  | 'Delivering'
  | 'Completed'
  | 'Failed'
  | 'Refunded';

export interface EnergyLog {
  id: string;
  transactionId: string;
  deliveredKwh: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaymentInitRequest {
  amount: number;
  customer_email: string;
}

export interface PaymentInitResponse {
  merchant_code: string;
  pay_item_id: string;
  txn_ref: string;
  amount: number;
  currency: string;
  cust_email: string;
  webpay_url: string;
}

export interface PaymentVerifyResponse {
  transaction_reference: string;
  amount: number | null;
  currency: string;
  status: string;
  response_description: string;
  payment_date: string | null;
}
