import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { stockMovementsApi, movementTypesApi } from '@/api/endpoints/stockMovements';
import { productsApi } from '@/api/endpoints/products';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/components/ui/Toast';
import type { StockMovement } from '@/types/models';
import type { AppError } from '@/api/types';

const schema = z.object({
  productId: z.number().int().min(1, 'Select a product'),
  typeId: z.number().int().min(1, 'Select a movement type'),
  quantity: z.number().int().refine((n) => n !== 0, 'Quantity cannot be 0'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatDate(s: string) { return new Date(s).toLocaleString(); }

export function StockMovementsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', 'list', { page: pagination.page, pageSize: pagination.pageSize }],
    queryFn: () => stockMovementsApi.list({ page: pagination.page, pageSize: pagination.pageSize }),
  });

  const products = useQuery({ queryKey: ['products', 'all-for-select'], queryFn: () => productsApi.list({ pageSize: 200, active: true }), staleTime: 1000 * 60 * 5 });
  const movementTypes = useQuery({ queryKey: ['movement-types'], queryFn: () => movementTypesApi.list({ pageSize: 50 }), staleTime: Infinity });

  const createMutation = useMutation({
    mutationFn: (body: FormValues) => stockMovementsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Stock movement created');
      setIsFormOpen(false);
    },
    onError: () => toast.error('Failed to create stock movement'),
  });

  const {
    register, handleSubmit, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { quantity: 1 } });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? 'Failed' });
    }
  };

  const columns: Column<StockMovement>[] = [
    { key: 'id', header: 'ID', render: (m) => <span className="font-mono text-xs text-gray-400">#{m.id}</span> },
    { key: 'product', header: 'Product', render: (m) => <span className="font-medium">{m.productName ?? `#${m.productId}`}</span> },
    { key: 'type', header: 'Type', render: (m) => <span className="text-gray-600">{m.typeName ?? `#${m.typeId}`}</span> },
    {
      key: 'quantity', header: 'Quantity', render: (m) => (
        <span className={`font-mono font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
        </span>
      ),
    },
    { key: 'notes', header: 'Notes', render: (m) => <span className="text-gray-500 text-sm">{m.notes ?? '—'}</span> },
    { key: 'date', header: 'Date', render: (m) => <span className="text-gray-500 text-xs">{formatDate(m.createdAt)}</span> },
  ];

  return (
    <PageLayout
      title="Stock Movements"
      action={isAdmin() ? <Button onClick={() => setIsFormOpen(true)}>+ New Movement</Button> : undefined}
    >
      <DataTable columns={columns} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(m) => m.id} emptyMessage="No stock movements found." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />

      {isFormOpen && (
        <Modal isOpen onClose={() => setIsFormOpen(false)} title="New Stock Movement">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errors.root && <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{errors.root.message}</div>}
            <FormField label="Product" htmlFor="sm-product" error={errors.productId?.message} required>
              <select id="sm-product" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('productId', { valueAsNumber: true })}>
                <option value={0}>Select product</option>
                {products.data?.items.map((p) => <option key={p.id} value={p.id}>{p.name} (stock: {p.currentStock})</option>)}
              </select>
            </FormField>
            <FormField label="Movement Type" htmlFor="sm-type" error={errors.typeId?.message} required>
              <select id="sm-type" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('typeId', { valueAsNumber: true })}>
                <option value={0}>Select type</option>
                {movementTypes.data?.items.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Quantity (positive = in, negative = out)" htmlFor="sm-qty" error={errors.quantity?.message} required>
              <Input id="sm-qty" type="number" step="1" error={!!errors.quantity} {...register('quantity', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Notes" htmlFor="sm-notes">
              <Input id="sm-notes" {...register('notes')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending || isSubmitting}>Create</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}
