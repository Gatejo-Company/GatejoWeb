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
import { useCategoryStore } from '@/features/categories/store';
import { useToast } from '@/components/ui/Toast';
import type { Category } from '@/types/models';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: Column<Category>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (c) => <span className="text-gray-400 font-mono text-xs">#{c.id}</span>,
  },
  { key: 'name', header: 'Nombre', render: (c) => <span className="font-medium">{c.name}</span> },
  {
    key: 'description',
    header: 'Descripción',
    render: (c) => <span className="text-gray-500">{c.description ?? '—'}</span>,
  },
];

export function CategoriesPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isSaving, isDeleting, fetch, create, update, delete: deleteCategory } = useCategoryStore();

  useEffect(() => {
    void fetch({ page: pagination.page, pageSize: pagination.pageSize });
  }, [pagination.page, pagination.pageSize]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditingItem(null);
    reset({ name: '', description: '' });
    setIsFormOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    reset({ name: item.name, description: item.description ?? '' });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (values: FormValues) => {
    const body = { name: values.name, description: values.description };
    try {
      if (editingItem) {
        await update(editingItem.id, body);
        toast.success('Category updated');
      } else {
        await create(body);
        toast.success('Category created');
      }
      closeForm();
    } catch {
      toast.error(editingItem ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleDelete = (id: number) => setDeletingId(id);

  const adminColumns: Column<Category>[] = isAdmin()
    ? [
        {
          key: '_actions',
          header: 'Acciones',
          render: (item) => (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(item.id)}
                isLoading={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          ),
        },
      ]
    : [];

  const isPending = isSaving || isSubmitting;

  return (
    <PageLayout
      title="Categorías"
      action={isAdmin() ? <Button onClick={openCreate}>+ Nueva Categoría</Button> : undefined}
    >
      <DataTable
        columns={[...columns, ...adminColumns]}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyMessage="No se encontraron categorías."
      />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={data?.totalPages ?? 0}
        totalCount={data?.totalCount ?? 0}
        onPageChange={pagination.setPage}
      />

      {isFormOpen && (
        <Modal isOpen onClose={closeForm} title={editingItem ? 'Editar Categoría' : 'Nueva Categoría'}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Nombre" htmlFor="cat-name" error={errors.name?.message} required>
              <Input id="cat-name" error={!!errors.name} {...register('name')} />
            </FormField>
            <FormField label="Descripción" htmlFor="cat-description">
              <Input id="cat-description" {...register('description')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending}>
                {editingItem ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={deletingId !== null}
        title="Eliminar categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría?"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deletingId !== null) {
            try {
              await deleteCategory(deletingId);
              toast.success('Category deleted');
            } catch {
              toast.error('Failed to delete category');
            }
          }
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </PageLayout>
  );
}
