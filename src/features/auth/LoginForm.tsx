import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { loginSchema, type LoginFormValues } from './loginSchema';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import type { AppError } from '@/api/types';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      await login(values, true);
      await navigate('/');
    } catch (err) {
      const appError = err as AppError;
      setApiError(appError?.detail ?? appError?.title ?? 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {apiError && (
        <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          value={import.meta.env.DEV ? import.meta.env.VITE_DEFAULT_EMAIL : ""}
          {...register('email')}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          value={import.meta.env.DEV ? import.meta.env.VITE_DEFAULT_PASSWORD : ""}
          {...register('password')}
        />
      </FormField>

      <Button type="submit" isLoading={isSubmitting} className="w-full justify-center">
        Sign in
      </Button>
    </form>
  );
}
