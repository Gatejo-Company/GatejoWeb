import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Category } from '@/types/models';

export interface CategoryRequest {
  name: string;
  description?: string;
}

export const categoriesApi = {
  list: async (params?: PaginationParams): Promise<PaginatedData<Category>> => {
    const response = await client.get<PaginatedData<Category>>('/Categories', { params });
    return response.data;
  },

  get: async (id: number): Promise<Category> => {
    const response = await client.get<Category>(`/Categories/${id}`);
    return response.data;
  },

  create: async (body: CategoryRequest): Promise<Category> => {
    const response = await client.post<Category>('/Categories', body);
    return response.data;
  },

  update: async (id: number, body: CategoryRequest): Promise<Category> => {
    const response = await client.put<Category>(`/Categories/${id}`, body);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/Categories/${id}`);
  },
};
