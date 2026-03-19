import { create } from 'zustand';
import { brandsApi, type BrandRequest } from '@/api/endpoints/brands';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { Brand } from '@/types/models';

interface BrandStore {
  data: PaginatedData<Brand> | null;
  selectItems: Brand[];
  isLoading: boolean;
  isLoadingSelect: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  _params: PaginationParams;

  fetch: (params?: PaginationParams) => Promise<void>;
  fetchSelectItems: () => Promise<void>;
  create: (body: BrandRequest) => Promise<void>;
  update: (id: number, body: BrandRequest) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set, get) => ({
  data: null,
  selectItems: [],
  isLoading: false,
  isLoadingSelect: false,
  isSaving: false,
  isDeleting: false,
  _params: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await brandsApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchSelectItems() {
    set({ isLoadingSelect: true });
    try {
      const result = await brandsApi.list({ pageSize: 100 });
      set({ selectItems: result.items, isLoadingSelect: false });
    } catch (error) {
      set({ isLoadingSelect: false });
      throw error;
    }
  },

  async create(body) {
    set({ isSaving: true });
    try {
      await brandsApi.create(body);
      set({ isSaving: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  async update(id, body) {
    set({ isSaving: true });
    try {
      await brandsApi.update(id, body);
      set({ isSaving: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  async delete(id) {
    set({ isDeleting: true });
    try {
      await brandsApi.delete(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },
}));
