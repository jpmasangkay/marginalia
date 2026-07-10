import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { LoginPage } from '../features/auth/login-page';
import { Dashboard } from '../features/dashboard/dashboard';
import { Redirect } from '../shared/components/redirect';
import { useAuth } from '../lib/auth-context';

/**
 * Wraps routes that require authentication.
 * Shows a loading state while session is being checked,
 * then redirects to /login if not authenticated.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf8fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] animate-pulse shadow-lg" />
          <p className="text-[#9b8fad] text-sm font-medium">loading marginalia...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * Redirects already-authenticated users away from the auth pages.
 */
function AuthRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf8fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] animate-pulse shadow-lg" />
          <p className="text-[#9b8fad] text-sm font-medium">loading marginalia...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    // Auth-only routes (redirect to /dashboard if already logged in)
    element: <AuthRoute />,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/', element: <Navigate to="/login" replace /> },
    ],
  },
  {
    // Protected routes (redirect to /login if not logged in)
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', Component: Dashboard },
    ],
  },
  {
    path: '*',
    element: <Redirect to="/login" />,
  },
]);
