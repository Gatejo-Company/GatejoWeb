import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { PurchaseInvoice } from '@/types/models';

export interface PurchaseInvoiceListParams extends PaginationParams {
  supplierId?: number;
  from?: string;
  to?: string;
}

export interface InvoiceItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseInvoiceRequest {
  supplierId: number;
  date: string;
  notes?: string;
  items: InvoiceItemRequest[];
}

export const purchaseInvoicesApi = {
  list: async (params?: PurchaseInvoiceListParams): Promise<PaginatedData<PurchaseInvoice>> => {
    const response = await client.get<PaginatedData<PurchaseInvoice>>('/api/purchase-invoices', { params });
    return response.data;
  },

  get: async (id: number): Promise<PurchaseInvoice> => {
    const response = await client.get<PurchaseInvoice>(`/api/purchase-invoices/${id}`);
    return response.data;
  },

  create: async (body: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoice> => {
    const response = await client.post<PurchaseInvoice>('/api/purchase-invoices', body);
    return response.data;
  },

  patchPayment: async (id: number, paid: number): Promise<void> => {
    await client.patch(`/api/purchase-invoices/${id}/payment`, { paid });
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/purchase-invoices/${id}`);
  },
};
