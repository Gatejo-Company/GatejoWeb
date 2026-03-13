import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Supplier } from '@/types/models';

export interface SupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export const suppliersApi = {
  list: async (params?: PaginationParams): Promise<PaginatedData<Supplier>> => {
    const response = await client.get<PaginatedData<Supplier>>('/api/Suppliers', { params });
    return response.data;
  },

  get: async (id: number): Promise<Supplier> => {
    const response = await client.get<Supplier>(`/api/Suppliers/${id}`);
    return response.data;
  },

  create: async (body: SupplierRequest): Promise<Supplier> => {
    const response = await client.post<Supplier>('/api/Suppliers', body);
    return response.data;
  },

  update: async (id: number, body: SupplierRequest): Promise<Supplier> => {
    const response = await client.put<Supplier>(`/api/Suppliers/${id}`, body);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/Suppliers/${id}`);
  },
};
