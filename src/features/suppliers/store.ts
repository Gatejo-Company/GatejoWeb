import { create } from 'zustand';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier, type SupplierRequest } from '@/api/endpoints/suppliers';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { Supplier } from '@/types/models';

interface SupplierStore {
  data: PaginatedData<Supplier> | null;
  selectItems: Supplier[];
  isLoading: boolean;
  isLoadingSelect: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  _params: PaginationParams;

  fetch: (params?: PaginationParams) => Promise<void>;
  fetchSelectItems: () => Promise<void>;
  create: (body: SupplierRequest) => Promise<void>;
  update: (id: number, body: SupplierRequest) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
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
      const data = await listSuppliers(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchSelectItems() {
    set({ isLoadingSelect: true });
    try {
      const result = await listSuppliers({ pageSize: 200 });
      set({ selectItems: result.items, isLoadingSelect: false });
    } catch (error) {
      set({ isLoadingSelect: false });
      throw error;
    }
  },

  async create(body) {
    set({ isSaving: true });
    try {
      await createSupplier(body);
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
      await updateSupplier(id, body);
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
      await deleteSupplier(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },
}));
