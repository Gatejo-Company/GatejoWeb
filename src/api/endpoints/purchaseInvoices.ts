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

export class PurchaseInvoicesApi {
  static async list(params?: PurchaseInvoiceListParams): Promise<PaginatedData<PurchaseInvoice>> {
    const response = await client.get<PaginatedData<PurchaseInvoice>>('/purchase-invoices', { params });
    return response.data;
  }

  static async get(id: number): Promise<PurchaseInvoice> {
    const response = await client.get<PurchaseInvoice>(`/purchase-invoices/${id}`);
    return response.data;
  }

  static async create(body: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoice> {
    const response = await client.post<PurchaseInvoice>('/purchase-invoices', body);
    return response.data;
  }

  static async patchPayment(id: number, paid: number): Promise<void> {
    await client.patch(`/purchase-invoices/${id}/payment`, { paid });
  }

  static async delete(id: number): Promise<void> {
    await client.delete(`/purchase-invoices/${id}`);
  }
}
