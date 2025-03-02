import { createContext, useContext, useEffect, useState } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";

export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID; // Replace with your database ID
export const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID_IDEAS_TRACKER;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider(props) {
  const [ideas, setIdeas] = useState([]);

  async function add(idea) {
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
    setIdeas((ideas) => [response.$id, ...ideas].slice(0, 10));
    init();
  }

  async function remove(id) {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    setIdeas((ideas) => ideas.filter((idea) => idea.$id !== id));
    await init(); // Refetch ideas to ensure we have 10 items
  }

  async function update(id, updates) {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      updates
    );
    setIdeas((ideas) =>
      ideas.map((idea) => (idea.$id === id ? response : idea))
    );
    await init();
  }

  async function toggleComplete(id) {
    const idea = ideas.find((i) => i.$id === id);
    if (idea) {
      await update(id, { completed: !idea.completed });
    }
  }

  async function init() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      // Query.limit(10),
    ]);
    setIdeas(response.documents);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <IdeasContext.Provider value={{ current: ideas, add, remove, update, toggleComplete, init }}>
      {props.children}
    </IdeasContext.Provider>
  );
}
