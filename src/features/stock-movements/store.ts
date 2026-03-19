import { create } from 'zustand';
import {
  stockMovementsApi,
  movementTypesApi,
  type StockMovementListParams,
  type CreateStockMovementRequest,
} from '@/api/endpoints/stockMovements';
import type { PaginatedData } from '@/api/types';
import type { StockMovement, MovementType } from '@/types/models';

interface StockMovementStore {
  data: PaginatedData<StockMovement> | null;
  movementTypes: MovementType[];
  isLoading: boolean;
  isLoadingTypes: boolean;
  isCreating: boolean;
  _params: StockMovementListParams;

  fetch: (params?: StockMovementListParams) => Promise<void>;
  fetchMovementTypes: () => Promise<void>;
  create: (body: CreateStockMovementRequest) => Promise<void>;
}

export const useStockMovementStore = create<StockMovementStore>((set, get) => ({
  data: null,
  movementTypes: [],
  isLoading: false,
  isLoadingTypes: false,
  isCreating: false,
  _params: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await stockMovementsApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchMovementTypes() {
    set({ isLoadingTypes: true });
    try {
      const result = await movementTypesApi.list({ pageSize: 50 });
      set({ movementTypes: result.items, isLoadingTypes: false });
    } catch (error) {
      set({ isLoadingTypes: false });
      throw error;
    }
  },

  async create(body) {
    set({ isCreating: true });
    try {
      await stockMovementsApi.create(body);
      set({ isCreating: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },
}));
