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
import { Badge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useUserStore } from '@/features/users/store';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/types/models';
import type { AppError } from '@/api/types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  email: z.string().email('Correo electrónico inválido'),
  roleId: z.number().int().min(1, 'Selecciona un rol'),
});
type FormValues = z.infer<typeof schema>;

function formatDate(s: string) { return new Date(s).toLocaleDateString(); }

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const toast = useToast();
  const { roles, isSaving, fetchRoles, update } = useUserStore();

  useEffect(() => {
    void fetchRoles();
  }, []);

  const {
    register, handleSubmit, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email, roleId: user.roleId },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await update(user.id, values);
      toast.success('Usuario actualizado');
      onClose();
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? 'Error' });
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Editar Usuario">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{errors.root.message}</div>}
        <FormField label="Nombre" htmlFor="u-name" error={errors.name?.message} required>
          <Input id="u-name" error={!!errors.name} {...register('name')} />
        </FormField>
        <FormField label="Correo electrónico" htmlFor="u-email" error={errors.email?.message} required>
          <Input id="u-email" type="email" error={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label="Rol" htmlFor="u-role" error={errors.roleId?.message} required>
          <select id="u-role" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" {...register('roleId', { valueAsNumber: true })}>
            <option value={0}>Seleccionar rol</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving || isSubmitting}>Guardar Cambios</Button>
        </div>
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const pagination = usePagination();
  const toast = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isPatching, isDeleting, fetch, patchActive, delete: deleteUser } = useUserStore();

  useEffect(() => {
    void fetch({ page: pagination.page, pageSize: pagination.pageSize });
  }, [pagination.page, pagination.pageSize]);

  const handlePatchActive = async (id: number, active: boolean) => {
    try {
      await patchActive(id, active);
      toast.success('Estado del usuario actualizado');
    } catch {
      toast.error('Error al actualizar el estado del usuario');
    }
  };

  const columns: Column<User>[] = [
    { key: 'id', header: 'ID', render: (u) => <span className="font-mono text-xs text-gray-400">#{u.id}</span> },
    { key: 'name', header: 'Nombre', render: (u) => <span className="font-medium">{u.name}{u.id === currentUser?.id && <span className="ml-2 text-xs text-indigo-500">(tú)</span>}</span> },
    { key: 'email', header: 'Correo', render: (u) => <span className="text-gray-600 text-sm">{u.email}</span> },
    { key: 'role', header: 'Rol', render: (u) => <Badge variant={u.roleName === 'Admin' ? 'blue' : 'gray'}>{u.roleName ?? `#${u.roleId}`}</Badge> },
    { key: 'status', header: 'Estado', render: (u) => u.active ? <Badge variant="green">Activo</Badge> : <Badge variant="gray">Inactivo</Badge> },
    { key: 'created', header: 'Creado', render: (u) => <span className="text-gray-500 text-xs">{formatDate(u.createdAt)}</span> },
    {
      key: '_actions', header: 'Acciones', render: (u) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditingUser(u)}>Editar</Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void handlePatchActive(u.id, !u.active)}
            isLoading={isPatching}
          >
            {u.active ? 'Desactivar' : 'Activar'}
          </Button>
          {u.id !== currentUser?.id && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeletingId(u.id)}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Usuarios">
      <DataTable columns={columns} data={data?.items ?? []} isLoading={isLoading} keyExtractor={(u) => u.id} emptyMessage="No se encontraron usuarios." />
      <Pagination page={pagination.page} pageSize={pagination.pageSize} totalPages={data?.totalPages ?? 0} totalCount={data?.totalCount ?? 0} onPageChange={pagination.setPage} />
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deletingId !== null) {
            try {
              await deleteUser(deletingId);
              toast.success('Usuario eliminado');
            } catch {
              toast.error('Error al eliminar el usuario');
            }
          }
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </PageLayout>
  );
}
