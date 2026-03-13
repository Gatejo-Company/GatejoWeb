import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  purchaseInvoicesApi,
  type PurchaseInvoiceListParams,
  type CreatePurchaseInvoiceRequest,
} from '@/api/endpoints/purchaseInvoices';
import { useToast } from '@/components/ui/Toast';

export const purchaseInvoiceKeys = {
  all: ['purchase-invoices'] as const,
  list: (params?: PurchaseInvoiceListParams) => [...purchaseInvoiceKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...purchaseInvoiceKeys.all, 'detail', id] as const,
};

export function usePurchaseInvoices(params?: PurchaseInvoiceListParams) {
  return useQuery({
    queryKey: purchaseInvoiceKeys.list(params),
    queryFn: () => purchaseInvoicesApi.list(params),
  });
}

export function useCreatePurchaseInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: CreatePurchaseInvoiceRequest) => purchaseInvoicesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      toast.success('Purchase invoice created');
    },
    onError: () => toast.error('Failed to create purchase invoice'),
  });
}

export function usePatchPayment() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, paid }: { id: number; paid: number }) =>
      purchaseInvoicesApi.patchPayment(id, paid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      toast.success('Payment updated');
    },
    onError: () => toast.error('Failed to update payment'),
  });
}

export function useDeletePurchaseInvoice() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => purchaseInvoicesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      toast.success('Purchase invoice deleted');
    },
    onError: () => toast.error('Failed to delete invoice'),
  });
}
