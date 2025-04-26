import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from './user';
import { databases, ID, Query } from '../appwrite';
import toast from 'react-hot-toast';

// Constants for database and collection IDs
const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID_INVITEES || 'invitees';

if (!DATABASE_ID) {
  console.warn("REACT_APP_DATABASE_ID is not defined in environment variables");
}

// Create the context
const InviteesContext = createContext();

// Custom hook to use the invitees context
export function useInvitees() {
  const context = useContext(InviteesContext);
  if (!context) {
    throw new Error('useInvitees must be used within an InviteesProvider');
  }
  return context;
}

// Provider component
export function InviteesProvider({ children }) {
  // Keep user for future functionality, but mark it as intentionally unused
  // eslint-disable-next-line no-unused-vars
  const { current: user } = useUser();
  const [invitees, setInvitees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and fetch all invitees
  const init = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all invitees with a high limit
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.limit(1000)], // Set a high limit to get all records
        undefined, // offset
        undefined, // cursor
        undefined, // cursorDirection
        ['name'] // orderBy
      );
      
      console.log('Total invitees fetched:', response.documents.length);
      console.log('First few invitees:', response.documents.slice(0, 5));
      
      // Sort invitees by name
      const sortedInvitees = response.documents.sort((a, b) => a.name.localeCompare(b.name));
      console.log('Sorted invitees count:', sortedInvitees.length);
      
      setInvitees(sortedInvitees);
    } catch (error) {
      console.error('Error fetching invitees:', error);
      toast.error('Failed to load invitees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new invitee
  const add = async (data) => {
    try {
      const inviteeData = {
        name: data.name,
        group: data.group || 'friends',
        reminder1: data.reminder1 || false,
        reminder2: data.reminder2 || false,
        status: data.status || 'pending',
        createdAt: new Date().toISOString()
      };

      const newInvitee = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        inviteeData
      );
      setInvitees(prev => [...prev, newInvitee].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    } catch (error) {
      console.error('Error adding invitee:', error);
      toast.error('Failed to add invitee');
      return false;
    }
  };

  // Update an existing invitee
  const update = async (inviteeId, data) => {
    try {
      const updatedInvitee = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        inviteeId,
        data
      );
      setInvitees(prev => 
        prev.map(item => item.$id === inviteeId ? updatedInvitee : item)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return true;
    } catch (error) {
      console.error('Error updating invitee:', error);
      toast.error('Failed to update invitee');
      return false;
    }
  };

  // Update invitee status
  const updateStatus = async (inviteeId, status) => {
    return update(inviteeId, { status });
  };

  // Remove an invitee
  const remove = async (inviteeId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        inviteeId
      );
      setInvitees(prev => prev.filter(item => item.$id !== inviteeId));
      return true;
    } catch (error) {
      console.error('Error removing invitee:', error);
      toast.error('Failed to remove invitee');
      return false;
    }
  };

  // The value that will be provided to consumers of this context
  const value = {
    invitees,
    isLoading,
    init,
    add,
    update,
    updateStatus,
    remove
  };

  return (
    <InviteesContext.Provider value={value}>
      {children}
    </InviteesContext.Provider>
  );
} 