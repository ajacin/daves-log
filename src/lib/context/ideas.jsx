import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { useUser } from "./user";

export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID; // Replace with your database ID
export const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID_IDEAS_TRACKER;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider(props) {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);
  const { current: user } = useUser();

  // To avoid circular dependencies, declare this function first but define it later
  const createNextRecurringTaskRef = useRef(null);

  const handleError = useCallback((error) => {
    console.error("Operation error:", error);
    if (
      error.code === 403 ||
      error.message?.toLowerCase().includes("permission denied") ||
      error.message?.toLowerCase().includes("not authorized")
    ) {
      setHasPermission(false);
      setError(null);
    } else {
      setError(error.message);
    }
  }, []);

  const init = useCallback(async () => {
    if (!user) {
      setIdeas([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Use a large limit to fetch all tasks at once
      // Instead of filtering by completedAt which might not exist in schema,
      // fetch all tasks and filter in memory
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      
      setHasPermission(true);
      
      if (response?.documents) {
        // Client-side filtering for tasks:
        // 1. All incomplete tasks
        // 2. Only completed tasks from today
        const allTasks = response.documents;
        
        const filteredTasks = allTasks.filter(task => {
          // Include all incomplete tasks
          if (!task.completed) return true;
          
          // For completed tasks, check if they were completed today
          // First check if completedAt exists, if not use $updatedAt as fallback
          const completionDate = task.completedAt 
            ? new Date(task.completedAt) 
            : new Date(task.$updatedAt);
          
          return completionDate >= today;
        });
        
        // Sort the filtered tasks by creation date
        const sortedTasks = filteredTasks.sort(
          (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        
        setIdeas(sortedTasks);
      } else {
        setIdeas([]);
      }
    } catch (error) {
      handleError(error);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  const add = useCallback(async (idea) => {
    if (!hasPermission) return false;
    try {
      // Ensure tags is an array and completed has a default value
      const ideaWithDefaults = {
        ...idea,
        tags: idea.tags || [],
        completed: idea.completed || false,
        dueDate: idea.dueDate || null,
        recurrence: idea.recurrence || null
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        ideaWithDefaults
      );

      if (response && response.$id) {
        setIdeas((prev) => [response, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  const remove = useCallback(async (id) => {
    if (!hasPermission) return false;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setIdeas((prev) => prev.filter((idea) => idea.$id !== id));
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  const update = useCallback(async (id, updates) => {
    if (!hasPermission) return false;
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        updates
      );
      setIdeas((prev) =>
        prev.map((idea) => (idea.$id === id ? response : idea))
      );
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  // Define the createNextRecurringTask function
  createNextRecurringTaskRef.current = async (completedTask, completionDate) => {
    try {
      const completionDateTime = new Date(completionDate);
      let nextDueDate = null;
      
      // Check if this is a birthday or anniversary task
      const isBirthdayTask = completedTask.tags?.includes('birthday') || 
                           completedTask.title?.toLowerCase().includes('birthday') ||
                           completedTask.tags?.includes('anniversary') ||
                           completedTask.title?.toLowerCase().includes('anniversary');
      
      // Check if this is a date-sensitive task (should maintain original date)
      const isDateSensitiveTask = isBirthdayTask || 
                                completedTask.tags?.includes('bills') ||
                                completedTask.tags?.includes('rent') ||
                                completedTask.tags?.includes('mortgage') ||
                                completedTask.title?.toLowerCase().includes('rent') ||
                                completedTask.title?.toLowerCase().includes('mortgage') ||
                                completedTask.title?.toLowerCase().includes('bill') ||
                                completedTask.title?.toLowerCase().includes('payment') ||
                                completedTask.title?.toLowerCase().includes('due');
      
      // For date-sensitive tasks, use original due date to maintain exact recurring dates
      // For other tasks, use completion date to allow flexible scheduling
      const baseDate = (isDateSensitiveTask && completedTask.dueDate) 
        ? new Date(completedTask.dueDate) 
        : completionDateTime;
      
      if (isDateSensitiveTask && completedTask.dueDate) {
        const taskType = isBirthdayTask ? '🎂 Birthday/Anniversary' : '📅 Date-sensitive';
        console.log(`${taskType} task detected: "${completedTask.title}" - using original date for next occurrence`);
      }
      
      // Calculate the next due date based on recurrence pattern
      switch (completedTask.recurrence) {
        case 'daily':
          nextDueDate = new Date(completionDateTime); // Always use completion date for daily
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate = new Date(completionDateTime); // Always use completion date for weekly
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDueDate = new Date(completionDateTime); // Always use completion date for biweekly
          nextDueDate.setDate(nextDueDate.getDate() + 14);
          break;
        case 'monthly':
          nextDueDate = new Date(baseDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          
          // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
          if (baseDate.getDate() > 28) {
            const lastDayOfMonth = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate();
            if (baseDate.getDate() > lastDayOfMonth) {
              nextDueDate.setDate(lastDayOfMonth);
            }
          }
          break;
        case 'quarterly':
          nextDueDate = new Date(baseDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDueDate = new Date(baseDate);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          
          // Handle leap year edge case (Feb 29 -> Feb 28 in non-leap years)
          if (baseDate.getMonth() === 1 && baseDate.getDate() === 29) {
            // If original date was Feb 29 and next year is not a leap year
            if (nextDueDate.getMonth() !== 1) {
              nextDueDate.setMonth(1, 28); // Set to Feb 28
            }
          }
          break;
        default:
          return; // No valid recurrence pattern
      }
      
      // Create a new task with the same details but a new due date
      const existingTags = completedTask.tags || [];
      const tagsWithRecurring = existingTags.includes('recurring') 
        ? existingTags 
        : [...existingTags, 'recurring'];
        
      const newTask = {
        userId: completedTask.userId,
        userName: completedTask.userName,
        title: completedTask.title,
        description: completedTask.description || "",
        entryDate: new Date().toISOString(),
        tags: tagsWithRecurring,
        dueDate: nextDueDate.toISOString(),
        completed: false,
        recurrence: completedTask.recurrence,
        parentTaskId: completedTask.$id // Reference to the original task
      };
      
      await add(newTask);
      
    } catch (error) {
      console.error("Error creating recurring task:", error);
    }
  };

  const toggleComplete = useCallback(async (id) => {
    if (!hasPermission) return false;
    try {
      const idea = ideas.find((i) => i.$id === id);
      if (idea) {
        // Store completion date to use for recurring task
        const now = new Date();
        const completedAt = now.toISOString();
        
        // Update the completed status and completedAt timestamp
        const updates = {
          completed: !idea.completed,
          completedAt: !idea.completed ? completedAt : null
        };
        
        const success = await update(id, updates);
        
        // If task was marked as complete and has recurrence pattern, create the next instance
        if (success && !idea.completed && idea.recurrence && createNextRecurringTaskRef.current) {
          await createNextRecurringTaskRef.current(idea, completedAt);
        }
        
        return success;
      }
      return false;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [ideas, update, hasPermission, handleError]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <IdeasContext.Provider 
      value={{ 
        current: ideas, 
        add, 
        remove, 
        update, 
        toggleComplete, 
        init,
        isLoading,
        error,
        hasPermission,
        retry: init
      }}
    >
      {props.children}
    </IdeasContext.Provider>
  );
}
