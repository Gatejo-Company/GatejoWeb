import { create } from 'zustand';
import {
  saleInvoicesApi,
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
      const data = await saleInvoicesApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchPendingCredit(params = {}) {
    set({ _pendingCreditParams: params });
    try {
      const pendingCredit = await saleInvoicesApi.getPendingCredit(params);
      set({ pendingCredit });
    } catch (error) {
      throw error;
    }
  },

  async create(body) {
    set({ isCreating: true });
    try {
      await saleInvoicesApi.create(body);
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
      await saleInvoicesApi.pay(id);
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
      await saleInvoicesApi.delete(id);
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
      await saleInvoicesApi.reverse(id);
      set({ isReversing: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isReversing: false });
      throw error;
    }
  },
}));
