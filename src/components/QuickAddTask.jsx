import { useState } from 'react';
import { useTasks } from '../lib/context/tasks';
import toast from 'react-hot-toast';

export function QuickAddTask() {
  const [taskText, setTaskText] = useState('');
  const tasks = useTasks();

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && taskText.trim()) {
      try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const taskData = {
          title: taskText.trim(),
          dueDate: today.toISOString(),
          tags: ['quick'],
          completed: false,
          createdAt: new Date().toISOString()
        };

        const success = await tasks.add(taskData);
        if (success) {
          toast.success('Task added successfully');
          setTaskText('');
        } else {
          toast.error('Failed to add task');
        }
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Failed to add task');
      }
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Quick add a task (press Enter)"
        className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
} 