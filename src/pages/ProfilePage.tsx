import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useAuth } from '@/features/auth/AuthContext';
import { usersApi } from '@/api/endpoints/users';
import { useToast } from '@/components/ui/Toast';
import type { AppError } from '@/api/types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  email: z.string().email('Correo electrónico inválido'),
});
type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();

  const { data: userData } = useQuery({
    queryKey: ['users', 'me', user?.id],
    queryFn: () => usersApi.get(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!user || !userData) throw new Error('Not loaded');
      return usersApi.update(user.id, { name: values.name, email: values.email, roleId: userData.roleId });
    },
    onSuccess: () => toast.success('Perfil actualizado'),
    onError: () => toast.error('Error al actualizar el perfil'),
  });

  const {
    register, handleSubmit, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync(values);
    } catch (err) {
      const appError = err as AppError;
      setError('root', { message: appError?.detail ?? 'Error al actualizar el perfil' });
    }
  };

  return (
    <PageLayout title="Mi Perfil">
      <div className="max-w-lg">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Rol: <span className="font-medium text-gray-700">{user?.role}</span></p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errors.root && <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{errors.root.message}</div>}
            <FormField label="Nombre" htmlFor="prof-name" error={errors.name?.message} required>
              <Input id="prof-name" error={!!errors.name} {...register('name')} />
            </FormField>
            <FormField label="Correo electrónico" htmlFor="prof-email" error={errors.email?.message} required>
              <Input id="prof-email" type="email" error={!!errors.email} {...register('email')} />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={updateMutation.isPending || isSubmitting} disabled={!userData}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
