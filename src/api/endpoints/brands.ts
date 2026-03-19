import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Brand } from '@/types/models';

export interface BrandRequest {
  name: string;
}

export class BrandsApi {
  static async list(params?: PaginationParams): Promise<PaginatedData<Brand>> {
    const response = await client.get<PaginatedData<Brand>>('/Brands', { params });
    return response.data;
  }

  static async get(id: number): Promise<Brand> {
    const response = await client.get<Brand>(`/Brands/${id}`);
    return response.data;
  }

  static async create(body: BrandRequest): Promise<Brand> {
    const response = await client.post<Brand>('/Brands', body);
    return response.data;
  }

  static async update(id: number, body: BrandRequest): Promise<Brand> {
    const response = await client.put<Brand>(`/Brands/${id}`, body);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await client.delete(`/Brands/${id}`);
  }
}
