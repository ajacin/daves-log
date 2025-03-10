import { useEffect, useState, useRef } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faTrash,
  faPlus,
  faClock,
  faCalendarAlt,
  faCircleCheck,
  faCircleXmark,
  faFilter,
  faUser,
  faEye,
  faEyeSlash,
  faListUl,
  faThLarge,
  faUserClock,
  faCalendarDay,
  faExclamationTriangle,
  faCalendarWeek,
  faChartLine,
  faPencilAlt,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import React from "react";

const PREDEFINED_TAGS = [
  // Shopping & Errands
  "walmart",
  "costco",
  "dollarama",
  "shopping",
  "foodco",
  "groceries",
  "pharmacy",
  "errands",

  // Home & Family
  "home",
  "cleaning",
  "laundry",
  "cooking",
  "meal-prep",
  "repairs",
  "garden",
  "family",
  "kids",
  "pets",

  // Work & Education
  "school",
  "work",
  "study",
  "meeting",
  "deadline",
  "project",
  "homework",
  "research",

  // Health & Wellness
  "health",
  "exercise",
  "doctor",
  "dentist",
  "medication",
  "appointment",

  // Personal
  "personal",
  "birthday",
  "social",
  "calls",
  "email",
  "bills",
  "finance",
  "important",
  "urgent"
];

