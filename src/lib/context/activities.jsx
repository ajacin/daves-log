import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { useUser } from "./user";
// import * as dotenv from 'dotenv';
// dotenv.config()

export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID; // Replace with your database ID
export const COLLECTION_ID =
  process.env.REACT_APP_COLLECTION_ID_BABY_ACTIVITIES; // Replace with your collection ID

const BabyActivitiesContext = createContext();

export function useBabyActivities() {
  return useContext(BabyActivitiesContext);
}

export function BabyActivitiesProvider({ children }) {
  const [babyActivities, setBabyActivities] = useState([]);
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
      setBabyActivities([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.orderDesc("$createdAt"),
          Query.greaterThan("$createdAt", twentyFourHoursAgo.toISOString()),
        ]
      );

      setHasPermission(true);
      if (response?.documents) {
        setBabyActivities(response.documents);
      } else {
        setBabyActivities([]);
      }
    } catch (error) {
      handleError(error);
      setBabyActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  const add = useCallback(
    async (item, onSuccessAdd) => {
      if (!hasPermission) return false;
      try {
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          item
        );

        if (response && response.$id) {
          setBabyActivities((prev) => [response, ...prev].slice(0, 10));
          await init();
          
          // Add slight delay to ensure cleanup of loading toast
          setTimeout(() => {
            onSuccessAdd?.(item.activityName);
          }, 50);
          
          return true;
        }
        return false;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [hasPermission, handleError, init]
  );

  const remove = useCallback(
    async (id) => {
      if (!hasPermission) return false;
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        setBabyActivities((prev) => prev.filter((item) => item.$id !== id));
        await init();
        return true;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [hasPermission, handleError, init]
  );

  const getNActivitiesLastXHours = useCallback(
    async (activityName, hours = 1, count = 1) => {
      if (!hasPermission) return [];
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.orderDesc("$createdAt"),
            Query.limit(count),
            Query.greaterThan("$createdAt", oneHourAgo.toISOString()),
            Query.equal("activityName", [activityName]),
          ]
        );
        return response?.documents ?? [];
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [hasPermission, handleError]
  );

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BabyActivitiesContext.Provider
      value={{
        current: babyActivities,
        add,
        remove,
        getNActivitiesLastXHours,
        isLoading,
        error,
        hasPermission,
        retry: init,
      }}
    >
      {children}
    </BabyActivitiesContext.Provider>
  );
}
