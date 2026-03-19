import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { useCategoryStore } from '@/features/categories/store';
import { useBrandStore } from '@/features/brands/store';
import { useProductStore } from './store';
import { createProductSchema, updateProductSchema, type CreateProductFormValues, type UpdateProductFormValues } from './productSchema';
import type { AppError } from '@/api/types';

interface ProductFormProps {
  editId?: number | null;
  onClose: () => void;
}

type FormValues = CreateProductFormValues | UpdateProductFormValues;

function extractApiError(error: unknown): string {
  const appError = error as AppError;
  return appError?.detail ?? appError?.title ?? 'Ocurrió un error';
}

export function ProductForm({ editId, onClose }: ProductFormProps) {
  const isEditing = !!editId;
  const toast = useToast();

  const { detail, fetchDetail, create, update, isCreating, isUpdating } = useProductStore();
  const { selectItems: categories, fetchSelectItems: fetchCategories } = useCategoryStore();
  const { selectItems: brands, fetchSelectItems: fetchBrands } = useBrandStore();

  useEffect(() => {
    void fetchCategories();
    void fetchBrands();
    if (editId) void fetchDetail(editId);
  }, [editId]);

  const schema = isEditing ? updateProductSchema : createProductSchema;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (detail && isEditing) {
      reset({
        name: detail.name,
        description: detail.description,
        categoryId: detail.categoryId,
        brandId: detail.brandId,
        minStock: detail.minStock,
      });
    }
  }, [detail, isEditing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && editId) {
        const { name, description, categoryId, brandId, minStock } = values as UpdateProductFormValues;
        await update(editId, { name, description, categoryId, brandId, minStock });
        toast.success('Product updated successfully');
      } else {
        await create(values as CreateProductFormValues);
        toast.success('Product created successfully');
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

  const isPending = isCreating || isUpdating || isSubmitting;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" error={!!errors.name} {...register('name')} />
        </FormField>

        <FormField label="Descripción" htmlFor="description" error={errors.description?.message}>
          <Input id="description" {...register('description')} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Categoría" htmlFor="categoryId" error={errors.categoryId?.message} required>
            <select
              id="categoryId"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register('categoryId', { valueAsNumber: true })}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Marca" htmlFor="brandId" error={errors.brandId?.message} required>
            <select
              id="brandId"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register('brandId', { valueAsNumber: true })}
            >
              <option value="">Seleccionar marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isEditing && (
            <FormField label="Precio" htmlFor="price" error={(errors as { price?: { message?: string } }).price?.message} required>
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

          <FormField label="Stock Mínimo" htmlFor="minStock" error={errors.minStock?.message}>
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
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
