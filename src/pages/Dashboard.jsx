import { Navigate } from 'react-router-dom';
import { useUser } from '../lib/context/user';
import AppDrawer from '../components/drawer/Drawer';
import { useEffect, useState } from 'react';

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

export function Dashboard() {
  const { current: user } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{greeting}, {user?.name || 'User'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <p className="text-gray-600">Manage your tasks and ideas.</p>
          <a 
            href="/dashboard/ideas" 
            className="mt-4 inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            View Tasks
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Activities</h2>
          <p className="text-gray-600">Track baby activities.</p>
          <a 
            href="/dashboard/activities" 
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Log Activities
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Automations</h2>
          <p className="text-gray-600">Set up automated reminders.</p>
          <a 
            href="/dashboard/automations" 
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            View Automations
          </a>
        </div>
      </div>
    </div>
  );
} 
