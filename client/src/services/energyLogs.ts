import { apiFetch } from './api';
import type { ApiResponse, EnergyLog } from '../types';

export const getEnergyLogsByTransactionId = (transactionId: string) =>
  apiFetch<ApiResponse<EnergyLog[]>>(
    `/api/EnergyLog/GetEnergyLogsByTransactionId/${transactionId}`
  );
