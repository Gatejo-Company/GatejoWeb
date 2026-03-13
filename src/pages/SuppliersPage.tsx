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
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/features/suppliers/queries';
import type { Supplier } from '@/types/models';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: Column<Supplier>[] = [
  { key: 'id', header: 'ID', render: (s) => <span className="text-gray-400 font-mono text-xs">#{s.id}</span> },
  { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
  { key: 'phone', header: 'Phone', render: (s) => <span className="text-gray-500">{s.phone ?? '—'}</span> },
  { key: 'email', header: 'Email', render: (s) => <span className="text-gray-500">{s.email ?? '—'}</span> },
];

export function SuppliersPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);

  const { data, isLoading } = useSuppliers({ page: pagination.page, pageSize: pagination.pageSize });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => { setEditingItem(null); reset({ name: '', phone: '', email: '', notes: '' }); setIsFormOpen(true); };
  const openEdit = (item: Supplier) => {
    setEditingItem(item);
    reset({ name: item.name, phone: item.phone ?? '', email: item.email ?? '', notes: item.notes ?? '' });
    setIsFormOpen(true);
  };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const onSubmit = async (values: FormValues) => {
    const body = { name: values.name, phone: values.phone || undefined, email: values.email || undefined, notes: values.notes || undefined };
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, body });
    } else {
      await createMutation.mutateAsync(body);
    }
    closeForm();
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this supplier?')) deleteMutation.mutate(id);
  };

  const adminColumns: Column<Supplier>[] = isAdmin()
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
    <PageLayout title="Suppliers" action={isAdmin() ? <Button onClick={openCreate}>+ New Supplier</Button> : undefined}>
      <DataTable columns={[...columns, ...adminColumns]} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(s) => s.id} emptyMessage="No suppliers found." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />

      {isFormOpen && (
        <Modal isOpen onClose={closeForm} title={editingItem ? 'Edit Supplier' : 'New Supplier'} maxWidth="lg">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Name" htmlFor="sup-name" error={errors.name?.message} required>
              <Input id="sup-name" error={!!errors.name} {...register('name')} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone" htmlFor="sup-phone" error={errors.phone?.message}>
                <Input id="sup-phone" type="tel" {...register('phone')} />
              </FormField>
              <FormField label="Email" htmlFor="sup-email" error={errors.email?.message}>
                <Input id="sup-email" type="email" {...register('email')} />
              </FormField>
            </div>
            <FormField label="Notes" htmlFor="sup-notes">
              <Input id="sup-notes" {...register('notes')} />
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
