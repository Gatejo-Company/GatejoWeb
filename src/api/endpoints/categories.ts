import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Category } from '@/types/models';

export interface CategoryRequest {
  name: string;
  description?: string;
}

export async function listCategories(params?: PaginationParams): Promise<PaginatedData<Category>> {
  const response = await client.get<PaginatedData<Category>>('/Categories', { params });
  return response.data;
}

export async function getCategory(id: number): Promise<Category> {
  const response = await client.get<Category>(`/Categories/${id}`);
  return response.data;
}

export async function createCategory(body: CategoryRequest): Promise<Category> {
  const response = await client.post<Category>('/Categories', body);
  return response.data;
}

export async function updateCategory(id: number, body: CategoryRequest): Promise<Category> {
  const response = await client.put<Category>(`/Categories/${id}`, body);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/Categories/${id}`);
}
