import { create } from 'zustand';
import { CategoriesApi, type CategoryRequest } from '@/api/endpoints/categories';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { Category } from '@/types/models';

interface CategoryStore {
  data: PaginatedData<Category> | null;
  selectItems: Category[];
  isLoading: boolean;
  isLoadingSelect: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  _params: PaginationParams;

  fetch: (params?: PaginationParams) => Promise<void>;
  fetchSelectItems: () => Promise<void>;
  create: (body: CategoryRequest) => Promise<void>;
  update: (id: number, body: CategoryRequest) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
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
      const data = await CategoriesApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchSelectItems() {
    set({ isLoadingSelect: true });
    try {
      const result = await CategoriesApi.list({ pageSize: 100 });
      set({ selectItems: result.items, isLoadingSelect: false });
    } catch (error) {
      set({ isLoadingSelect: false });
      throw error;
    }
  },

  async create(body) {
    set({ isSaving: true });
    try {
      await CategoriesApi.create(body);
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
      await CategoriesApi.update(id, body);
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
      await CategoriesApi.delete(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },
}));
