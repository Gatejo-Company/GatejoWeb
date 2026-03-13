import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { categoriesApi } from '@/api/endpoints/categories';
import { brandsApi } from '@/api/endpoints/brands';
import { createProductSchema, updateProductSchema, type CreateProductFormValues, type UpdateProductFormValues } from './productSchema';
import { useCreateProduct, useUpdateProduct, useProduct } from './queries';
import type { AppError } from '@/api/types';

interface ProductFormProps {
  editId?: number | null;
  onClose: () => void;
}

type FormValues = CreateProductFormValues | UpdateProductFormValues;

function extractApiError(error: unknown): string {
  const appError = error as AppError;
  return appError?.detail ?? appError?.title ?? 'An error occurred';
}

export function ProductForm({ editId, onClose }: ProductFormProps) {
  const isEditing = !!editId;
  const { data: product } = useProduct(editId ?? 0);

  const categories = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.list({ pageSize: 100 }),
    staleTime: Infinity,
  });

  const brands = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => brandsApi.list({ pageSize: 100 }),
    staleTime: Infinity,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const schema = isEditing ? updateProductSchema : createProductSchema;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (product && isEditing) {
      reset({
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        brandId: product.brandId,
        minStock: product.minStock,
      });
    }
  }, [product, isEditing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && editId) {
        const { name, description, categoryId, brandId, minStock } = values as UpdateProductFormValues;
        await updateMutation.mutateAsync({ id: editId, body: { name, description, categoryId, brandId, minStock } });
      } else {
        await createMutation.mutateAsync(values as CreateProductFormValues);
      }
      onClose();
    } catch (err) {
      const appError = err as AppError;
      if (appError?.errors) {
        for (const [field, messages] of Object.entries(appError.errors)) {
          setError(field as keyof FormValues, { message: (messages as string[])[0] });
        }
      } else {
        setError('root', { message: extractApiError(err) });
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'New Product'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" error={!!errors.name} {...register('name')} />
        </FormField>

        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Input id="description" {...register('description')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message} required>
            <select
              id="categoryId"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register('categoryId', { valueAsNumber: true })}
            >
              <option value="">Select category</option>
              {categories.data?.items.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Brand" htmlFor="brandId" error={errors.brandId?.message} required>
            <select
              id="brandId"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register('brandId', { valueAsNumber: true })}
            >
              <option value="">Select brand</option>
              {brands.data?.items.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!isEditing && (
            <FormField label="Price" htmlFor="price" error={(errors as { price?: { message?: string } }).price?.message} required>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                error={!!(errors as { price?: unknown }).price}
                {...register('price' as keyof FormValues, { valueAsNumber: true })}
              />
            </FormField>
          )}

          <FormField label="Min Stock" htmlFor="minStock" error={errors.minStock?.message}>
            <Input
              id="minStock"
              type="number"
              min="0"
              step="1"
              {...register('minStock', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
