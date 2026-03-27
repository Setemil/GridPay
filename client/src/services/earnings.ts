import { apiFetch } from './api';

export interface EarningsBalance {
  total_earned: number;
  paid_out: number;
  available: number;
}

export interface EarningRecord {
  sellerId: number;
  transactionId: string;
  listingId: number;
  energyCostNGN: number;
  paid: boolean;
  createdAt: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  updatedAt?: string;
}

export const recordEarning = (data: {
  seller_id: number;
  transaction_id: string;
  listing_id: number;
  energy_cost_ngn: number;
}) =>
  apiFetch('/api/earnings/record', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getEarningsBalance = () =>
  apiFetch<EarningsBalance>('/api/earnings/balance');

export const getEarningsHistory = () =>
  apiFetch<EarningRecord[]>('/api/earnings/history');

export const getBankDetails = () =>
  apiFetch<BankDetails>('/api/earnings/bank-details');

export const saveBankDetails = (data: Omit<BankDetails, 'updatedAt'>) =>
  apiFetch('/api/earnings/bank-details', {
    method: 'PUT',
    body: JSON.stringify({
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_name: data.accountName,
    }),
  });

export const requestPayout = (amount: number) =>
  apiFetch('/api/earnings/payout-request', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
