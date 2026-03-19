import { create } from 'zustand';
import {
  listSaleInvoices,
  getPendingCreditInvoices,
  createSaleInvoice,
  paySaleInvoice,
  deleteSaleInvoice,
  reverseSaleInvoice,
  type SaleInvoiceListParams,
  type CreateSaleInvoiceRequest,
} from '@/api/endpoints/saleInvoices';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { SaleInvoice } from '@/types/models';

interface SaleInvoiceStore {
  data: PaginatedData<SaleInvoice> | null;
  pendingCredit: PaginatedData<SaleInvoice> | null;
  isLoading: boolean;
  isCreating: boolean;
  isPaying: boolean;
  isDeleting: boolean;
  isReversing: boolean;
  _params: SaleInvoiceListParams;
  _pendingCreditParams: PaginationParams;

  fetch: (params?: SaleInvoiceListParams) => Promise<void>;
  fetchPendingCredit: (params?: PaginationParams) => Promise<void>;
  create: (body: CreateSaleInvoiceRequest) => Promise<void>;
  pay: (id: number) => Promise<void>;
  delete: (id: number) => Promise<void>;
  reverse: (id: number) => Promise<void>;
}

export const useSaleInvoiceStore = create<SaleInvoiceStore>((set, get) => ({
  data: null,
  pendingCredit: null,
  isLoading: false,
  isCreating: false,
  isPaying: false,
  isDeleting: false,
  isReversing: false,
  _params: {},
  _pendingCreditParams: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await listSaleInvoices(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchPendingCredit(params = {}) {
    set({ _pendingCreditParams: params });
    try {
      const pendingCredit = await getPendingCreditInvoices(params);
      set({ pendingCredit });
    } catch (error) {
      throw error;
    }
  },

  async create(body) {
    set({ isCreating: true });
    try {
      await createSaleInvoice(body);
      set({ isCreating: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },

  async pay(id) {
    set({ isPaying: true });
    try {
      await paySaleInvoice(id);
      set({ isPaying: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isPaying: false });
      throw error;
    }
  },

  async delete(id) {
    set({ isDeleting: true });
    try {
      await deleteSaleInvoice(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },

  async reverse(id) {
    set({ isReversing: true });
    try {
      await reverseSaleInvoice(id);
      set({ isReversing: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isReversing: false });
      throw error;
    }
  },
}));
