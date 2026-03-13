import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { categoriesApi, type CategoryRequest } from '@/api/endpoints/categories';
import { useToast } from '@/components/ui/Toast';
import type { PaginationParams } from '@/api/types';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params?: PaginationParams) => [...categoryKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
};

export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.list(params),
  });
}

export function useCreateCategory() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: CategoryRequest) => categoriesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category created');
    },
    onError: () => toast.error('Failed to create category'),
  });
}

export function useUpdateCategory() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoryRequest }) =>
      categoriesApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category updated');
    },
    onError: () => toast.error('Failed to update category'),
  });
}

export function useDeleteCategory() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });
}
