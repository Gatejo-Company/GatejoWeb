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

export class SaleInvoicesApi {
  static async list(params?: SaleInvoiceListParams): Promise<PaginatedData<SaleInvoice>> {
    const response = await client.get<PaginatedData<SaleInvoice>>('/sale-invoices', { params });
    return response.data;
  }

  static async getPendingCredit(params?: PaginationParams): Promise<PaginatedData<SaleInvoice>> {
    const response = await client.get<PaginatedData<SaleInvoice>>('/sale-invoices/pending-credit', { params });
    return response.data;
  }

  static async get(id: number): Promise<SaleInvoice> {
    const response = await client.get<SaleInvoice>(`/sale-invoices/${id}`);
    return response.data;
  }

  static async create(body: CreateSaleInvoiceRequest): Promise<SaleInvoice> {
    const response = await client.post<SaleInvoice>('/sale-invoices', body);
    return response.data;
  }

  static async pay(id: number): Promise<void> {
    await client.patch(`/sale-invoices/${id}/pay`);
  }

  static async reverse(id: number): Promise<SaleInvoice> {
    const response = await client.post<SaleInvoice>(`/sale-invoices/${id}/reverse`);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await client.delete(`/sale-invoices/${id}`);
  }
}
