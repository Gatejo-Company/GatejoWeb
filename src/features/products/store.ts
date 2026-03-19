import { create } from 'zustand';
import {
  productsApi,
  type ProductListParams,
  type CreateProductRequest,
  type UpdateProductRequest,
  type UpdatePriceRequest,
} from '@/api/endpoints/products';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { Product, PriceHistory } from '@/types/models';

interface ProductStore {
  data: PaginatedData<Product> | null;
  selectItems: Product[];
  detail: Product | null;
  priceHistory: PaginatedData<PriceHistory> | null;
  isLoading: boolean;
  isLoadingSelect: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPatching: boolean;
  _params: ProductListParams;

  fetch: (params?: ProductListParams) => Promise<void>;
  fetchSelectItems: () => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  fetchPriceHistory: (id: number, params?: PaginationParams) => Promise<void>;
  create: (body: CreateProductRequest) => Promise<void>;
  update: (id: number, body: UpdateProductRequest) => Promise<void>;
  delete: (id: number) => Promise<void>;
  patchPrice: (id: number, body: UpdatePriceRequest) => Promise<void>;
  patchActive: (id: number, active: boolean) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  data: null,
  selectItems: [],
  detail: null,
  priceHistory: null,
  isLoading: false,
  isLoadingSelect: false,
  isLoadingDetail: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isPatching: false,
  _params: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await productsApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchSelectItems() {
    set({ isLoadingSelect: true });
    try {
      const result = await productsApi.list({ pageSize: 200, active: true });
      set({ selectItems: result.items, isLoadingSelect: false });
    } catch (error) {
      set({ isLoadingSelect: false });
      throw error;
    }
  },

  async fetchDetail(id) {
    set({ isLoadingDetail: true });
    try {
      const detail = await productsApi.get(id);
      set({ detail, isLoadingDetail: false });
    } catch (error) {
      set({ isLoadingDetail: false });
      throw error;
    }
  },

  async fetchPriceHistory(id, params) {
    try {
      const priceHistory = await productsApi.getPriceHistory(id, params);
      set({ priceHistory });
    } catch (error) {
      throw error;
    }
  },

  async create(body) {
    set({ isCreating: true });
    try {
      await productsApi.create(body);
      set({ isCreating: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },

  async update(id, body) {
    set({ isUpdating: true });
    try {
      await productsApi.update(id, body);
      set({ isUpdating: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isUpdating: false });
      throw error;
    }
  },

  async delete(id) {
    set({ isDeleting: true });
    try {
      await productsApi.delete(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },

  async patchPrice(id, body) {
    set({ isPatching: true });
    try {
      await productsApi.patchPrice(id, body);
      set({ isPatching: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isPatching: false });
      throw error;
    }
  },

  async patchActive(id, active) {
    set({ isPatching: true });
    try {
      await productsApi.patchActive(id, active);
      set({ isPatching: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isPatching: false });
      throw error;
    }
  },
}));
