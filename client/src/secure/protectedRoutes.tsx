import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import { AppShell } from './AppShell';

export function ProtectedRoutes() {
  const isAuthenticated = !!useAuthStore((s) => s.authToken);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
