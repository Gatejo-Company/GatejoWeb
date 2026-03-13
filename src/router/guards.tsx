import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
}
