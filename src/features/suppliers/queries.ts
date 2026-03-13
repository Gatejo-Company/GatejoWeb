import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { suppliersApi, type SupplierRequest } from '@/api/endpoints/suppliers';
import { useToast } from '@/components/ui/Toast';
import type { PaginationParams } from '@/api/types';

export const supplierKeys = {
  all: ['suppliers'] as const,
  list: (params?: PaginationParams) => [...supplierKeys.all, 'list', params ?? {}] as const,
};

export function useSuppliers(params?: PaginationParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersApi.list(params),
  });
}

export function useCreateSupplier() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: SupplierRequest) => suppliersApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier created');
    },
    onError: () => toast.error('Failed to create supplier'),
  });
}

export function useUpdateSupplier() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: SupplierRequest }) =>
      suppliersApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier updated');
    },
    onError: () => toast.error('Failed to update supplier'),
  });
}

export function useDeleteSupplier() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier deleted');
    },
    onError: () => toast.error('Failed to delete supplier'),
  });
}