function TruncatedDescription({ text, maxLength = 150, isMinimal = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  
  // Function to make URLs clickable
  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const truncatedText = isExpanded ? text : text.slice(0, maxLength);
  
  return (
    <div className="mt-2">
      <div className={`relative ${!isExpanded ? 'max-h-[4.5em] overflow-hidden' : ''}`}>
        <div className={`text-gray-600 break-words ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {renderTextWithLinks(truncatedText)}
          {!isExpanded && shouldTruncate && '...'}
        </div>
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="mt-1 text-blue-500 hover:text-blue-600 focus:outline-none text-sm font-medium"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function Ideas() {
  const user = useUser();
  const ideas = useIdeas();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isMinimalView, setIsMinimalView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editDueDate, setEditDueDate] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!user.current) {
      navigate("/login");
      return;
    }

    const initialize = async () => {
      if (!initRef.current && !ideas.initialized) {
        setIsLoading(true);
        await ideas.init();
        initRef.current = true;
        setIsLoading(false);
      }
    };

    initialize();
  }, [navigate, ideas, user]);

  const handleRemove = async (ideaId) => {
    const idea = ideas.current.find(i => i.$id === ideaId);
    if (!idea) {
      toast.error("Task not found. Please try again.");
      return;
    }

    // Check if user has permission to remove the task
    if (user.current.$id !== idea.userId && !user.current.roles?.includes('admin')) {
      toast.error("You don't have permission to remove this task.");
      return;
    }

    const success = await ideas.remove(ideaId);
    if (success) {
      setSelectedIdea(null);
      toast.success("Task removed successfully!");
    } else {
      toast.error("Failed to remove task. Please try again.");
    }
  };

  const handleToggleComplete = async (ideaId) => {
    const idea = ideas.current.find(i => i.$id === ideaId);
    if (!idea) {
      toast.error("Task not found. Please try again.");
      return;
    }

    const success = await ideas.toggleComplete(ideaId, {
      completed: !idea.completed
    });
    
    if (success) {
      setSelectedIdea(null);
      toast.success("Task status updated successfully!");
    } else {
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleTagToggle = (tag) => {
    setTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleFilterTagToggle = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const cancelResetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setDueDate("");
    setIsFormOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  };

  const handleFormSubmit = async () => {
    if (!title) {
      toast.error("Please enter a title.");
      return;
    }
    if (description && description.length > 2500) {
      toast.error("Description must be less than 2500 characters");
      return;
    }

    const entryDate = new Date().toISOString();
    const success = await ideas.add({
      userId: user.current.$id,
      userName: user.current.name,
      title,
      description: description || "",
      entryDate,
      tags,
      dueDate: dueDate || null,
      completed: false,
    });

    if (success) {
      setIsFormOpen(false);
      setTitle("");
      setDescription("");
      setTags([]);
      setDueDate("");
      toast.success("Task added successfully!");
    } else {
      toast.error("Failed to add task. Please try again.");
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600";
    if (diffDays === 0) return "text-yellow-600";
    if (diffDays <= 3) return "text-orange-600";
    return "text-green-600";
  };

  // Memoize filteredAndSortedIdeas to prevent unnecessary recalculations
  const filteredAndSortedIdeas = React.useMemo(() => {
    return ideas.current
      .filter((idea) => {
        if (hideCompleted && idea.completed) {
          return false;
        }
        if (userFilter && idea.userId !== userFilter) {
          return false;
        }
        if (timeFilter) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          const ideaDate = new Date(idea.dueDate || idea.entryDate);

          switch (timeFilter) {
            case 'today':
              return ideaDate >= today && ideaDate < tomorrow;
            case 'overdue':
              return ideaDate < today && !idea.completed;
            case 'week':
              return ideaDate >= today && ideaDate <= weekEnd;
            default:
              return true;
          }
        }
        return (
          selectedTags.length === 0 ||
          idea.tags?.some((tag) => selectedTags.includes(tag))
        );
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const aTags = a.tags?.join(",") || "";
        const bTags = b.tags?.join(",") || "";
        return aTags.localeCompare(bTags);
      });
  }, [ideas, hideCompleted, userFilter, timeFilter, selectedTags]);

  // Memoize dashboard stats
  const dashboardStats = React.useMemo(() => ({
    totalTasks: ideas.current.length,
    completedTasks: ideas.current.filter(idea => idea.completed).length,
    completedToday: ideas.current.filter(idea => {
      if (!idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedDate = new Date(idea.completedAt || idea.entryDate);
      return completedDate >= today;
    }).length,
    completedByMe: ideas.current.filter(idea => 
      idea.completed && idea.userId === user.current.$id
    ).length,
    pendingTasks: ideas.current.filter(idea => !idea.completed).length,
    overdueTasks: ideas.current.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      return dueDate < today;
    }).length,
    tasksDueToday: ideas.current.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      return dueDate.getTime() === today.getTime();
    }).length,
  }), [ideas, user]);

  // Memoize unique users
  const uniqueUsers = React.useMemo(() => {
    return ideas.current.reduce((acc, idea) => {
      if (!acc[idea.userId]) {
        acc[idea.userId] = {
          id: idea.userId,
          name: idea.userName || (idea.userId === user.current?.$id ? "You" : "Unknown User"),
        };
      }
      return acc;
    }, {});
  }, [ideas, user]);

  const handleOpenEdit = (idea) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditDescription(idea.description || "");
    setEditTags(idea.tags || []);
    setEditDueDate(idea.dueDate || "");
    setIsEditModalOpen(true);
    setSelectedIdea(null);
  };

  const handleQuickDateUpdate = async (ideaId, dateType) => {
    const now = new Date();
    let newDueDate;

    switch (dateType) {
      case 'today':
        newDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
        break;
      case 'tomorrow':
        newDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59);
        break;
      case 'endOfWeek':
        const daysUntilSunday = 7 - now.getDay();
        newDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59);
        break;
      default:
        return;
    }

    const success = await ideas.update(ideaId, {
      dueDate: newDueDate.toISOString()
    });

    if (success) {
      setSelectedIdea(null);
      toast.success("Due date updated successfully!");
    } else {
      toast.error("Failed to update due date. Please try again.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle) {
      toast.error("Please enter a title.");
      return;
    }
    if (editDescription && editDescription.length > 2500) {
      toast.error("Description must be less than 2500 characters");
      return;
    }

    const success = await ideas.update(editingIdea.$id, {
      title: editTitle,
      description: editDescription,
      tags: editTags,
      dueDate: editDueDate || null,
    });

    if (success) {
      setIsEditModalOpen(false);
      setEditingIdea(null);
      toast.success("Task updated successfully!");
    } else {
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleMenuClick = (event, ideaId) => {
    event.stopPropagation();
    if (selectedIdea === ideaId) {
      setSelectedIdea(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192, // 192px is the menu width (w-48)
      });
      setSelectedIdea(ideaId);
    }
  };

  // Click outside handler with proper cleanup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedIdea(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Task
        </button>
      </div>

      {user.current && (
        <section className="mt-8 relative z-10">
          {/* Add dashboard stats section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.totalTasks}</h3>
                </div>
                <FontAwesomeIcon icon={faChartLine} className="text-purple-500 h-6 w-6" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <h3 className="text-2xl font-bold text-green-600">{dashboardStats.completedTasks}</h3>
                </div>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 h-6 w-6" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <h3 className="text-2xl font-bold text-blue-600">{dashboardStats.pendingTasks}</h3>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-blue-500 h-6 w-6" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <h3 className="text-2xl font-bold text-red-600">{dashboardStats.overdueTasks}</h3>
                </div>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 h-6 w-6" />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}
          {!ideas.hasPermission && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Permission Error!</strong>
              <span className="block sm:inline"> You don't have permission to perform this action.</span>
              <button
                onClick={() => ideas.retry()}
                className="ml-4 text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}
          {ideas.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {ideas.error}</span>
              <button
                onClick={() => ideas.retry()}
                className="ml-4 text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}
          {isFormOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Task</h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                    <span
                      className={
                        description?.length > 500
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                    >
                      {description?.length} / 2500 characters
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            tags.includes(tag)
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={cancelResetForm}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Task List</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                  hideCompleted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={
                  hideCompleted
                    ? "Show completed tasks"
                    : "Hide completed tasks"
                }
              >
                <FontAwesomeIcon icon={hideCompleted ? faEyeSlash : faEye} />
                <span className="hidden sm:inline">
                  {hideCompleted ? "Show Completed" : "Hide Completed"}
                </span>
              </button>

              <button
                onClick={() => setIsMinimalView(!isMinimalView)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                  isMinimalView
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={isMinimalView ? "Show full view" : "Show minimal view"}
              >
                <FontAwesomeIcon icon={isMinimalView ? faThLarge : faListUl} />
                <span className="hidden sm:inline">
                  {isMinimalView ? "Full View" : "Minimal View"}
                </span>
              </button>

              <div className="flex items-center gap-4 text-sm border-l border-gray-200 pl-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-green-500"
                  />
                  <span className="hidden sm:inline">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="text-red-500"
                  />
                  <span className="hidden sm:inline">Pending</span>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                  showFilters || selectedTags.length > 0
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">
                  Filter
                  {selectedTags.length > 0 ? ` (${selectedTags.length})` : ""}
                </span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Filter by Time
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTimeFilter(timeFilter === 'today' ? null : 'today')}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      timeFilter === 'today'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCalendarDay} />
                    Today
                  </button>
                  <button
                    onClick={() => setTimeFilter(timeFilter === 'week' ? null : 'week')}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      timeFilter === 'week'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCalendarWeek} />
                    This Week
                  </button>
                  <button
                    onClick={() => setTimeFilter(timeFilter === 'overdue' ? null : 'overdue')}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      timeFilter === 'overdue'
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Overdue
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Filter by User
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setUserFilter(userFilter === user.current.$id ? null : user.current.$id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      userFilter === user.current.$id
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faUserClock} />
                    Me
                  </button>
                  {Object.values(uniqueUsers).map((userInfo) => (
                    userInfo.id !== user.current.$id && (
                      <button
                        key={userInfo.id}
                        onClick={() => setUserFilter(userFilter === userInfo.id ? null : userInfo.id)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                          userFilter === userInfo.id
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <FontAwesomeIcon icon={faUserClock} />
                        {userInfo.name}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Minimal View */}
        {isMinimalView ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredAndSortedIdeas.map((idea) => (
              <div
                key={idea.$id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  idea.completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleMenuClick(e, idea.$id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FontAwesomeIcon
                      icon={faEllipsisV}
                      className="h-4 w-4 text-gray-600"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {idea.title}
                    </h3>
                    <TruncatedDescription text={idea.description} isMinimal={true} maxLength={100} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex gap-1">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            idea.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedIdeas.map((idea) => (
              <div
                key={idea.$id}
                className={`relative bg-white rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] ${
                  idea.completed
                    ? "border-2 border-green-500 bg-green-50"
                    : "border-2 border-red-200 bg-white"
                }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    idea.completed ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {/* <div className="absolute top-4 left-4">
                  <FontAwesomeIcon
                    icon={idea.completed ? faCircleCheck : faCircleXmark}
                    className={`${
                      idea.completed ? "text-green-500" : "text-red-500"
                    } h-5 w-5`}
                  />
                </div> */}
                <div className="p-4 pt-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="pl-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {idea.title}
                        </h3>
                        <TruncatedDescription text={idea.description} isMinimal={false} maxLength={150} />
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        <span>
                          Added by{" "}
                          {idea.userId === user.current.$id
                            ? "you"
                            : idea.userName || "Unknown User"}
                        </span>
                      </div>
                    </div>
                    <div className="relative isolate" style={{ zIndex: 50 }}>
                      <button
                        onClick={(e) => handleMenuClick(e, idea.$id)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <FontAwesomeIcon
                          icon={faEllipsisV}
                          className="h-4 w-4 text-gray-600"
                        />
                      </button>
                      {selectedIdea === idea.$id && (
                        <div 
                          className="fixed right-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg" 
                          style={{ zIndex: 100 }}
                        >
                          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                            <span className="text-xs font-medium text-gray-500">Actions</span>
                            <button
                              onClick={() => setSelectedIdea(null)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Close menu"
                            >
                              ×
                            </button>
                          </div>
                          <button
                            onClick={() => handleToggleComplete(idea.$id)}
                            className={`block w-full py-2 px-4 text-left hover:bg-gray-100 ${
                              idea.completed
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                idea.completed ? faCircleXmark : faCircleCheck
                              }
                              className="mr-2"
                            />
                            {idea.completed
                              ? "Mark Incomplete"
                              : "Mark Complete"}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(idea)}
                            className="block w-full py-2 px-4 text-left text-blue-600 hover:bg-gray-100 border-t border-gray-100"
                          >
                            <FontAwesomeIcon
                              icon={faPencilAlt}
                              className="mr-2"
                            />
                            Edit
                          </button>
                          {!idea.completed && (
                            <div className="border-t border-gray-100">
                              <div className="px-4 py-1 text-xs text-gray-500">Move to</div>
                              <div className="flex">
                                <button
                                  onClick={() => handleQuickDateUpdate(idea.$id, 'today')}
                                  className="flex-1 py-2 px-2 text-center text-blue-600 hover:bg-gray-100"
                                  title="Today"
                                >
                                  <FontAwesomeIcon icon={faCalendarDay} />
                                </button>
                                <button
                                  onClick={() => handleQuickDateUpdate(idea.$id, 'tomorrow')}
                                  className="flex-1 py-2 px-2 text-center text-green-600 hover:bg-gray-100"
                                  title="Tomorrow"
                                >
                                  <FontAwesomeIcon icon={faCalendarPlus} />
                                </button>
                                <button
                                  onClick={() => handleQuickDateUpdate(idea.$id, 'endOfWeek')}
                                  className="flex-1 py-2 px-2 text-center text-purple-600 hover:bg-gray-100"
                                  title="End of Week"
                                >
                                  <FontAwesomeIcon icon={faCalendarWeek} />
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => handleRemove(idea.$id)}
                            className="block w-full py-2 px-4 text-left text-red-600 hover:bg-gray-100 border-t border-gray-100"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="mr-2"
                            />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pl-6">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {formatDate(idea.entryDate)}
                    </div>
                    {idea.dueDate && (
                      <div
                        className={`flex items-center ${getDueDateStatus(
                          idea.dueDate
                        )}`}
                      >
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-1"
                        />
                        Due: {formatDate(idea.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Task</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
                <span
                  className={
                    editDescription?.length > 500
                      ? "text-red-500"
                      : "text-gray-500"
                  }
                >
                  {editDescription?.length} / 2500 characters
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setEditTags(prevTags =>
                          prevTags.includes(tag)
                            ? prevTags.filter(t => t !== tag)
                            : [...prevTags, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        editTags.includes(tag)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                />
                {editingIdea?.dueDate && new Date(editingIdea.dueDate) < new Date() && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm font-medium text-gray-700">Quick Update</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          setEditDueDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59).toISOString().slice(0, 16));
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          setEditDueDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59).toISOString().slice(0, 16));
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <FontAwesomeIcon icon={faCalendarPlus} className="mr-1" />
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const daysUntilSunday = 7 - now.getDay();
                          setEditDueDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59).toISOString().slice(0, 16));
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        <FontAwesomeIcon icon={faCalendarWeek} className="mr-1" />
                        End of Week
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedIdea && (
        <div 
          className="fixed inset-0 z-[100]"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={menuRef}
            className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{ 
              top: `${menuPosition.top}px`, 
              left: `${menuPosition.left}px`,
              zIndex: 9999 
            }}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Actions</span>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Close menu"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => handleToggleComplete(selectedIdea)}
              className={`block w-full py-2 px-4 text-left hover:bg-gray-100 ${
                ideas.current.find(i => i.$id === selectedIdea)?.completed
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  ideas.current.find(i => i.$id === selectedIdea)?.completed 
                    ? faCircleXmark 
                    : faCircleCheck
                }
                className="mr-2"
              />
              {ideas.current.find(i => i.$id === selectedIdea)?.completed
                ? "Mark Incomplete"
                : "Mark Complete"}
            </button>
            <button
              onClick={() => handleOpenEdit(ideas.current.find(i => i.$id === selectedIdea))}
              className="block w-full py-2 px-4 text-left text-blue-600 hover:bg-gray-100 border-t border-gray-100"
            >
              <FontAwesomeIcon
                icon={faPencilAlt}
                className="mr-2"
              />
              Edit
            </button>
            {!ideas.current.find(i => i.$id === selectedIdea)?.completed && (
              <div className="border-t border-gray-100">
                <div className="px-4 py-1 text-xs text-gray-500">Move to</div>
                <div className="flex">
                  <button
                    onClick={() => handleQuickDateUpdate(selectedIdea, 'today')}
                    className="flex-1 py-2 px-2 text-center text-blue-600 hover:bg-gray-100"
                    title="Today"
                  >
                    <FontAwesomeIcon icon={faCalendarDay} />
                  </button>
                  <button
                    onClick={() => handleQuickDateUpdate(selectedIdea, 'tomorrow')}
                    className="flex-1 py-2 px-2 text-center text-green-600 hover:bg-gray-100"
                    title="Tomorrow"
                  >
                    <FontAwesomeIcon icon={faCalendarPlus} />
                  </button>
                  <button
                    onClick={() => handleQuickDateUpdate(selectedIdea, 'endOfWeek')}
                    className="flex-1 py-2 px-2 text-center text-purple-600 hover:bg-gray-100"
                    title="End of Week"
                  >
                    <FontAwesomeIcon icon={faCalendarWeek} />
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => handleRemove(selectedIdea)}
              className="block w-full py-2 px-4 text-left text-red-600 hover:bg-gray-100 border-t border-gray-100"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="mr-2"
              />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
