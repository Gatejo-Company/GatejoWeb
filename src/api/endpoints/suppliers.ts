import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Supplier } from '@/types/models';

export interface SupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export async function listSuppliers(params?: PaginationParams): Promise<PaginatedData<Supplier>> {
  const response = await client.get<PaginatedData<Supplier>>('/Suppliers', { params });
  return response.data;
}

export async function getSupplier(id: number): Promise<Supplier> {
  const response = await client.get<Supplier>(`/Suppliers/${id}`);
  return response.data;
}

export async function createSupplier(body: SupplierRequest): Promise<Supplier> {
  const response = await client.post<Supplier>('/Suppliers', body);
  return response.data;
}

export async function updateSupplier(id: number, body: SupplierRequest): Promise<Supplier> {
  const response = await client.put<Supplier>(`/Suppliers/${id}`, body);
  return response.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await client.delete(`/Suppliers/${id}`);
}
