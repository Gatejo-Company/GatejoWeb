import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useStockMovementStore } from '@/features/stock-movements/store';
import { useProductStore } from '@/features/products/store';
import { useToast } from '@/components/ui/Toast';
import type { StockMovement } from '@/types/models';
import type { AppError } from '@/api/types';

const schema = z.object({
  productId: z.number().int().min(1, 'Selecciona un producto'),
  typeId: z.number().int().min(1, 'Selecciona un tipo de movimiento'),
  quantity: z.number().int().refine((n) => n !== 0, 'La cantidad no puede ser 0'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatDate(s: string) { return new Date(s).toLocaleString(); }

export function StockMovementsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading, isCreating, movementTypes, fetch, fetchMovementTypes, create } = useStockMovementStore();
  const { selectItems: products, fetchSelectItems: fetchProducts } = useProductStore();

  useEffect(() => {
    void fetch({ page: pagination.page, pageSize: pagination.pageSize });
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    void fetchMovementTypes();
    void fetchProducts();
  }, []);

  const {
    register, handleSubmit, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { quantity: 1 } });

  const onSubmit = async (values: FormValues) => {
    try {
      await create(values);
      toast.success('Movimiento de stock creado');
      reset();
      setIsFormOpen(false);
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? 'Error' });
    }
  };

  const columns: Column<StockMovement>[] = [
    { key: 'id', header: 'ID', render: (m) => <span className="font-mono text-xs text-gray-400">#{m.id}</span> },
    { key: 'product', header: 'Producto', render: (m) => <span className="font-medium">{m.productName ?? `#${m.productId}`}</span> },
    { key: 'type', header: 'Tipo', render: (m) => <span className="text-gray-600">{m.typeName ?? `#${m.typeId}`}</span> },
    {
      key: 'quantity', header: 'Cantidad', render: (m) => (
        <span className={`font-mono font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
        </span>
      ),
    },
    { key: 'notes', header: 'Notas', render: (m) => <span className="text-gray-500 text-sm">{m.notes ?? '—'}</span> },
    { key: 'date', header: 'Fecha', render: (m) => <span className="text-gray-500 text-xs">{formatDate(m.createdAt)}</span> },
  ];

  return (
    <PageLayout
      title="Movimientos de Stock"
      action={isAdmin() ? <Button onClick={() => setIsFormOpen(true)}>+ Nuevo Movimiento</Button> : undefined}
    >
      <DataTable columns={columns} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(m) => m.id} emptyMessage="No se encontraron movimientos de stock." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />

      {isFormOpen && (
        <Modal isOpen onClose={() => setIsFormOpen(false)} title="Nuevo Movimiento de Stock">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errors.root && <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{errors.root.message}</div>}
            <FormField label="Producto" htmlFor="sm-product" error={errors.productId?.message} required>
              <select id="sm-product" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('productId', { valueAsNumber: true })}>
                <option value={0}>Seleccionar producto</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stock: {p.currentStock})</option>)}
              </select>
            </FormField>
            <FormField label="Tipo de Movimiento" htmlFor="sm-type" error={errors.typeId?.message} required>
              <select id="sm-type" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('typeId', { valueAsNumber: true })}>
                <option value={0}>Seleccionar tipo</option>
                {movementTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Cantidad (positivo = entrada, negativo = salida)" htmlFor="sm-qty" error={errors.quantity?.message} required>
              <Input id="sm-qty" type="number" step="1" error={!!errors.quantity} {...register('quantity', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Notas" htmlFor="sm-notes">
              <Input id="sm-notes" {...register('notes')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={isCreating || isSubmitting}>Crear</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}
