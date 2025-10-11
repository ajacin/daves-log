import React, { useState, useEffect, useMemo } from 'react';
import { useInvitees } from '../lib/context/invitees';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencilAlt,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faUsers,
  faFileImport
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-hot-toast';

// Group options
const GROUP_OPTIONS = ['friends', 'sangham', 'school', 'plus two', 'other'];

export function Invitees() {
  const { invitees, isLoading, init, add, update, updateStatus, remove } = useInvitees();
  const [activeGroup, setActiveGroup] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentInvitee, setCurrentInvitee] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    group: 'friends',
    reminder1: false,
    reminder2: false,
    status: 'pending'
  });

  // Initialize invitees
  useEffect(() => {
    init();
  }, [init]);

  // Filter invitees by selected group
  const filteredInvitees = useMemo(() => {
    if (activeGroup === 'all') {
      return invitees;
    }
    return invitees.filter(invitee => invitee.group === activeGroup);
  }, [invitees, activeGroup]);

  // Count invitees by group
  const groupCounts = useMemo(() => {
    const counts = { all: invitees.length };
    GROUP_OPTIONS.forEach(group => {
      counts[group] = invitees.filter(invitee => invitee.group === group).length;
    });
    return counts;
  }, [invitees]);

  // Handle group change
  const handleGroupChange = (group) => {
    setActiveGroup(group);
  };

  // Handle modal operations
  const handleOpenModal = (invitee = null) => {
    if (invitee) {
      setFormData({
        name: invitee.name,
        group: invitee.group || 'friends',
        reminder1: invitee.reminder1 || false,
        reminder2: invitee.reminder2 || false,
        status: invitee.status
      });
      setCurrentInvitee(invitee);
      setEditMode(true);
    } else {
      setFormData({
        name: '',
        group: 'friends',
        reminder1: false,
        reminder2: false,
        status: 'pending'
      });
      setCurrentInvitee(null);
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle bulk import
  const handleOpenBulkModal = () => {
    setBulkData('');
    setShowBulkModal(true);
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
  };

  const handleBulkDataChange = (e) => {
    setBulkData(e.target.value);
  };

  // Handle form operations
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await update(currentInvitee.$id, formData);
        toast.success('Invitee updated successfully!');
      } else {
        await add(formData);
        toast.success('Invitee added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save invitee');
      console.error('Error saving invitee:', error);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!bulkData.trim()) {
      toast.error('Please enter some data to import');
      return;
    }
    
    setIsBulkLoading(true);
    
    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      const selectedGroup = document.getElementById('bulkGroup').value;
      
      const results = { success: 0, failed: 0 };
      
      for (const line of lines) {
        try {
          const name = line.trim();
          if (!name) continue;
          
          await add({
            name,
            group: selectedGroup,
            reminder1: false,
            reminder2: false,
            status: 'pending'
          });
          
          results.success++;
        } catch (err) {
          console.error(`Error adding invitee: ${line}`, err);
          results.failed++;
        }
      }
      
      if (results.failed > 0) {
        toast.success(`Added ${results.success} invitees with ${results.failed} failures`);
      } else {
        toast.success(`Successfully added ${results.success} invitees`);
      }
      
      handleCloseBulkModal();
      init();
    } catch (error) {
      toast.error('Failed to process bulk import');
      console.error('Error importing invitees:', error);
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Handle status and reminder operations
  const handleStatusChange = async (inviteeId, newStatus) => {
    try {
      await updateStatus(inviteeId, newStatus);
      toast.success(`Invitee status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleToggleReminder = async (invitee, reminderType) => {
    try {
      const currentValue = invitee[reminderType] || false;
      const updates = {
        [reminderType]: !currentValue
      };
      
      await update(invitee.$id, updates);
      toast.success(`${reminderType === 'reminder1' ? 'Reminder 1' : 'Reminder 2'} ${!currentValue ? 'marked as sent' : 'unmarked'}`);
    } catch (error) {
      toast.error('Failed to update reminder status');
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (inviteeId) => {
    setDeleteModalOpen(true);
    setDeleteId(inviteeId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await remove(deleteId);
        toast.success('Invitee removed successfully');
      } catch (error) {
        toast.error('Failed to remove invitee');
        console.error('Error removing invitee:', error);
      }
    }
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  // Helper functions for UI
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Confirmed</span>;
      case 'declined':
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">Declined</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full">Pending</span>;
    }
  };

  const getGroupBadge = (group) => {
    const colorMap = {
      friends: 'bg-blue-500',
      sangham: 'bg-purple-500',
      school: 'bg-green-500',
      'plus two': 'bg-pink-500',
      other: 'bg-gray-500'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold text-white ${colorMap[group] || 'bg-gray-500'} rounded-full`}>
        <FontAwesomeIcon icon={faUsers} className="mr-1" />
        {group || 'other'}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Invitees</h1>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center" 
            onClick={handleOpenBulkModal}
          >
            <FontAwesomeIcon icon={faFileImport} className="mr-2" /> Bulk Import
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center" 
            onClick={() => handleOpenModal()}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Invitee
          </button>
        </div>
      </div>

      {/* Group filter tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex">
          <li className="mr-2">
            <button
              onClick={() => handleGroupChange('all')}
              className={`inline-flex items-center px-4 py-2 border-b-2 rounded-t-lg ${
                activeGroup === 'all'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              All
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {groupCounts.all}
              </span>
            </button>
          </li>
          {GROUP_OPTIONS.map(group => (
            <li className="mr-2" key={group}>
              <button
                onClick={() => handleGroupChange(group)}
                className={`inline-flex items-center px-4 py-2 border-b-2 rounded-t-lg ${
                  activeGroup === group
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                {group.charAt(0).toUpperCase() + group.slice(1)}
                <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {groupCounts[group]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center my-10">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-purple-600" />
        </div>
      ) : filteredInvitees.length === 0 ? (
        <div className="text-center my-10">
          <p className="text-gray-500">
            {activeGroup === 'all' 
              ? 'No invitees found. Add your first invitee!' 
              : `No invitees found in the "${activeGroup}" group.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder 1
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder 2
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvitees.map((invitee) => (
                <tr key={invitee.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{invitee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getGroupBadge(invitee.group)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invitee.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invitee.reminder1 || false}
                        onChange={() => handleToggleReminder(invitee, 'reminder1')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {invitee.reminder1 ? 'Sent' : 'Not sent'}
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invitee.reminder2 || false}
                        onChange={() => handleToggleReminder(invitee, 'reminder2')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {invitee.reminder2 ? 'Sent' : 'Not sent'}
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className={`px-2 py-1 rounded text-xs border flex items-center ${
                          invitee.status === 'confirmed' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                            : 'bg-white text-green-600 hover:bg-green-50 border-green-300'
                        }`}
                        onClick={() => handleStatusChange(invitee.$id, 'confirmed')}
                        disabled={invitee.status === 'confirmed'}
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1" /> Confirm
                      </button>
                      <button 
                        className={`px-2 py-1 rounded text-xs border flex items-center ${
                          invitee.status === 'declined' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                            : 'bg-white text-red-600 hover:bg-red-50 border-red-300'
                        }`}
                        onClick={() => handleStatusChange(invitee.$id, 'declined')}
                        disabled={invitee.status === 'declined'}
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" /> Decline
                      </button>
                      <button 
                        className="px-2 py-1 rounded text-xs bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 flex items-center"
                        onClick={() => handleOpenModal(invitee)}
                      >
                        <FontAwesomeIcon icon={faPencilAlt} className="mr-1" /> Edit
                      </button>
                      <button 
                        className="px-2 py-1 rounded text-xs bg-white text-red-600 hover:bg-red-50 border border-red-300 flex items-center"
                        onClick={() => handleDelete(invitee.$id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Invitee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editMode ? 'Edit Invitee' : 'Add New Invitee'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {GROUP_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="reminder1"
                    name="reminder1"
                    checked={formData.reminder1}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="reminder1" className="ml-2 block text-sm text-gray-700">
                    Reminder 1 Sent
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reminder2"
                    name="reminder2"
                    checked={formData.reminder2}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="reminder2" className="ml-2 block text-sm text-gray-700">
                    Reminder 2 Sent
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {editMode ? 'Update' : 'Add'} Invitee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Bulk Import Invitees
              </h3>
              <button
                onClick={handleCloseBulkModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleBulkSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Group for all imported invitees</label>
                <select
                  id="bulkGroup"
                  name="bulkGroup"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {GROUP_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitee Names (one per line)
                </label>
                <textarea
                  value={bulkData}
                  onChange={handleBulkDataChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows="10"
                  placeholder="John Doe&#10;Jane Smith&#10;Alice Johnson"
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Add one name per line. All invitees will be added to the selected group with 'Pending' status.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={handleCloseBulkModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  disabled={isBulkLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  disabled={isBulkLoading}
                >
                  {isBulkLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> 
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFileImport} className="mr-2" /> 
                      Import Invitees
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Invitee"
        message="Are you sure you want to delete this invitee? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
} 