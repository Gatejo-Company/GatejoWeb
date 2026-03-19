import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useBrandStore } from '@/features/brands/store';
import { useToast } from '@/components/ui/Toast';
import type { Brand } from '@/types/models';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
});
type FormValues = z.infer<typeof schema>;

const columns: Column<Brand>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (b) => <span className="text-gray-400 font-mono text-xs">#{b.id}</span>,
  },
  { key: 'name', header: 'Nombre', render: (b) => <span className="font-medium">{b.name}</span> },
];

export function BrandsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isSaving, isDeleting, fetch, create, update, delete: deleteBrand } = useBrandStore();

  useEffect(() => {
    void fetch({ page: pagination.page, pageSize: pagination.pageSize });
  }, [pagination.page, pagination.pageSize]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => { setEditingItem(null); reset({ name: '' }); setIsFormOpen(true); };
  const openEdit = (item: Brand) => { setEditingItem(item); reset({ name: item.name }); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem) {
        await update(editingItem.id, values);
        toast.success('Brand updated');
      } else {
        await create(values);
        toast.success('Brand created');
      }
      closeForm();
    } catch {
      toast.error(editingItem ? 'Failed to update brand' : 'Failed to create brand');
    }
  };

  const handleDelete = (id: number) => setDeletingId(id);

  const adminColumns: Column<Brand>[] = isAdmin()
    ? [
        {
          key: '_actions',
          header: 'Acciones',
          render: (item) => (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Editar</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)} isLoading={isDeleting}>Eliminar</Button>
            </div>
          ),
        },
      ]
    : [];

  const isPending = isSaving || isSubmitting;

  return (
    <PageLayout title="Marcas" action={isAdmin() ? <Button onClick={openCreate}>+ Nueva Marca</Button> : undefined}>
      <DataTable columns={[...columns, ...adminColumns]} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(b) => b.id} emptyMessage="No se encontraron marcas." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />

      {isFormOpen && (
        <Modal isOpen onClose={closeForm} title={editingItem ? 'Editar Marca' : 'Nueva Marca'}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Nombre" htmlFor="brand-name" error={errors.name?.message} required>
              <Input id="brand-name" error={!!errors.name} {...register('name')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" isLoading={isPending}>{editingItem ? 'Guardar Cambios' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={deletingId !== null}
        title="Eliminar marca"
        message="¿Estás seguro de que deseas eliminar esta marca?"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deletingId !== null) {
            try {
              await deleteBrand(deletingId);
              toast.success('Brand deleted');
            } catch {
              toast.error('Failed to delete brand');
            }
          }
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </PageLayout>
  );
}
