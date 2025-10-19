import { useEffect } from 'react';
import { useUser } from '../lib/context/user';
import { useTasks } from '../lib/context/tasks';
import { QuickAddTask } from '../components/QuickAddTask';
import { useNavigate } from 'react-router-dom';

export function Tasks() {
  const user = useUser();
  const tasks = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.current) {
      navigate('/login');
    }
  }, [navigate, user.current]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Tasks</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1">Manage your daily tasks</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Add Task */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <QuickAddTask />
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Your Tasks</h2>
            </div>
            
            <div className="p-6">
              {tasks.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                </div>
              ) : tasks.tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">No tasks yet</h3>
                  <p className="text-slate-500">Add your first task using the quick add above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.tasks.map((task) => (
                    <div
                      key={task.$id}
                      className="bg-slate-50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => tasks.update(task.$id, { completed: !task.completed })}
                          className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                        />
                        <div>
                          <h3 
                            className={`text-lg font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'} truncate`}
                            title={task.title}
                          >
                            {task.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => tasks.remove(task.$id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 