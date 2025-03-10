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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
      </div>

      {/* Quick Add Task */}
      <QuickAddTask />

      {/* Tasks List */}
      <div className="mt-8">
        {tasks.isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : tasks.tasks.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
            <p className="text-gray-500">Add your first task using the quick add above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.tasks.map((task) => (
              <div
                key={task.$id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => tasks.update(task.$id, { completed: !task.completed })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => tasks.remove(task.$id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 