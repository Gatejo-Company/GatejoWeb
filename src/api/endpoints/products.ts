import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { Product, PriceHistory, ProductStock } from '@/types/models';

export interface ProductListParams extends PaginationParams {
  categoryId?: number;
  brandId?: number;
  active?: boolean;
  lowStock?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  brandId: number;
  price: number;
  minStock?: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  brandId: number;
  minStock?: number;
}

export interface UpdatePriceRequest {
  price: number;
  reason?: string;
}

export const productsApi = {
  list: async (params?: ProductListParams): Promise<PaginatedData<Product>> => {
    const response = await client.get<PaginatedData<Product>>('/api/Products', { params });
    return response.data;
  },

  get: async (id: number): Promise<Product> => {
    const response = await client.get<Product>(`/api/Products/${id}`);
    return response.data;
  },

  create: async (body: CreateProductRequest): Promise<Product> => {
    const response = await client.post<Product>('/api/Products', body);
    return response.data;
  },

  update: async (id: number, body: UpdateProductRequest): Promise<Product> => {
    const response = await client.put<Product>(`/api/Products/${id}`, body);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/Products/${id}`);
  },

  patchPrice: async (id: number, body: UpdatePriceRequest): Promise<Product> => {
    const response = await client.patch<Product>(`/api/Products/${id}/price`, body);
    return response.data;
  },

  patchActive: async (id: number, active: boolean): Promise<void> => {
    await client.patch(`/api/Products/${id}/active`, { active });
  },

  getPriceHistory: async (id: number, params?: PaginationParams): Promise<PaginatedData<PriceHistory>> => {
    const response = await client.get<PaginatedData<PriceHistory>>(`/api/Products/${id}/price-history`, { params });
    return response.data;
  },

  getStock: async (id: number): Promise<ProductStock> => {
    const response = await client.get<ProductStock>(`/api/Products/${id}/stock`);
    return response.data;
  },
};
