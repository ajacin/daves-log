import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { useUser } from "./user";

const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
const COLLECTION_ID = "67c546700031843e4f23";

if (!DATABASE_ID) {
  throw new Error("REACT_APP_DATABASE_ID is not defined in environment variables");
}

const AutomationsContext = createContext();

export function useAutomations() {
  return useContext(AutomationsContext);
}

export function AutomationsProvider({ children }) {
  const [automations, setAutomations] = useState([]);
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
      console.log("No user found, skipping initialization");
      setAutomations([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      console.log("Starting initialization...");
      setIsLoading(true);
      setError(null);
      
      // Try to list documents directly
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc("$createdAt"),
      ]);

      console.log("Documents fetched successfully:", response?.documents?.length || 0);
      setHasPermission(true);
      if (response?.documents) {
        setAutomations(response.documents);
      } else {
        setAutomations([]);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      handleError(error);
      setAutomations([]);
    } finally {
      setIsLoading(false);
      console.log("Initialization complete");
    }
  }, [user, handleError]);

  const add = useCallback(async (automation) => {
    if (!hasPermission) return false;
    try {
      const automationWithDefaults = {
        ...automation,
        name: automation.name || "",
        url: automation.url || "",
        icon: automation.icon || "fa-lightbulb",
        category: automation.category || "bulb",
        room: automation.room || "",
        createdAt: new Date().toISOString(),
      };

      console.log("Adding automation:", automationWithDefaults);
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        automationWithDefaults
      );

      if (response && response.$id) {
        console.log("Automation added successfully:", response.$id);
        setAutomations((prev) => [response, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Add automation error:", error);
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  const remove = useCallback(async (id) => {
    if (!hasPermission) return false;
    try {
      console.log("Removing automation:", id);
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setAutomations((prev) => prev.filter((automation) => automation.$id !== id));
      return true;
    } catch (error) {
      console.error("Remove automation error:", error);
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  const update = useCallback(async (id, updates) => {
    if (!hasPermission) return false;
    try {
      console.log("Updating automation:", id, updates);
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        updates
      );
      setAutomations((prev) =>
        prev.map((automation) => (automation.$id === id ? response : automation))
      );
      return true;
    } catch (error) {
      console.error("Update automation error:", error);
      handleError(error);
      return false;
    }
  }, [hasPermission, handleError]);

  useEffect(() => {
    console.log("AutomationsProvider mounted, user:", user?.$id);
    init();
  }, [init,user?.$id]);

  return (
    <AutomationsContext.Provider
      value={{
        current: automations,
        add,
        remove,
        update,
        init,
        isLoading,
        error,
        hasPermission,
        retry: init,
      }}
    >
      {children}
    </AutomationsContext.Provider>
  );
} 