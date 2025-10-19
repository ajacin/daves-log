import { useState } from 'react';
import { useTasks } from '../lib/context/tasks';
import toast from 'react-hot-toast';

export function QuickAddTask() {
  const [taskText, setTaskText] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('today');
  const tasks = useTasks();

  const getNextFriday = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 5 = Friday
    let daysUntilFriday = 5 - currentDay
    
    // If today is Friday or after, get next Friday
    if (daysUntilFriday <= 0) {
      daysUntilFriday += 7
    }
    
    const nextFriday = new Date(today)
    nextFriday.setDate(today.getDate() + daysUntilFriday)
    nextFriday.setHours(18, 0, 0, 0) // 6:00 PM
    return nextFriday
  }

  const getDueDate = () => {
    const now = new Date()
    
    switch (selectedDueDate) {
      case 'today':
        now.setHours(23, 59, 59, 999)
        return now
      
      case 'tomorrow':
        now.setDate(now.getDate() + 1)
        now.setHours(23, 59, 59, 999)
        return now
      
      case 'weekend':
        return getNextFriday()
      
      case 'nextWeek':
        now.setDate(now.getDate() + 7)
        now.setHours(23, 59, 59, 999)
        return now
      
      default:
        now.setHours(23, 59, 59, 999)
        return now
    }
  }

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && taskText.trim()) {
      await addTask()
    }
  };

  const addTask = async () => {
    if (!taskText.trim()) return

    try {
      const dueDate = getDueDate()
      
      const taskData = {
        title: taskText.trim(),
        dueDate: dueDate.toISOString(),
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

  const dueDateOptions = [
    { id: 'today', label: 'Today', emoji: '📅' },
    { id: 'tomorrow', label: 'Tomorrow', emoji: '📆' },
    { id: 'weekend', label: 'This Weekend', emoji: '🎉' },
    { id: 'nextWeek', label: 'Next Week', emoji: '📍' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What needs to be done?
        </label>
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter task and press Enter..."
          className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          When is it due?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dueDateOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedDueDate(option.id)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                selectedDueDate === option.id
                  ? 'bg-emerald-500 text-white shadow-md transform scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addTask}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!taskText.trim()}
      >
        Add Task
      </button>
    </div>
  );
} 