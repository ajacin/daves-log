import { Navigate } from 'react-router-dom';
import { useUser } from '../lib/context/user';
import AppDrawer from './drawer/Drawer';

export function ProtectedLayout({ children }) {
  const { current: user } = useUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppDrawer />
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
} 