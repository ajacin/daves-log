import { createContext, useContext, useState, useCallback } from "react";
import { databases } from "../appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID_ACTIVITY_LOG;

const ActivityLogContext = createContext();

export function useActivityLog() {
  return useContext(ActivityLogContext);
}

const PAGE_SIZE = 25;

export function ActivityLogProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);

  const buildQueries = useCallback((filters) => {
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_SIZE),
    ];

    if (filters?.action && filters.action !== 'all') {
      queries.push(Query.equal("action", [filters.action]));
    }

    if (filters?.dateFrom) {
      queries.push(Query.greaterThanEqual("$createdAt", new Date(filters.dateFrom).toISOString()));
    }

    if (filters?.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      queries.push(Query.lessThanEqual("$createdAt", endOfDay.toISOString()));
    }

    return queries;
  }, []);

  const init = useCallback(async (filters = {}) => {
    if (!COLLECTION_ID) return;
    try {
      setIsLoading(true);
      setError(null);

      // Default to last 7 days if no date range provided
      if (!filters.dateFrom && !filters.dateTo) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        filters = { ...filters, dateFrom: sevenDaysAgo.toISOString() };
      }

      const queries = buildQueries(filters);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);

      if (response?.documents) {
        setEntries(response.documents);
        setHasMore(response.documents.length === PAGE_SIZE);
        setLastId(response.documents.length > 0 ? response.documents[response.documents.length - 1].$id : null);
      } else {
        setEntries([]);
        setHasMore(false);
        setLastId(null);
      }
    } catch (err) {
      console.error("Activity log load error:", err);
      setError(err.message);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueries]);

  const loadMore = useCallback(async (filters = {}) => {
    if (!COLLECTION_ID || !lastId || !hasMore) return;
    try {
      setIsLoading(true);

      // Reapply default date range
      if (!filters.dateFrom && !filters.dateTo) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        filters = { ...filters, dateFrom: sevenDaysAgo.toISOString() };
      }

      const queries = buildQueries(filters);
      queries.push(Query.cursorAfter(lastId));

      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);

      if (response?.documents) {
        setEntries((prev) => [...prev, ...response.documents]);
        setHasMore(response.documents.length === PAGE_SIZE);
        setLastId(response.documents.length > 0 ? response.documents[response.documents.length - 1].$id : null);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Activity log load more error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [lastId, hasMore, buildQueries]);

  return (
    <ActivityLogContext.Provider
      value={{
        entries,
        isLoading,
        error,
        hasMore,
        init,
        loadMore,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
}
