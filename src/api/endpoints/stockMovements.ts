import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { StockMovement, MovementType } from '@/types/models';

export interface StockMovementListParams extends PaginationParams {
  productId?: number;
  typeId?: number;
  from?: string;
  to?: string;
}

export interface CreateStockMovementRequest {
  productId: number;
  typeId: number;
  quantity: number;
  notes?: string;
}

export async function listStockMovements(params?: StockMovementListParams): Promise<PaginatedData<StockMovement>> {
  const response = await client.get<PaginatedData<StockMovement>>('/stock-movements', { params });
  return response.data;
}

export async function getStockMovement(id: number): Promise<StockMovement> {
  const response = await client.get<StockMovement>(`/stock-movements/${id}`);
  return response.data;
}

export async function createStockMovement(body: CreateStockMovementRequest): Promise<StockMovement> {
  const response = await client.post<StockMovement>('/stock-movements', body);
  return response.data;
}

export async function listMovementTypes(params?: PaginationParams): Promise<PaginatedData<MovementType>> {
  const response = await client.get<PaginatedData<MovementType>>('/movement-types', { params });
  return response.data;
}
