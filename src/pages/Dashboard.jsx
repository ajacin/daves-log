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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">{greeting}, {user?.name || 'User'}</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1">Here's your dashboard overview</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Task Statistics */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Task Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/dashboard/ideas"
                className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-2">
                  <FontAwesomeIcon icon={faChartLine} className="text-slate-600 h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-xl font-bold text-slate-800">{dashboardStats.totalTasks}</span>
              </Link>
              
              <Link 
                to="/dashboard/ideas"
                className="bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-2">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">Done</span>
                <span className="text-xl font-bold text-emerald-600">{dashboardStats.completedTasks}</span>
              </Link>
              
              <Link 
                to="/dashboard/ideas"
                className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
                  <FontAwesomeIcon icon={faClock} className="text-blue-600 h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">Pending</span>
                <span className="text-xl font-bold text-blue-600">{dashboardStats.pendingTasks}</span>
              </Link>
              
              <Link 
                to="/dashboard/ideas"
                className="bg-red-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-red-100 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mb-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">Overdue</span>
                <span className="text-xl font-bold text-red-600">{dashboardStats.overdueTasks}</span>
              </Link>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-amber-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Due Today</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboardStats.tasksDueToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Shopping Items</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboardStats.shoppingItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-red-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Urgent Tasks</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboardStats.urgentTasks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Due Today Notice */}
          {dashboardStats.tasksDueToday > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faCalendarDay} className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-amber-700">
                  You have <span className="font-medium">{dashboardStats.tasksDueToday} task{dashboardStats.tasksDueToday !== 1 ? 's' : ''}</span> due today.
                  <Link 
                    to="/dashboard/ideas" 
                    className="ml-2 text-amber-800 underline hover:text-amber-900"
                  >View all tasks</Link>
                </p>
              </div>
            </div>
          )}

          {/* Quick Add Button */}
          <div className="fixed bottom-6 right-6">
            <Link 
              to="/dashboard/ideas?new=true"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              title="Add New Task"
            >
              <FontAwesomeIcon icon={faPlus} className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
