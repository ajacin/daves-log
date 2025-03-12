import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc("$createdAt"),
      ]);

      setHasPermission(true);
      if (response?.documents) {
        setIdeas(response.documents);
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
        dueDate: idea.dueDate || null
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

  const toggleComplete = useCallback(async (id) => {
    if (!hasPermission) return false;
    try {
      const idea = ideas.find((i) => i.$id === id);
      if (idea) {
        return await update(id, { completed: !idea.completed });
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
