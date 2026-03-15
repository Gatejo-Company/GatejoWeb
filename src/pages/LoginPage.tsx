import { LoginForm } from '@/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gatejo</h1>
          <p className="mt-1 text-sm text-gray-500">Inicia sesión en tu cuenta</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
