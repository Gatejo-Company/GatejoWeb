import { XMarkIcon } from '@heroicons/react/20/solid';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { productsApi } from '@/api/endpoints/products';
import { useCreateSaleInvoice } from './queries';
import type { AppError } from '@/api/types';

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  onCredit: z.boolean().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().min(1, 'Selecciona un producto'),
        quantity: z.number().int().min(1, 'La cantidad debe ser ≥ 1'),
        unitPrice: z.number().min(0.01, 'El precio debe ser > 0'),
      }),
    )
    .min(1, 'Se requiere al menos un artículo'),
});

type FormValues = z.infer<typeof schema>;

interface SaleInvoiceFormProps {
  onClose: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function SaleInvoiceForm({ onClose }: SaleInvoiceFormProps) {
  const products = useQuery({
    queryKey: ['products', 'all-for-select'],
    queryFn: () => productsApi.list({ pageSize: 200, active: true }),
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useCreateSaleInvoice();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      onCredit: false,
      items: [{ productId: 0, quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');

  const total = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleProductChange = (index: number, productId: number) => {
    const product = products.data?.items.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.unitPrice`, product.price);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        date: values.date,
        onCredit: values.onCredit,
        notes: values.notes,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      onClose();
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? appError?.title ?? 'Error al crear la factura' });
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Nueva Factura de Venta" maxWidth="xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Fecha" htmlFor="si-date" error={errors.date?.message} required>
            <Input id="si-date" type="date" error={!!errors.date} {...register('date')} />
          </FormField>
          <div className="flex items-center gap-2 sm:pt-6">
            <input id="si-credit" type="checkbox" {...register('onCredit')} className="w-4 h-4" />
            <label htmlFor="si-credit" className="text-sm text-gray-700">A crédito</label>
          </div>
        </div>

        <FormField label="Notas" htmlFor="si-notes">
          <Input id="si-notes" {...register('notes')} />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Artículos</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ productId: 0, quantity: 1, unitPrice: 0 })}
            >
              + Agregar Artículo
            </Button>
          </div>

          {errors.items?.root && (
            <p className="text-xs text-red-600 mb-2">{errors.items.root.message}</p>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end border border-gray-100 rounded-md p-2 sm:border-0 sm:p-0">
                <div className="col-span-2 sm:col-span-5">
                  <label className="text-xs text-gray-500 mb-1 block">Producto</label>
                  <select
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    {...register(`items.${index}.productId`, {
                      valueAsNumber: true,
                      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleProductChange(index, Number(e.target.value)),
                    })}
                  >
                    <option value={0}>Seleccionar producto</option>
                    {products.data?.items.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <p className="text-xs text-red-600">{errors.items[index].productId?.message}</p>
                  )}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Cant.</label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Precio Unit.</label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-xs text-gray-500 mb-1 block">Subtotal</label>
                  <span className="text-sm font-mono text-gray-700">
                    {formatCurrency((Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.unitPrice) || 0))}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                    aria-label="Eliminar artículo"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              Total: <span className="font-mono text-gray-900">{formatCurrency(total)}</span>
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={createMutation.isPending || isSubmitting}>
            Crear Factura
          </Button>
        </div>
      </form>
    </Modal>
  );
}
