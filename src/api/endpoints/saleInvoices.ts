import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { SaleInvoice } from '@/types/models';

export interface SaleInvoiceListParams extends PaginationParams {
  from?: string;
  to?: string;
  onCredit?: boolean;
  paid?: boolean;
}

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleInvoiceRequest {
  date: string;
  onCredit?: boolean;
  notes?: string;
  items: SaleItemRequest[];
}

export const saleInvoicesApi = {
  list: async (params?: SaleInvoiceListParams): Promise<PaginatedData<SaleInvoice>> => {
    const response = await client.get<PaginatedData<SaleInvoice>>('/sale-invoices', { params });
    return response.data;
  },

  getPendingCredit: async (params?: PaginationParams): Promise<PaginatedData<SaleInvoice>> => {
    const response = await client.get<PaginatedData<SaleInvoice>>('/sale-invoices/pending-credit', { params });
    return response.data;
  },

  get: async (id: number): Promise<SaleInvoice> => {
    const response = await client.get<SaleInvoice>(`/sale-invoices/${id}`);
    return response.data;
  },

  create: async (body: CreateSaleInvoiceRequest): Promise<SaleInvoice> => {
    const response = await client.post<SaleInvoice>('/sale-invoices', body);
    return response.data;
  },

  pay: async (id: number): Promise<void> => {
    await client.patch(`/sale-invoices/${id}/pay`);
  },

  reverse: async (id: number): Promise<SaleInvoice> => {
    const response = await client.post<SaleInvoice>(`/sale-invoices/${id}/reverse`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/sale-invoices/${id}`);
  },
};
