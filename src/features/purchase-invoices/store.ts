import { create } from 'zustand';
import {
  listPurchaseInvoices,
  createPurchaseInvoice,
  patchPurchaseInvoicePayment,
  deletePurchaseInvoice,
  type PurchaseInvoiceListParams,
  type CreatePurchaseInvoiceRequest,
} from '@/api/endpoints/purchaseInvoices';
import type { PaginatedData } from '@/api/types';
import type { PurchaseInvoice } from '@/types/models';

interface PurchaseInvoiceStore {
  data: PaginatedData<PurchaseInvoice> | null;
  isLoading: boolean;
  isCreating: boolean;
  isPatchingPayment: boolean;
  isDeleting: boolean;
  _params: PurchaseInvoiceListParams;

  fetch: (params?: PurchaseInvoiceListParams) => Promise<void>;
  create: (body: CreatePurchaseInvoiceRequest) => Promise<void>;
  patchPayment: (id: number, paid: number) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export const usePurchaseInvoiceStore = create<PurchaseInvoiceStore>((set, get) => ({
  data: null,
  isLoading: false,
  isCreating: false,
  isPatchingPayment: false,
  isDeleting: false,
  _params: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await listPurchaseInvoices(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async create(body) {
    set({ isCreating: true });
    try {
      await createPurchaseInvoice(body);
      set({ isCreating: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },

  async patchPayment(id, paid) {
    set({ isPatchingPayment: true });
    try {
      await patchPurchaseInvoicePayment(id, paid);
      set({ isPatchingPayment: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isPatchingPayment: false });
      throw error;
    }
  },

  async delete(id) {
    set({ isDeleting: true });
    try {
      await deletePurchaseInvoice(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },
}));
