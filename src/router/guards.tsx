import { Outlet } from 'react-router';

// Phase 1: pass-through guards — real logic added in Phase 2
export function ProtectedRoute() {
  // TODO Phase 2: check auth state, redirect to /login if not authenticated
  return <Outlet />;
}

export function AdminRoute() {
  // TODO Phase 2: check user.role === 'Admin', redirect to / if not
  return <Outlet />;
}
