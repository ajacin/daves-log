import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  faShoppingCart,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import React from "react";
import confetti from 'canvas-confetti';

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
  "kids",

  // Work & Education
  "school",
  "work",
  "study",
  // Health & Wellness
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
    <div className="mt-1">
      <div className={`relative ${!isExpanded ? 'max-h-[4.5em] overflow-hidden' : ''}`}>
        <div className={`text-gray-500 text-sm break-words leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
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
          className="mt-1 text-blue-500 hover:text-blue-600 focus:outline-none text-xs font-medium"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// Helper function to get the recurrence letter indicator
const getRecurrenceIndicator = (recurrence) => {
  switch(recurrence) {
    case 'daily': return 'D';
    case 'weekly': return 'W';
    case 'biweekly': return 'B';
    case 'monthly': return 'M';
    case 'quarterly': return 'Q';
    case 'yearly': return 'Y';
    default: return '';
  }
};

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
  const [recurrence, setRecurrence] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(true);
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
  const [editRecurrence, setEditRecurrence] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const cardRefs = useRef({});
  const initRef = useRef(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkTasksInput, setBulkTasksInput] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");
  const [editCustomTagInput, setEditCustomTagInput] = useState("");
  const [isShoppingList, setIsShoppingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user.current) {
      navigate("/login");
      return;
    }

    const initialize = async () => {
      if (!initRef.current) {
        setIsLoading(true);
        await ideas.init();
        initRef.current = true;
        setIsLoading(false);
      }
    };

    initialize();
  }, [navigate, ideas, user]);

  // Reset initRef when ideas object changes
  useEffect(() => {
    initRef.current = false;
  }, [ideas]); // Depend on ideas object itself, not ideas.current

  useEffect(() => {
    const handleClickOutside = (event) => {
      expandedMenus.forEach(ideaId => {
        if (cardRefs.current[ideaId] && !cardRefs.current[ideaId].contains(event.target)) {
          setExpandedMenus(prev => {
            const newSet = new Set(prev);
            newSet.delete(ideaId);
            return newSet;
          });
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedMenus, cardRefs]);

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

    const newCompletedState = !idea.completed;
    
    const success = await ideas.toggleComplete(ideaId, {
      completed: newCompletedState
    });
    
    if (success) {
      toast.success(newCompletedState ? "🎉 Task completed!" : "Task marked as incomplete");
      
      // Only show celebration animation when marking as complete
      if (newCompletedState) {
        triggerCelebration();
      }
    } else {
      toast.error("Failed to update task. Please try again.");
    }
  };

  // Function to trigger celebration animation
  const triggerCelebration = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#553C9A', '#805AD5', '#B794F4'] // Purple theme
    });
    
    // Second burst after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#38B2AC', '#4FD1C5', '#81E6D9'] // Teal accent
      });
      
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#ED8936', '#F6AD55', '#FBD38D'] // Orange accent
      });
    }, 150);
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
    setRecurrence(null);
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
    const weekday = date.toLocaleDateString(undefined, { weekday: 'short' }).toLowerCase();
    return `${weekday}, ${date.toLocaleString(undefined, options)}`;
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
      tags: recurrence ? [...tags, 'recurring'] : tags,
      dueDate: dueDate || null,
      completed: false,
      recurrence: recurrence,
    });

    if (success) {
      setIsFormOpen(false);
      setTitle("");
      setDescription("");
      setTags([]);
      setDueDate("");
      setRecurrence(null);
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
  const filteredAndSortedIdeas = useMemo(() => {
    return ideas.current
      .filter((idea) => {
        // Base conditions that must always be met
        if (hideCompleted && idea.completed) {
          return false;
        }

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const titleMatch = idea.title?.toLowerCase().includes(query);
          const descriptionMatch = idea.description?.toLowerCase().includes(query);
          const tagMatch = idea.tags?.some(tag => tag.toLowerCase().includes(query));
          
          if (!(titleMatch || descriptionMatch || tagMatch)) {
            return false;
          }
        }

        // Shopping list filter
        if (isShoppingList && (!idea.tags || !idea.tags.includes('shopping'))) {
          return false;
        }

        // User filter (if active)
        if (userFilter && idea.userId !== userFilter) {
          return false;
        }

        // Time filter (if active)
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
              if (!(ideaDate >= today && ideaDate < tomorrow)) return false;
              break;
            case 'overdue':
              if (!(ideaDate < today && !idea.completed)) return false;
              break;
            case 'week':
              if (!(ideaDate >= today && ideaDate <= weekEnd)) return false;
              break;
            default:
              break;
          }
        }

        // Tag filter (if active)
        if (selectedTags.length > 0) {
          // Check if the idea has ALL selected tags
          return selectedTags.every(tag => idea.tags?.includes(tag));
        }

        return true;
      })
      .sort((a, b) => {
        // First sort by completion status
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // Then sort by due date (older due dates first)
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        // If only one has a due date, it comes first
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        
        // If neither has a due date or they have the same due date, sort by tag
        const aTags = a.tags?.join(",") || "";
        const bTags = b.tags?.join(",") || "";
        return aTags.localeCompare(bTags);
      });
  }, [ideas, hideCompleted, userFilter, timeFilter, selectedTags, isShoppingList, searchQuery]);

  // Memoize dashboard stats
  const dashboardStats = useMemo(() => ({
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
  const uniqueUsers = useMemo(() => {
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

  // Memoize unique tags from all tasks
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    ideas.current.forEach(idea => {
      if (idea.tags) {
        idea.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [ideas]);

  const handleOpenEdit = (idea) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditDescription(idea.description || "");
    setEditTags(idea.tags || []);
    setEditDueDate(idea.dueDate || "");
    setEditRecurrence(idea.recurrence || null);
    setIsEditModalOpen(true);
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
      case 'weekend':
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        newDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSaturday, 23, 59);
        break;
      default:
        return;
    }

    const success = await ideas.update(ideaId, {
      dueDate: newDueDate.toISOString()
    });

    if (success) {
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
      tags: editRecurrence ? 
        (editTags.includes('recurring') ? editTags : [...editTags, 'recurring']) : 
        editTags.filter(tag => tag !== 'recurring'),
      dueDate: editDueDate || null,
      recurrence: editRecurrence,
    });

    if (success) {
      setIsEditModalOpen(false);
      setEditingIdea(null);
      toast.success("Task updated successfully!");
    } else {
      toast.error("Failed to update task. Please try again.");
    }
  };

  const toggleMenu = useCallback((ideaId, event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.clear(); // Close any other open menus
        newSet.add(ideaId);
      }
      return newSet;
    });
  }, []);

  const handleBulkUpload = async () => {
    try {
      const tasksArray = bulkTasksInput
        .split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0)
        .map(task => {
          const hashtags = task.match(/#\w+/g) || [];
          const title = task.replace(/#\w+/g, '').trim();
          const tags = hashtags.map(tag => tag.substring(1)); // Remove # from tags
          // Add shopping tag if checkbox is checked
          const finalTags = isShoppingList ? [...tags, 'shopping'] : tags;
          return { title, tags: [...finalTags, 'bulk'] };
        })
        .filter(task => task.title.length > 0);

      if (tasksArray.length === 0) {
        toast.error("Please enter at least one task");
        return;
      }

      let successCount = 0;
      for (const task of tasksArray) {
        const success = await ideas.add({
          userId: user.current.$id,
          userName: user.current.name,
          title: task.title,
          description: "",
          entryDate: new Date().toISOString(),
          tags: task.tags,
          completed: false,
        });
        if (success) successCount++;
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} tasks!`);
        setIsBulkUploadOpen(false);
        setBulkTasksInput("");
        setIsShoppingList(false); // Reset the checkbox
      }
    } catch (error) {
      toast.error("Failed to create tasks");
    }
  };

  const getTaskPreview = (input) => {
    return input
      .split('\n')
      .map(task => task.trim())
      .filter(task => task.length > 0)
      .map(task => {
        const hashtags = task.match(/#\w+/g) || [];
        const title = task.replace(/#\w+/g, '').trim();
        const tags = hashtags.map(tag => tag.substring(1));
        return { title, tags };
      })
      .filter(task => task.title.length > 0);
  };

  const handleCustomTagAdd = (event, isEdit = false) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      event.preventDefault();
      const newTag = event.target.value.trim().toLowerCase();
      
      if (isEdit) {
        if (!editTags.includes(newTag)) {
          setEditTags(prev => [...prev, newTag]);
        }
        setEditCustomTagInput("");
      } else {
        if (!tags.includes(newTag)) {
          setTags(prev => [...prev, newTag]);
        }
        setCustomTagInput("");
      }
    }
  };

  // Check if the task count is approaching the limit
  const isApproachingLimit = useMemo(() => {
    const totalTasks = ideas.current.length;
    // Show warning when 90% or more of the limit is reached
    return totalTasks >= 90;
  }, [ideas]);

  // Show a more urgent warning when at the limit
  const isAtLimit = useMemo(() => {
    const totalTasks = ideas.current.length;
    return totalTasks >= 100;
  }, [ideas]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task Limit Warning Banner */}
      {(isApproachingLimit || isAtLimit) && (
        <div className={`mb-4 p-4 rounded-lg ${
          isAtLimit 
            ? "bg-red-100 border border-red-400 text-red-700" 
            : "bg-yellow-100 border border-yellow-400 text-yellow-800"
        }`}>
          <div className="flex items-start">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className={`mr-3 mt-1 ${isAtLimit ? "text-red-500" : "text-yellow-500"}`} 
            />
            <div>
              <h3 className="font-bold text-lg">
                {isAtLimit ? "Task Limit Reached!" : "Warning: Approaching Task Limit"}
              </h3>
              <p className="mt-1">
                {isAtLimit 
                  ? "You have reached the maximum of 200 tasks. Please archive or delete some older tasks before adding new ones."
                  : `You currently have ${ideas.current.length} tasks (limit is 200). Consider removing or archiving older completed tasks.`
                }
              </p>
              {user.current?.roles?.includes('admin') && (
                <p className="mt-2 text-sm font-semibold">
                  Admin Note: Consider increasing the task limit in the database configuration if needed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Upload Tasks</h2>
              <button
                onClick={() => setIsBulkUploadOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Tasks (one per line)
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Example:<br />
                  Buy groceries #walmart<br />
                  Call dentist #appointment<br />
                  Send email to team #work
                </div>
                <textarea
                  value={bulkTasksInput}
                  onChange={(e) => setBulkTasksInput(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  rows="6"
                  placeholder="Enter tasks here..."
                />
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isShoppingList}
                      onChange={() => setIsShoppingList(!isShoppingList)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span>Tag all tasks as shopping items</span>
                  </label>
                </div>
                <div className="mt-2 text-sm">
                  {bulkTasksInput && (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">
                        Will create {getTaskPreview(bulkTasksInput).length} tasks:
                      </div>
                      <div className="bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                        {getTaskPreview(bulkTasksInput).map((task, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{index + 1}.</span>
                              <span className="truncate">{task.title}</span>
                            </div>
                            <div className="ml-6 mt-0.5 flex gap-1 flex-wrap">
                              {task.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px]">
                                  {tag}
                                </span>
                              ))}
                              {isShoppingList && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px]">
                                  shopping
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleBulkUpload}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  disabled={getTaskPreview(bulkTasksInput).length === 0}
                >
                  Upload Tasks
                </button>
                <button
                  onClick={() => {
                    setIsBulkUploadOpen(false);
                    setBulkTasksInput("");
                    setIsShoppingList(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Type a custom tag and press Enter"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => handleCustomTagAdd(e)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="px-3 py-1 rounded-full text-sm bg-purple-500 text-white hover:bg-purple-600"
                          >
                            {tag}
                            <span className="ml-2" onClick={(e) => {
                              e.stopPropagation();
                              setTags(prev => prev.filter(t => t !== tag));
                            }}>×</span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="text-sm text-gray-500 mb-2">Suggested tags:</div>
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recurrence
                    </label>
                    <select
                      value={recurrence || ""}
                      onChange={(e) => setRecurrence(e.target.value === "" ? null : e.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">No recurrence</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    {recurrence && (
                      <p className="mt-1 text-xs text-gray-500">
                        This task will automatically recreate itself with the same settings when completed.
                      </p>
                    )}
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
          <div className="flex items-center justify-between flex-wrap gap-y-3">
            <h2 className="text-2xl font-bold">Task List</h2>
            <div className="flex items-center gap-3 flex-wrap">
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

              <button
                onClick={() => setIsShoppingList(!isShoppingList)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                  isShoppingList
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={isShoppingList ? "Show all tasks" : "Show shopping list"}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                <span className="hidden sm:inline">
                  {isShoppingList ? "All Tasks" : "Shopping"}
                </span>
              </button>
              
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

          {/* Search bar */}
          <div className="w-full flex">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search tasks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              )}
            </div>
          </div>

          {/* Filter section */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        selectedTags.includes(tag)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{tag}</span>
                      {selectedTags.includes(tag) && (
                        <span className="text-xs bg-purple-600 text-white px-1.5 rounded-full">
                          {ideas.current.filter(idea => idea.tags?.includes(tag)).length}
                        </span>
                      )}
                    </button>
                  ))}
                  {availableTags.length === 0 && (
                    <span className="text-sm text-gray-500">No tags available</span>
                  )}
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
            <div className="text-sm text-gray-500 mb-2">
              {filteredAndSortedIdeas.length} tasks
              <span className="ml-1 text-xs text-orange-500">
                {hideCompleted && "(completed tasks are hidden)"}
                {searchQuery && ` (search: "${searchQuery}")`}
                {isShoppingList && " (shopping list)"}
              </span>
            </div>
            
            {filteredAndSortedIdeas.length > 0 ? (
              filteredAndSortedIdeas.map((idea) => (
                <div
                  key={idea.$id}
                  ref={el => cardRefs.current[idea.$id] = el}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    idea.completed
                      ? "bg-green-50 border border-green-200"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-snug text-gray-800">
                        {idea.title}
                      </h3>
                      {idea.recurrence && (
                        <span 
                          className="text-purple-600 flex items-center gap-0.5" 
                          title={`Recurring task (${idea.recurrence})`}
                        >
                          <FontAwesomeIcon icon={faSync} className="h-3 w-3" />
                          <span className="text-xs font-medium">{getRecurrenceIndicator(idea.recurrence)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!idea.completed && (
                      <>
                        <button
                          onClick={() => handleQuickDateUpdate(idea.$id, 'today')}
                          className="p-1.5 rounded text-purple-600 hover:bg-purple-50"
                          title="Due today"
                        >
                          <FontAwesomeIcon icon={faCalendarDay} className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleQuickDateUpdate(idea.$id, 'tomorrow')}
                          className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50"
                          title="Due tomorrow"
                        >
                          <FontAwesomeIcon icon={faCalendarPlus} className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={(e) => toggleMenu(idea.$id, e)}
                      className="p-1.5 rounded text-gray-500 hover:bg-gray-50"
                      title="More options"
                    >
                      <FontAwesomeIcon icon={faEllipsisV} className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleComplete(idea.$id)}
                      className={`ml-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        idea.completed
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      title={idea.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className={`h-5 w-5 transition-transform ${idea.completed ? "scale-100" : "scale-90"}`}
                      />
                    </button>
                  </div>
                  
                  {expandedMenus.has(idea.$id) && (
                    <div className="absolute right-0 mt-32 mr-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => handleRemove(idea.$id)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 w-full text-left"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No tasks match your current filters
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-sm text-gray-500 mb-2">
              {filteredAndSortedIdeas.length} tasks
              <span className="ml-1 text-xs text-orange-500">
                {hideCompleted && "(completed tasks are hidden)"}
                {searchQuery && ` (search: "${searchQuery}")`}
                {isShoppingList && " (shopping list)"}
              </span>
            </div>
            
            {filteredAndSortedIdeas.length > 0 ? (
              filteredAndSortedIdeas.map((idea) => (
                <div
                  key={idea.$id}
                  ref={el => cardRefs.current[idea.$id] = el}
                  className={`relative bg-white rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] ${
                    idea.completed
                      ? "border-2 border-green-500 bg-green-50"
                      : "border-2 border-red-200 bg-white"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-0.5 ${
                      idea.completed ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="p-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold leading-snug text-gray-800">
                            {idea.title}
                          </h3>
                          {idea.recurrence && (
                            <span 
                              className="text-purple-600 flex items-center gap-0.5" 
                              title={`Recurring task (${idea.recurrence})`}
                            >
                              <FontAwesomeIcon icon={faSync} className="h-3 w-3" />
                              <span className="text-xs font-medium">{getRecurrenceIndicator(idea.recurrence)}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => toggleMenu(idea.$id, e)}
                          className="p-0.5 hover:bg-gray-100 rounded-full shrink-0"
                          title="Delete task"
                        >
                          <FontAwesomeIcon
                            icon={faEllipsisV}
                            className="h-3.5 w-3.5 text-gray-600"
                          />
                        </button>
                      </div>
                      
                      {expandedMenus.has(idea.$id) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 border-t border-gray-100 pt-1.5">
                          <button
                            onClick={() => handleRemove(idea.$id)}
                            className="px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                      
                      {idea.description && (
                        <div className="border-t border-gray-100 pt-1.5">
                          <TruncatedDescription text={idea.description} isMinimal={false} maxLength={150} />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {idea.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                  idea.completed
                                    ? "bg-green-50 text-green-800"
                                    : "bg-purple-50 text-purple-800"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center gap-1 mt-2 border-t border-gray-100 pt-2">
                        <button
                          onClick={() => handleToggleComplete(idea.$id)}
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            idea.completed
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={idea.completed ? faCircleXmark : faCircleCheck}
                            className="h-3 w-3"
                          />
                          <span>{idea.completed ? "Incomplete" : "Done"}</span>
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(idea)}
                          className="px-2 py-1 rounded-full text-xs flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} className="h-3 w-3" />
                        </button>
                        
                        {!idea.completed && (
                          <>
                            <button
                              onClick={() => handleQuickDateUpdate(idea.$id, 'today')}
                              className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100"
                            >
                              <FontAwesomeIcon icon={faCalendarDay} className="h-3 w-3" />
                              <span>Today</span>
                            </button>
                            <button
                              onClick={() => handleQuickDateUpdate(idea.$id, 'tomorrow')}
                              className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            >
                              <FontAwesomeIcon icon={faCalendarPlus} className="h-3 w-3" />
                              <span>Tom</span>
                            </button>
                            <button
                              onClick={() => handleQuickDateUpdate(idea.$id, 'weekend')}
                              className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            >
                              <FontAwesomeIcon icon={faCalendarWeek} className="h-3 w-3" />
                              <span>Sat</span>
                            </button>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-1.5 mt-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                            <span className="ml-1">{formatDate(idea.entryDate)}</span>
                          </div>
                          {idea.dueDate && (
                            <div className={`flex items-center ${getDueDateStatus(idea.dueDate)}`}>
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                              <span className="ml-1">{formatDate(idea.dueDate)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                          <span className="ml-1">{idea.userName || "Unknown User"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
                No tasks match your current filters
              </div>
            )}
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
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Type a custom tag and press Enter"
                    value={editCustomTagInput}
                    onChange={(e) => setEditCustomTagInput(e.target.value)}
                    onKeyDown={(e) => handleCustomTagAdd(e, true)}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {editTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setEditTags(prevTags =>
                            prevTags.filter(t => t !== tag)
                          );
                        }}
                        className="px-3 py-1 rounded-full text-sm bg-purple-500 text-white hover:bg-purple-600"
                      >
                        {tag}
                        <span className="ml-2">×</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-2">
                    <div className="text-sm text-gray-500 mb-2">Suggested tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_TAGS.filter(tag => !editTags.includes(tag)).map((tag) => (
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
                          className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
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
                          const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
                          setEditDueDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSaturday, 23, 59).toISOString().slice(0, 16));
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        <FontAwesomeIcon icon={faCalendarWeek} className="mr-1" />
                        This Weekend
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recurrence
                </label>
                <select
                  value={editRecurrence || ""}
                  onChange={(e) => setEditRecurrence(e.target.value === "" ? null : e.target.value)}
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {editRecurrence && (
                  <p className="mt-1 text-xs text-gray-500">
                    This task will automatically recreate itself with the same settings when completed.
                  </p>
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
    </div>
  );
}
