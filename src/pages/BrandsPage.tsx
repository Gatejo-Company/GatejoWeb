import { useState } from 'react';
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
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/features/brands/queries';
import type { Brand } from '@/types/models';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});
type FormValues = z.infer<typeof schema>;

const columns: Column<Brand>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (b) => <span className="text-gray-400 font-mono text-xs">#{b.id}</span>,
  },
  { key: 'name', header: 'Name', render: (b) => <span className="font-medium">{b.name}</span> },
];

export function BrandsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | null>(null);

  const { data, isLoading } = useBrands({ page: pagination.page, pageSize: pagination.pageSize });
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();

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
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, body: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    closeForm();
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this brand?')) deleteMutation.mutate(id);
  };

  const adminColumns: Column<Brand>[] = isAdmin()
    ? [
        {
          key: '_actions',
          header: 'Actions',
          render: (item) => (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)} isLoading={deleteMutation.isPending}>Delete</Button>
            </div>
          ),
        },
      ]
    : [];

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <PageLayout title="Brands" action={isAdmin() ? <Button onClick={openCreate}>+ New Brand</Button> : undefined}>
      <DataTable columns={[...columns, ...adminColumns]} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(b) => b.id} emptyMessage="No brands found." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />

      {isFormOpen && (
        <Modal isOpen onClose={closeForm} title={editingItem ? 'Edit Brand' : 'New Brand'}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Name" htmlFor="brand-name" error={errors.name?.message} required>
              <Input id="brand-name" error={!!errors.name} {...register('name')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
              <Button type="submit" isLoading={isPending}>{editingItem ? 'Save Changes' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}
