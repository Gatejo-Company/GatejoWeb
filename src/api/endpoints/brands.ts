import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Brand } from '@/types/models';

export interface BrandRequest {
  name: string;
}

export const brandsApi = {
  list: async (params?: PaginationParams): Promise<PaginatedData<Brand>> => {
    const response = await client.get<PaginatedData<Brand>>('/api/Brands', { params });
    return response.data;
  },

  get: async (id: number): Promise<Brand> => {
    const response = await client.get<Brand>(`/api/Brands/${id}`);
    return response.data;
  },

  create: async (body: BrandRequest): Promise<Brand> => {
    const response = await client.post<Brand>('/api/Brands', body);
    return response.data;
  },

  update: async (id: number, body: BrandRequest): Promise<Brand> => {
    const response = await client.put<Brand>(`/api/Brands/${id}`, body);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/Brands/${id}`);
  },
};
