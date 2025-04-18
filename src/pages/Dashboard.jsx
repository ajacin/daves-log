import { Navigate, Link } from 'react-router-dom';
import { useUser } from '../lib/context/user';
import { useIdeas } from '../lib/context/ideas';
import AppDrawer from '../components/drawer/Drawer';
import { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCircleCheck,
  faClock,
  faExclamationTriangle,
  faCalendarDay,
  faShoppingCart,
  faLayerGroup,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

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
  const ideas = useIdeas();
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

  // Initialize ideas data when the dashboard loads
  useEffect(() => {
    if (!ideas.current.length) {
      ideas.init();
    }
  }, [ideas]);

  // Memoize dashboard stats
  const dashboardStats = useMemo(() => ({
    totalTasks: ideas.current.length,
    completedTasks: ideas.current.filter(idea => idea.completed).length,
    completedToday: ideas.current.filter(idea => {
      if (!idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedDate = new Date(idea.completedAt || idea.entryDate);
      return completedDate >= today;
    }).length,
    pendingTasks: ideas.current.filter(idea => !idea.completed).length,
    overdueTasks: ideas.current.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      return dueDate < today;
    }).length,
    tasksDueToday: ideas.current.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      return dueDay.getTime() === today.getTime();
    }).length,
    shoppingItems: ideas.current.filter(idea => 
      !idea.completed && idea.tags?.includes('shopping')
    ).length,
    urgentTasks: ideas.current.filter(idea => 
      !idea.completed && idea.tags?.includes('urgent')
    ).length
  }), [ideas]);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">{greeting}, {user?.name || 'User'}</h1>
        
        {/* Task Statistics - Compact Row */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
            <Link 
              to="/dashboard/ideas"
              className="bg-purple-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 mb-1">
                <FontAwesomeIcon icon={faChartLine} className="text-purple-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-xl font-bold text-gray-900">{dashboardStats.totalTasks}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-green-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Done</span>
              <span className="text-xl font-bold text-green-600">{dashboardStats.completedTasks}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-blue-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-blue-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Pending</span>
              <span className="text-xl font-bold text-blue-600">{dashboardStats.pendingTasks}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-red-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mb-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Overdue</span>
              <span className="text-xl font-bold text-red-600">{dashboardStats.overdueTasks}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-yellow-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 mb-1">
                <FontAwesomeIcon icon={faCalendarDay} className="text-yellow-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Today</span>
              <span className="text-xl font-bold text-yellow-600">{dashboardStats.tasksDueToday}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-green-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-1">
                <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Shopping</span>
              <span className="text-xl font-bold text-green-600">{dashboardStats.shoppingItems}</span>
            </Link>
            
            <Link 
              to="/dashboard/ideas"
              className="bg-red-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mb-1">
                <FontAwesomeIcon icon={faLayerGroup} className="text-red-600 h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500">Urgent</span>
              <span className="text-xl font-bold text-red-600">{dashboardStats.urgentTasks}</span>
            </Link>
          </div>
        </div>

        {/* Due Today Notice - if tasks are due today */}
        {dashboardStats.tasksDueToday > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarDay} className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-yellow-700">
                You have <span className="font-medium">{dashboardStats.tasksDueToday} task{dashboardStats.tasksDueToday !== 1 ? 's' : ''}</span> due today.
                <Link 
                  to="/dashboard/ideas" 
                  className="ml-2 text-yellow-800 underline"
                >View all tasks</Link>
              </p>
            </div>
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="fixed bottom-6 right-6 flex gap-2">
          <Link 
            to="/dashboard/ideas?new=true"
            className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600"
            title="Add New Task"
          >
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
