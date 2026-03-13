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

export const stockMovementsApi = {
  list: async (params?: StockMovementListParams): Promise<PaginatedData<StockMovement>> => {
    const response = await client.get<PaginatedData<StockMovement>>('/api/stock-movements', { params });
    return response.data;
  },

  get: async (id: number): Promise<StockMovement> => {
    const response = await client.get<StockMovement>(`/api/stock-movements/${id}`);
    return response.data;
  },

  create: async (body: CreateStockMovementRequest): Promise<StockMovement> => {
    const response = await client.post<StockMovement>('/api/stock-movements', body);
    return response.data;
  },
};

export const movementTypesApi = {
  list: async (params?: PaginationParams): Promise<PaginatedData<MovementType>> => {
    const response = await client.get<PaginatedData<MovementType>>('/api/movement-types', { params });
    return response.data;
  },
};
