import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { productsApi, type ProductListParams, type CreateProductRequest, type UpdateProductRequest, type UpdatePriceRequest } from '@/api/endpoints/products';
import { useToast } from '@/components/ui/Toast';

export const productKeys = {
  all: ['products'] as const,
  list: (params?: ProductListParams) => [...productKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
  priceHistory: (id: number) => [...productKeys.all, 'price-history', id] as const,
  stock: (id: number) => [...productKeys.all, 'stock', id] as const,
};

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateProduct() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: CreateProductRequest) => productsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created successfully');
    },
    onError: () => toast.error('Failed to create product'),
  });
}

export function useUpdateProduct() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateProductRequest }) =>
      productsApi.update(id, body),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success('Product updated successfully');
    },
    onError: () => toast.error('Failed to update product'),
  });
}

export function useDeleteProduct() {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });
}

export function usePatchProductPrice() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdatePriceRequest }) =>
      productsApi.patchPrice(id, body),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success('Price updated');
    },
    onError: () => toast.error('Failed to update price'),
  });
}

export function usePatchProductActive() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      productsApi.patchActive(id, active),
    onSuccess: (_, { active }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success(`Product ${active ? 'activated' : 'deactivated'}`);
    },
    onError: () => toast.error('Failed to update status'),
  });
}

export function useProductPriceHistory(id: number) {
  return useQuery({
    queryKey: productKeys.priceHistory(id),
    queryFn: () => productsApi.getPriceHistory(id),
    enabled: id > 0,
  });
}
