import { apiFetch } from './api';
import type { ApiResponse, Transaction } from '../types';

export const createTransaction = (
  sellerId: number,
  buyerId: number,
  listingId: number,
  requestedKwh: number
) =>
  apiFetch<ApiResponse<Transaction>>(
    `/api/Transaction/createTransaction/${sellerId}/${buyerId}/${listingId}`,
    {
      method: 'POST',
      body: JSON.stringify({ requestedKwh }),
    }
  );

export const confirmPayment = (
  listingId: number,
  transactionId: string,
  paymentReference: string
) =>
  apiFetch<ApiResponse<Transaction>>(
    `/api/Transaction/confirmPayment/${listingId}/${transactionId}/${paymentReference}`,
    { method: 'POST' }
  );

export const getTransactionByUserId = (userId: number) =>
  apiFetch<ApiResponse<Transaction[]>>(`/api/Transaction/getTransactionByUserId/${userId}`);

export const getTransactionById = (id: string) =>
  apiFetch<ApiResponse<Transaction>>(`/api/Transaction/getTransactionById/${id}`);

export const getTransactionByPaymentReference = (ref: string) =>
  apiFetch<ApiResponse<Transaction>>(`/api/Transaction/getTransactionByPaymentReference/${ref}`);
