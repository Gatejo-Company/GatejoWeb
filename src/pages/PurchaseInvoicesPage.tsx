import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { suppliersApi } from '@/api/endpoints/suppliers';
import { productsApi } from '@/api/endpoints/products';
import {
  usePurchaseInvoices,
  useCreatePurchaseInvoice,
  usePatchPayment,
  useDeletePurchaseInvoice,
} from '@/features/purchase-invoices/queries';
import { CheckCircleIcon, ClockIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import type { PurchaseInvoice } from '@/types/models';
import type { AppError } from '@/api/types';

const schema = z.object({
  supplierId: z.number().int().min(1, 'Selecciona un proveedor'),
  date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().min(1, 'Selecciona un producto'),
        quantity: z.number().int().min(1, 'Debe ser ≥ 1'),
        unitPrice: z.number().min(0.01, 'Debe ser > 0'),
      }),
    )
    .min(1, 'Se requiere al menos un artículo'),
});
type FormValues = z.infer<typeof schema>;

function formatDate(s: string) { return new Date(s).toLocaleDateString(); }
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function PurchaseInvoiceForm({ onClose }: { onClose: () => void }) {
  const suppliers = useQuery({ queryKey: ['suppliers', 'all'], queryFn: () => suppliersApi.list({ pageSize: 200 }), staleTime: Infinity });
  const products = useQuery({ queryKey: ['products', 'all-for-select'], queryFn: () => productsApi.list({ pageSize: 200, active: true }), staleTime: 1000 * 60 * 5 });
  const createMutation = useCreatePurchaseInvoice();

  const {
    register, handleSubmit, control, watch, setValue, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0], items: [{ productId: 0, quantity: 1, unitPrice: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const total = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({ supplierId: values.supplierId, date: values.date, notes: values.notes, items: values.items });
      onClose();
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? 'Error al crear la factura' });
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Nueva Factura de Compra" maxWidth="xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{errors.root.message}</div>}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Proveedor" htmlFor="pi-supplier" error={errors.supplierId?.message} required>
            <select id="pi-supplier" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('supplierId', { valueAsNumber: true })}>
              <option value={0}>Seleccionar proveedor</option>
              {suppliers.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Fecha" htmlFor="pi-date" error={errors.date?.message} required>
            <Input id="pi-date" type="date" error={!!errors.date} {...register('date')} />
          </FormField>
        </div>
        <FormField label="Notas" htmlFor="pi-notes"><Input id="pi-notes" {...register('notes')} /></FormField>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Artículos</h3>
            <Button type="button" variant="secondary" size="sm" onClick={() => append({ productId: 0, quantity: 1, unitPrice: 0 })}>+ Agregar Artículo</Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <label className="text-xs text-gray-500 mb-1 block">Producto</label>
                  <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    {...register(`items.${index}.productId`, {
                      valueAsNumber: true, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const product = products.data?.items.find((p) => p.id === Number(e.target.value));
                        if (product) setValue(`items.${index}.unitPrice`, product.price);
                      }
                    })}>
                    <option value={0}>Seleccionar producto</option>
                    {products.data?.items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Cant.</label><Input type="number" min="1" step="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} /></div>
                <div className="col-span-3"><label className="text-xs text-gray-500 mb-1 block">Costo Unitario</label><Input type="number" min="0.01" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} /></div>
                <div className="col-span-1"><label className="text-xs text-gray-500 mb-1 block">Sub.</label><span className="text-xs font-mono">{formatCurrency((Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.unitPrice) || 0))}</span></div>
                <div className="col-span-1 flex justify-end"><button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30" aria-label="Eliminar"><XMarkIcon className="w-5 h-5" /></button></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-semibold">Total: <span className="font-mono">{formatCurrency(total)}</span></span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={createMutation.isPending || isSubmitting}>Crear Factura</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({ invoice, onClose }: { invoice: PurchaseInvoice; onClose: () => void }) {
  const [paid, setPaid] = useState(String(invoice.paid));
  const patchMutation = usePatchPayment();
  return (
    <Modal isOpen onClose={onClose} title="Actualizar Pago">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Total: <strong>{formatCurrency(invoice.total)}</strong> | Pagado actualmente: <strong>{formatCurrency(invoice.paid)}</strong></p>
        <FormField label="Monto pagado" htmlFor="paid-amount">
          <Input id="paid-amount" type="number" min="0" step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button isLoading={patchMutation.isPending} onClick={async () => { await patchMutation.mutateAsync({ id: invoice.id, paid: Number(paid) }); onClose(); }}>Actualizar</Button>
        </div>
      </div>
    </Modal>
  );
}

export function PurchaseInvoicesPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<PurchaseInvoice | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = usePurchaseInvoices({ page: pagination.page, pageSize: pagination.pageSize });
  const deleteMutation = useDeletePurchaseInvoice();

  const columns: Column<PurchaseInvoice>[] = [
    { key: 'id', header: 'ID', render: (inv) => <span className="font-mono text-xs text-gray-400">#{inv.id}</span> },
    { key: 'supplier', header: 'Proveedor', render: (inv) => inv.supplierName ?? `#${inv.supplierId}` },
    { key: 'date', header: 'Fecha', render: (inv) => formatDate(inv.date) },
    { key: 'total', header: 'Total', render: (inv) => <span className="font-mono">{formatCurrency(inv.total)}</span> },
    { key: 'paid', header: 'Pagado', render: (inv) => <span className="font-mono">{formatCurrency(inv.paid)}</span> },
    {
      key: 'status', header: 'Estado', render: (inv) => {
        if (inv.paid >= inv.total) return <Badge variant="green"><CheckCircleIcon className="w-4 h-4 inline" /></Badge>;
        if (inv.paid > 0) return <Badge variant="yellow"><ClockIcon className="w-4 h-4 inline" /></Badge>;
        return <Badge variant="red"><XCircleIcon className="w-4 h-4 inline" /></Badge>;
      },
    },
    ...(isAdmin() ? [{
      key: '_actions', header: 'Acciones', render: (inv: PurchaseInvoice) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPayingInvoice(inv)}>Pago</Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingId(inv.id)} isLoading={deleteMutation.isPending}>Eliminar</Button>
        </div>
      ),
    } satisfies Column<PurchaseInvoice>] : []),
  ];

  return (
    <PageLayout title="Facturas de Compra" action={isAdmin() ? <Button onClick={() => setIsFormOpen(true)}>+ Nueva Factura</Button> : undefined}>
      <DataTable columns={columns} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(inv) => inv.id} emptyMessage="No se encontraron facturas de compra." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />
      {isFormOpen && <PurchaseInvoiceForm onClose={() => setIsFormOpen(false)} />}
      {payingInvoice && <PaymentModal invoice={payingInvoice} onClose={() => setPayingInvoice(null)} />}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Eliminar factura de compra"
        message="¿Estás seguro de que deseas eliminar esta factura?"
        confirmLabel="Eliminar"
        onConfirm={() => { if (deletingId !== null) deleteMutation.mutate(deletingId); setDeletingId(null); }}
        onCancel={() => setDeletingId(null)}
      />
    </PageLayout>
  );
}
