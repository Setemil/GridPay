import { apiFetch } from './api';
import type { PaymentInitRequest, PaymentInitResponse, PaymentVerifyResponse } from '../types';

export const initiatePayment = (data: PaymentInitRequest) =>
  apiFetch<PaymentInitResponse>('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyPayment = (transactionRef: string) =>
  apiFetch<PaymentVerifyResponse>(`/api/payments/verify/${transactionRef}`);
