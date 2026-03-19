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

export async function listProducts(params?: ProductListParams): Promise<PaginatedData<Product>> {
  const response = await client.get<PaginatedData<Product>>('/Products', { params });
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await client.get<Product>(`/Products/${id}`);
  return response.data;
}

export async function createProduct(body: CreateProductRequest): Promise<Product> {
  const response = await client.post<Product>('/Products', body);
  return response.data;
}

export async function updateProduct(id: number, body: UpdateProductRequest): Promise<Product> {
  const response = await client.put<Product>(`/Products/${id}`, body);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/Products/${id}`);
}

export async function patchProductPrice(id: number, body: UpdatePriceRequest): Promise<Product> {
  const response = await client.patch<Product>(`/Products/${id}/price`, body);
  return response.data;
}

export async function patchProductActive(id: number, active: boolean): Promise<void> {
  await client.patch(`/Products/${id}/active`, { active });
}

export async function getProductPriceHistory(id: number, params?: PaginationParams): Promise<PaginatedData<PriceHistory>> {
  const response = await client.get<PaginatedData<PriceHistory>>(`/Products/${id}/price-history`, { params });
  return response.data;
}

export async function getProductStock(id: number): Promise<ProductStock> {
  const response = await client.get<ProductStock>(`/Products/${id}/stock`);
  return response.data;
}
