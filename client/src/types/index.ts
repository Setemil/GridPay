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
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  redirect_url: string;
}

export interface PaymentInitResponse {
  transaction_reference: string;
  redirect_url: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyResponse {
  transaction_reference: string;
  amount: number;
  currency: string;
  status: string;
  response_description: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_date: string | null;
}
