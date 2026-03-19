import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Brand } from '@/types/models';

export interface BrandRequest {
  name: string;
}

export async function listBrands(params?: PaginationParams): Promise<PaginatedData<Brand>> {
  const response = await client.get<PaginatedData<Brand>>('/Brands', { params });
  return response.data;
}

export async function getBrand(id: number): Promise<Brand> {
  const response = await client.get<Brand>(`/Brands/${id}`);
  return response.data;
}

export async function createBrand(body: BrandRequest): Promise<Brand> {
  const response = await client.post<Brand>('/Brands', body);
  return response.data;
}

export async function updateBrand(id: number, body: BrandRequest): Promise<Brand> {
  const response = await client.put<Brand>(`/Brands/${id}`, body);
  return response.data;
}

export async function deleteBrand(id: number): Promise<void> {
  await client.delete(`/Brands/${id}`);
}
