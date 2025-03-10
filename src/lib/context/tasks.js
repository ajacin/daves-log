import { createContext, useContext, useState, useEffect } from 'react';
import { databases } from '../appwrite';
import { ID } from 'appwrite';

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const init = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await databases.listDocuments('tasks');
      setTasks(response.documents || []);
    } catch (err) {
      console.error('Error initializing tasks:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const add = async (taskData) => {
    try {
      const response = await databases.createDocument(
        'tasks',
        ID.unique(),
        taskData
      );
      setTasks(prev => [...prev, response]);
      return true;
    } catch (err) {
      console.error('Error adding task:', err);
      return false;
    }
  };

  const update = async (taskId, taskData) => {
    try {
      const response = await databases.updateDocument(
        'tasks',
        taskId,
        taskData
      );
      setTasks(prev => prev.map(task => 
        task.$id === taskId ? response : task
      ));
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      return false;
    }
  };

  const remove = async (taskId) => {
    try {
      await databases.deleteDocument('tasks', taskId);
      setTasks(prev => prev.filter(task => task.$id !== taskId));
      return true;
    } catch (err) {
      console.error('Error removing task:', err);
      return false;
    }
  };

  useEffect(() => {
    init();
  }, []);

  const value = {
    current: tasks,
    isLoading,
    error,
    add,
    update,
    remove,
    init
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
} 