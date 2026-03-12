import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { brandsApi, type BrandRequest } from '@/api/endpoints/brands';
import { useToast } from '@/components/ui/Toast';
import type { PaginationParams } from '@/api/types';

export const brandKeys = {
  all: ['brands'] as const,
  list: (params?: PaginationParams) => [...brandKeys.all, 'list', params ?? {}] as const,
};

export function useBrands(params?: PaginationParams) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => brandsApi.list(params),
  });
}

export function useCreateBrand() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: BrandRequest) => brandsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand created');
    },
    onError: () => toast.error('Failed to create brand'),
  });
}

export function useUpdateBrand() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: BrandRequest }) =>
      brandsApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand updated');
    },
    onError: () => toast.error('Failed to update brand'),
  });
}

export function useDeleteBrand() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => brandsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand deleted');
    },
    onError: () => toast.error('Failed to delete brand'),
  });
}
