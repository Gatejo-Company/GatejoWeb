import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  saleInvoicesApi,
  type SaleInvoiceListParams,
  type CreateSaleInvoiceRequest,
} from '@/api/endpoints/saleInvoices';
import { useToast } from '@/components/ui/Toast';
import type { PaginationParams } from '@/api/types';

export const saleInvoiceKeys = {
  all: ['sale-invoices'] as const,
  list: (params?: SaleInvoiceListParams) => [...saleInvoiceKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...saleInvoiceKeys.all, 'detail', id] as const,
  pendingCredit: (params?: PaginationParams) => [...saleInvoiceKeys.all, 'pending-credit', params ?? {}] as const,
};

export function useSaleInvoices(params?: SaleInvoiceListParams) {
  return useQuery({
    queryKey: saleInvoiceKeys.list(params),
    queryFn: () => saleInvoicesApi.list(params),
  });
}

export function useSaleInvoice(id: number) {
  return useQuery({
    queryKey: saleInvoiceKeys.detail(id),
    queryFn: () => saleInvoicesApi.get(id),
    enabled: id > 0,
  });
}

export function usePendingCredit(params?: PaginationParams) {
  return useQuery({
    queryKey: saleInvoiceKeys.pendingCredit(params),
    queryFn: () => saleInvoicesApi.getPendingCredit(params),
  });
}

export function useCreateSaleInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: CreateSaleInvoiceRequest) => saleInvoicesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleInvoiceKeys.all });
      toast.success('Sale invoice created');
    },
    onError: () => toast.error('Failed to create sale invoice'),
  });
}

export function usePaySaleInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => saleInvoicesApi.pay(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleInvoiceKeys.all });
      toast.success('Invoice marked as paid');
    },
    onError: () => toast.error('Failed to mark as paid'),
  });
}

export function useDeleteSaleInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => saleInvoicesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleInvoiceKeys.all });
      toast.success('Sale invoice deleted');
    },
    onError: () => toast.error('Failed to delete invoice'),
  });
}

export function useReverseSaleInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => saleInvoicesApi.reverse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleInvoiceKeys.all });
      toast.success('Factura de anulación generada');
    },
    onError: () => toast.error('Error al anular la factura'),
  });
}
