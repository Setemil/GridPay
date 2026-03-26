import { apiFetch } from './api';
import type { ApiResponse, Listing } from '../types';

export const getActiveListings = (location?: string) =>
  apiFetch<ApiResponse<Listing[]>>(
    `/api/Listing/getActiveListing${location ? `?location=${encodeURIComponent(location)}` : ''}`
  );

export const getAllListings = (isActive?: boolean, location?: string) => {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (location) params.set('location', location);
  const qs = params.toString();
  return apiFetch<ApiResponse<Listing[]>>(`/api/Listing/getAllListings${qs ? `?${qs}` : ''}`);
};

export const getAvailableLocations = () =>
  apiFetch<ApiResponse<string[]>>('/api/Listing/getAvailableLocations');

export const getListingById = (id: number) =>
  apiFetch<ApiResponse<Listing>>(`/api/Listing/getListingById/${id}`);

export const getListingBySellerId = (sellerId: number) =>
  apiFetch<ApiResponse<Listing[]>>(`/api/Listing/getListingBySellerId/${sellerId}`);

export const createListing = (sellerId: number, meterId: number, pricePerKwh: number, location: string) =>
  apiFetch<ApiResponse<Listing>>(`/api/Listing/createListing/${sellerId}`, {
    method: 'POST',
    body: JSON.stringify({ meterId, pricePerKwh, location }),
  });

export const updateListing = (
  id: number,
  sellerId: number,
  data: { pricePerKwh?: number; location?: string; isActive?: boolean }
) =>
  apiFetch<ApiResponse<Listing>>(`/api/Listing/updateListing/${id}/${sellerId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateListingActiveStatus = (id: number, sellerId: number, isActive: boolean) =>
  apiFetch<ApiResponse<Listing>>(
    `/api/Listing/updateListingActiveStatus/${id}/${sellerId}/${isActive}`,
    { method: 'POST' }
  );

export const deleteListing = (id: number, sellerId: number) =>
  apiFetch<ApiResponse<Listing>>(`/api/Listing/deleteListing/${id}/${sellerId}`, {
    method: 'POST',
  });
