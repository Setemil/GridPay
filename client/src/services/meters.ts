import { apiFetch } from './api';
import type { ApiResponse, Meter } from '../types';

export const getMetersBySellerId = (sellerId: number) =>
  apiFetch<ApiResponse<Meter[]>>(`/api/Meter/getAllMetersBySellerId/${sellerId}`);

export const createMeter = (sellerId: number, deviceId: string) =>
  apiFetch<ApiResponse<Meter>>(`/api/Meter/createMeter/${sellerId}`, {
    method: 'POST',
    body: JSON.stringify({ deviceId }),
  });
