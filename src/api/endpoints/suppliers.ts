import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Supplier } from '@/types/models';

export interface SupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export class SuppliersApi {
  static async list(params?: PaginationParams): Promise<PaginatedData<Supplier>> {
    const response = await client.get<PaginatedData<Supplier>>('/Suppliers', { params });
    return response.data;
  }

  static async get(id: number): Promise<Supplier> {
    const response = await client.get<Supplier>(`/Suppliers/${id}`);
    return response.data;
  }

  static async create(body: SupplierRequest): Promise<Supplier> {
    const response = await client.post<Supplier>('/Suppliers', body);
    return response.data;
  }

  static async update(id: number, body: SupplierRequest): Promise<Supplier> {
    const response = await client.put<Supplier>(`/Suppliers/${id}`, body);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await client.delete(`/Suppliers/${id}`);
  }
}
