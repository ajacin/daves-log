import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheck,
  faEdit,
  faTrash,
  faSync,
  faFilter,
  faSearch,
  faEllipsisV,
  faCalendarDay,
  faCalendarWeek,
  faCalendar,
  faCalendarPlus,
  faExclamationTriangle,
  faShoppingCart,
  faUser,
  faEye,
  faEyeSlash,
  faTimes,
  faUpload,
  faUserClock,
  faChevronLeft,
  faChevronRight,
  faInfoCircle,
  faLock,
  faLockOpen,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import React from "react";
import confetti from 'canvas-confetti';

// Toast configuration to prevent duplicate notifications
const toastConfig = {
  success: {
    duration: 4000,
    style: {
      background: '#10B981',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
    },
  },
  error: {
    duration: 3000,
    style: {
      background: '#EF4444',
      color: 'white',
      fontWeight: 'bold',
    },
  },
};

const PREDEFINED_TAGS = [
  "walmart", "costco", "dollarama", "shopping", "foodco", "groceries", "pharmacy", "errands",
  "home", "kids", "school", "work", "health", "fitness", "finance", "personal", "urgent",
  "low-priority", "project", "meeting", "call", "email", "research", "creative", "learning",
  "maintenance", "travel", "social", "hobby", "gift", "appointment", "deadline", "important"
];

// Helper function for text rendering with links
const renderTextWithLinks = (text) => {
  if (!text) return '';
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};





// Tag component
function TaskTag({ tag, onRemove, readOnly = false }) {
  const getTagColor = (tag) => {
    const tagColors = {
      urgent: 'bg-red-100 text-red-700',
      important: 'bg-orange-100 text-orange-700',
      shopping: 'bg-green-100 text-green-700',
      work: 'bg-blue-100 text-blue-700',
      personal: 'bg-purple-100 text-purple-700',
      home: 'bg-yellow-100 text-yellow-700',
      health: 'bg-pink-100 text-pink-700',
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
      {tag}
      {!readOnly && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 text-current hover:text-red-600"
        >
          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

// Quick Add Task Component
function QuickAddTask({ onAdd, placeholder = "Add a task..." }) {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Auto-assign today's date to recurring tasks if no due date is set
    let finalDueDate = dueDate || null;
    if (!finalDueDate && recurrence) {
      finalDueDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      tags,
      dueDate: finalDueDate,
      recurrence: recurrence || null,
    };

    const success = await onAdd(taskData);
    if (success) {
      setTitle("");
      setDescription("");
      setTags([]);
      setDueDate("");
      setRecurrence("");
      setCustomTagInput("");
      setIsExpanded(false);
    }
  };

  const handleTagAdd = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleCustomTagAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = customTagInput.trim().toLowerCase();
      if (tag) {
        handleTagAdd(tag);
        setCustomTagInput("");
      }
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="p-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full text-xs border-none outline-none resize-none placeholder-gray-400"
          />
          
          {isExpanded && (
            <div className="mt-2 space-y-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full text-xs border border-gray-200 rounded p-1.5 resize-none outline-none focus:border-blue-500"
                rows="2"
              />
              
              {/* Tags */}
              <div>
                <div className="flex flex-wrap gap-0.5 mb-1">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-purple-100 text-purple-700">
                      {tag}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTags(tags.filter(t => t !== tag));
                        }}
                        className="ml-0.5 text-current hover:text-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagAdd}
                  placeholder="Add tags (press Enter)"
                  className="w-full text-[10px] border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagAdd(tag)}
                      className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date and Recurrence */}
              <div className="flex gap-1">
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-500"
                />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-500"
                >
                  <option value="">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Recurring task notice */}
              {recurrence && !dueDate && (
                <div className="text-[9px] text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  💡 This recurring task will be scheduled for today
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setDescription("");
                    setTags([]);
                    setDueDate("");
                    setRecurrence("");
                    setCustomTagInput("");
                  }}
                  className="text-[10px] text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// Task Item Component
function TaskItem({ task, onToggleComplete, onEdit, onDelete, onQuickDateUpdate, isProcessing, onOpenDetail }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div className={`bg-white rounded border transition-all hover:shadow-sm cursor-pointer ${
      task.completed ? 'opacity-75 border-gray-200' : 
      isOverdue ? 'border-red-200 bg-red-50' : 
      isDueToday ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
    }`}>
      <div className="p-2">
        <div className="flex items-start gap-2" onClick={() => onOpenDetail(task)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.$id);
            }}
            disabled={isProcessing}
            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              isProcessing 
                ? 'opacity-50 cursor-not-allowed border-gray-300' 
                : task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div 
              className={`font-medium text-sm sm:text-xs ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'} truncate`}
              title={task.title}
            >
              {task.title}
            </div>
            
            {task.description && (
              <div className="mt-1">
                <div className="text-gray-600 text-xs sm:text-[10px] break-words leading-relaxed line-clamp-2">
                  {renderTextWithLinks(task.description)}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs sm:text-[9px] font-medium bg-gray-100 text-gray-700">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs sm:text-[9px] font-medium bg-gray-100 text-gray-500">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Due Date */}
            {task.dueDate && (
              <div className={`text-xs sm:text-[10px] mt-1 flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : isDueToday ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {task.recurrence && (
                  <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-600 rounded-full flex items-center gap-0.5">
                    <FontAwesomeIcon icon={faSync} className="h-2 w-2" />
                    {task.recurrence.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            {!task.completed && (
              <div className="flex gap-1 mt-1 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDateUpdate(task.$id, 'today');
                  }}
                  className="text-xs sm:text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Today
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDateUpdate(task.$id, 'tomorrow');
                  }}
                  className="text-xs sm:text-[9px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  Tomorrow
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDateUpdate(task.$id, 'weekend');
                  }}
                  className="text-xs sm:text-[9px] px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
                >
                  This Weekend
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDateUpdate(task.$id, 'week');
                  }}
                  className="text-xs sm:text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                >
                  In a Week
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDateUpdate(task.$id, 'month');
                  }}
                  className="text-xs sm:text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                >
                  In a Month
                </button>
              </div>
            )}
          </div>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <FontAwesomeIcon icon={faEllipsisV} className="h-2.5 w-2.5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded shadow-lg z-10 py-1 min-w-[100px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm sm:text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faEdit} className="h-2.5 w-2.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.$id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm sm:text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Column Component
function TimelineColumn({ title, subtitle, tasks, onAddTask, type, targetDate, isToday = false, isOverdue = false, processingTasks, hideMobileHeader = false, onOpenDetail, ...taskActions }) {
  const handleAddTask = async (taskData) => {
    if (type === 'unscheduled') {
      return await onAddTask(taskData);
    }
    return await onAddTask(taskData, targetDate);
  };

  const getColumnStyle = () => {
    if (isOverdue) return 'bg-red-50 border-red-200';
    if (isToday) return 'bg-blue-50 border-blue-200';
    return 'bg-white border-gray-200';
  };

  const getHeaderStyle = () => {
    if (isOverdue) return 'bg-red-100 border-red-200';
    if (isToday) return 'bg-blue-100 border-blue-200';
    if (type === 'unscheduled') return 'bg-gray-100 border-gray-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getTitleStyle = () => {
    if (isOverdue) return 'text-red-800';
    if (isToday) return 'text-blue-800';
    return 'text-gray-900';
  };

  const getSubtitleStyle = () => {
    if (isOverdue) return 'text-red-600';
    if (isToday) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className={`flex-1 min-w-[280px] lg:min-w-[280px] w-full rounded-lg ${hideMobileHeader ? 'border-0 shadow-none' : 'border shadow-sm'} ${getColumnStyle()}`}>
      {/* Column Header - Hidden in mobile navigation mode */}
      {!hideMobileHeader && (
        <div className={`p-3 border-b ${getHeaderStyle()}`}>
          <div className="text-center">
            <div className={`text-sm sm:text-xs font-bold ${getTitleStyle()}`}>
              {title}
            </div>
            {subtitle && (
              <div className={`text-xs sm:text-[10px] font-medium ${getSubtitleStyle()}`}>
                {subtitle}
              </div>
            )}
            <div className="text-xs sm:text-[10px] text-gray-500 mt-0.5">
              ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks */}
      <div className={`p-2 space-y-1.5 min-h-[400px] max-h-[600px] overflow-y-auto ${hideMobileHeader ? 'pt-4' : ''}`}>
        {/* Quick Add */}
        <QuickAddTask 
          onAdd={handleAddTask} 
          placeholder={`Add to ${title.toLowerCase()}...`} 
        />
        
        {/* Task List */}
        {tasks.map((task) => (
          <TaskItem
            key={task.$id}
            task={task}
            isProcessing={processingTasks?.has(task.$id)}
            onOpenDetail={onOpenDetail}
            {...taskActions}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-xs">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}

export function Ideas() {
  const user = useUser();
  const ideas = useIdeas();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeFilter, setTimeFilter] = useState(null); // 'today', 'tomorrow', 'overdue', 'week', 'next_week', 'next_month'
  const [userFilter, setUserFilter] = useState(null);
  const [isShoppingList, setIsShoppingList] = useState(false);
  const [commonTag, setCommonTag] = useState("");
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'tags', or 'list'
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkTasksInput, setBulkTasksInput] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editDueDate, setEditDueDate] = useState("");
  const [editRecurrence, setEditRecurrence] = useState("");
  const [editCustomTagInput, setEditCustomTagInput] = useState("");
  const [showRecurringInfo, setShowRecurringInfo] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [detailLocked, setDetailLocked] = useState(true);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [detailTags, setDetailTags] = useState([]);
  const [detailDueDate, setDetailDueDate] = useState("");
  const [detailRecurrence, setDetailRecurrence] = useState("");
  const [detailCustomTagInput, setDetailCustomTagInput] = useState("");
  
  // Debounce mechanism to prevent rapid-fire clicks
  const [processingTasks, setProcessingTasks] = useState(new Set());
  
  // Track recent completions to prevent duplicate notifications
  const recentCompletions = useRef(new Map());

  const initRef = useRef(false);

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

  // Check for new task URL parameter
  useEffect(() => {
    const newParam = searchParams.get('new');
    if (newParam === 'true') {
      // Could trigger new task modal or focus on quick add
    }
  }, [searchParams]);

  // Helper functions
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6']
    });
  };

  // Date helper functions
  const getDateInfo = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    // Get remaining days of this week (after day after tomorrow)
    const remainingWeekDays = [];
    const dayOfWeek = today.getDay();
    const daysLeftInWeek = 6 - dayOfWeek; // Saturday is the end
    
    for (let i = 3; i <= daysLeftInWeek; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      remainingWeekDays.push(day);
    }
    
    return {
      today,
      yesterday,
      tomorrow,
      dayAfterTomorrow,
      remainingWeekDays
    };
  }, []);

  const formatColumnHeader = useCallback((date, type) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    switch (type) {
      case 'yesterday':
        return { title: 'YESTERDAY', subtitle: `${dayName}, ${monthDay}` };
      case 'today':
        return { title: 'TODAY', subtitle: `${dayName}, ${monthDay}` };
      case 'tomorrow':
        return { title: 'TOMORROW', subtitle: `${dayName}, ${monthDay}` };
      case 'dayAfterTomorrow':
        return { title: dayName.toUpperCase(), subtitle: monthDay };
      default:
        return { title: dayName.toUpperCase(), subtitle: monthDay };
    }
  }, []);

  // Get unique users for filtering
  const uniqueUsers = useMemo(() => {
    return ideas.current.reduce((acc, task) => {
      if (!acc[task.userId]) {
        acc[task.userId] = {
          id: task.userId,
          name: task.userName || (task.userId === user.current?.$id ? "You" : "Unknown User"),
        };
      }
      return acc;
    }, {});
  }, [ideas, user]);

  // Get available tags
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    ideas.current.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [ideas]);

  // Filter and organize tasks
  const filteredTasks = useMemo(() => {
    let filtered = ideas.current;

    // Hide completed if enabled
    if (hideCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    // Shopping list filter
    if (isShoppingList) {
      filtered = filtered.filter(task => task.tags?.includes('shopping'));
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter(task => task.userId === userFilter);
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
      const nextMonthStart = new Date(today);
      nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate || task.entryDate);
        
        switch (timeFilter) {
          case 'today':
            return taskDate >= today && taskDate < tomorrow;
          case 'tomorrow':
            return taskDate >= tomorrow && taskDate < dayAfterTomorrow;
          case 'overdue':
            return taskDate < today && !task.completed && task.dueDate;
          case 'week':
            return taskDate >= today && taskDate <= weekEnd;
          case 'next_week':
            return taskDate >= nextWeekStart && taskDate < nextWeekEnd;
          case 'next_month':
            return taskDate >= nextMonthStart;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(task =>
        selectedTags.some(tag => task.tags?.includes(tag))
      );
    }

    return filtered;
  }, [ideas, hideCompleted, isShoppingList, userFilter, timeFilter, searchQuery, selectedTags]);

  // Get date periods
  const dateInfo = useMemo(() => getDateInfo(), [getDateInfo]);

  // Get priority tags for columns (most used tags)
  const priorityTags = useMemo(() => {
    const tagCounts = {};
    ideas.current.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Sort by count and take top tags, exclude 'recurring' as it's system-generated
    return Object.entries(tagCounts)
      .filter(([tag]) => tag !== 'recurring')
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 6) // Show top 6 tags as columns
      .map(([tag]) => tag);
  }, [ideas]);

  // Organize tasks by time periods
  const organizedTasks = useMemo(() => {
    if (viewMode === 'tags') {
      // Organize by tags
      const tagGroups = {
        untagged: []
      };
      
      // Initialize groups for priority tags
      priorityTags.forEach(tag => {
        tagGroups[tag] = [];
      });
      
      filteredTasks.forEach(task => {
        if (!task.tags || task.tags.length === 0) {
          tagGroups.untagged.push(task);
        } else {
          // Check if task has any of the priority tags
          const matchingTags = task.tags.filter(tag => priorityTags.includes(tag));
          
          if (matchingTags.length > 0) {
            // Add to the first matching priority tag column
            tagGroups[matchingTags[0]].push(task);
          } else {
            // Task has tags but none are in priority list
            tagGroups.untagged.push(task);
          }
        }
      });
      
      return tagGroups;
    } else {
      // Original time-based organization
      const { today, tomorrow, dayAfterTomorrow, remainingWeekDays } = dateInfo;
      
      const periods = {
        overdue: [],
        today: [],
        tomorrow: [],
        dayAfterTomorrow: [],
        remainingWeek: [],
        future: [],
        unscheduled: []
      };

      filteredTasks.forEach(task => {
        if (!task.dueDate) {
          periods.unscheduled.push(task);
          return;
        }

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Overdue tasks (all past due tasks including yesterday)
        if (dueDate < today) {
          periods.overdue.push(task);
        }
        // Today
        else if (dueDate.getTime() === today.getTime()) {
          periods.today.push(task);
        }
        // Tomorrow
        else if (dueDate.getTime() === tomorrow.getTime()) {
          periods.tomorrow.push(task);
        }
        // Day after tomorrow
        else if (dueDate.getTime() === dayAfterTomorrow.getTime()) {
          periods.dayAfterTomorrow.push(task);
        }
        // Remaining days of this week
        else if (remainingWeekDays.some(day => day.getTime() === dueDate.getTime())) {
          periods.remainingWeek.push(task);
        }
        // Future tasks beyond this week (have due dates but are in the future)
        else {
          periods.future.push(task);
        }
      });

          return periods;
     }
   }, [filteredTasks, dateInfo, viewMode, priorityTags]);

  // Get current columns for mobile navigation
  const currentColumns = useMemo(() => {
    if (viewMode === 'timeline') {
      const columns = [
        { key: 'overdue', title: 'OVERDUE', subtitle: 'Past tasks', tasks: organizedTasks.overdue, isOverdue: true },
        { key: 'today', title: formatColumnHeader(dateInfo.today, 'today').title, subtitle: formatColumnHeader(dateInfo.today, 'today').subtitle, tasks: organizedTasks.today, targetDate: dateInfo.today, isToday: true },
        { key: 'tomorrow', title: formatColumnHeader(dateInfo.tomorrow, 'tomorrow').title, subtitle: formatColumnHeader(dateInfo.tomorrow, 'tomorrow').subtitle, tasks: organizedTasks.tomorrow, targetDate: dateInfo.tomorrow },
        { key: 'dayAfterTomorrow', title: formatColumnHeader(dateInfo.dayAfterTomorrow, 'dayAfterTomorrow').title, subtitle: formatColumnHeader(dateInfo.dayAfterTomorrow, 'dayAfterTomorrow').subtitle, tasks: organizedTasks.dayAfterTomorrow, targetDate: dateInfo.dayAfterTomorrow }
      ];
      
      if (dateInfo.remainingWeekDays.length > 0) {
        columns.push({ key: 'remainingWeek', title: 'THIS WEEK', subtitle: `${dateInfo.remainingWeekDays.length} days remaining`, tasks: organizedTasks.remainingWeek });
      }
      
      if (organizedTasks.future.length > 0) {
        columns.push({ key: 'future', title: 'FUTURE', subtitle: 'Scheduled later', tasks: organizedTasks.future });
      }
      
      columns.push({ key: 'unscheduled', title: 'UNSCHEDULED', subtitle: 'No due date', tasks: organizedTasks.unscheduled });
      
      return columns;
    } else if (viewMode === 'tags') {
      const columns = priorityTags.map(tag => ({
        key: tag,
        title: tag.toUpperCase(),
        subtitle: `${organizedTasks[tag]?.length || 0} tasks`,
        tasks: organizedTasks[tag] || [],
        isTag: true,
        tagName: tag
      }));
      
      columns.push({
        key: 'untagged',
        title: 'UNTAGGED',
        subtitle: 'No tags',
        tasks: organizedTasks.untagged || [],
        isTag: true
      });
      
      return columns;
    }
    return [];
  }, [viewMode, organizedTasks, dateInfo, formatColumnHeader, priorityTags]);

  // Filter columns to only show those with tasks
  const filteredColumns = useMemo(() => {
    return currentColumns.filter(column => column.tasks.length > 0);
  }, [currentColumns]);

  // Mobile navigation functions
  const navigateColumn = (direction) => {
    const newIndex = currentColumnIndex + direction;
    if (newIndex >= 0 && newIndex < filteredColumns.length) {
      setCurrentColumnIndex(newIndex);
    }
  };

  // Reset column index when view mode changes
  useEffect(() => {
    setCurrentColumnIndex(0);
  }, [viewMode]);

  // Reset column index when filtered columns change
  useEffect(() => {
    if (currentColumnIndex >= filteredColumns.length) {
      setCurrentColumnIndex(0);
    }
  }, [filteredColumns, currentColumnIndex]);

  // Task actions
  const handleAddTask = async (taskData, targetDate = null) => {
    let dueDate = taskData.dueDate;
    
    if (targetDate instanceof Date) {
      const date = new Date(targetDate);
      date.setHours(23, 59, 0, 0);
      dueDate = date.toISOString().slice(0, 16);
    } else if (targetDate === 'today') {
      const date = new Date();
      date.setHours(23, 59, 0, 0);
      dueDate = date.toISOString().slice(0, 16);
    } else if (targetDate === 'tomorrow') {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(23, 59, 0, 0);
      dueDate = date.toISOString().slice(0, 16);
    }

    const success = await ideas.add({
      ...taskData,
      dueDate,
      completed: false,
      entryDate: new Date().toISOString(),
      userId: user.current.$id,
      userName: user.current.name,
    });

    if (success) {
      toast.success("Task added successfully!");
    } else {
      toast.error("Failed to add task");
    }

    return success;
  };

  const handleToggleComplete = async (taskId) => {
    const task = ideas.current.find(t => t.$id === taskId);
    if (!task) return;

    // Prevent duplicate calls using state-based debouncing
    if (processingTasks.has(taskId)) return;
    
    const newCompletedState = !task.completed;
    
    // Mark task as processing to prevent duplicates
    setProcessingTasks(prev => new Set([...prev, taskId]));
    
    try {
      const success = await ideas.toggleComplete(taskId);

      if (success) {
        if (newCompletedState) {
          // Check if we recently showed a notification for this task
          const now = Date.now();
          const lastNotification = recentCompletions.current.get(taskId);
          
          // If we showed a notification for this task within the last 2 seconds, skip it
          if (lastNotification && (now - lastNotification) < 2000) {
            // Still need to cleanup processing state
            setProcessingTasks(prev => {
              const newSet = new Set(prev);
              newSet.delete(taskId);
              return newSet;
            });
            return;
          }
          
          // Record this notification time
          recentCompletions.current.set(taskId, now);
          
          // Clean up old entries (older than 10 seconds)
          for (const [id, time] of recentCompletions.current.entries()) {
            if (now - time > 10000) {
              recentCompletions.current.delete(id);
            }
          }
          
          // Enhanced notification for task completion
          let message = "🎉 Task completed!";
          
          // Add recurring task information if applicable
          if (task.recurrence) {
            const isBirthdayTask = task.tags?.includes('birthday') || 
                                 task.title?.toLowerCase().includes('birthday') ||
                                 task.tags?.includes('anniversary') ||
                                 task.title?.toLowerCase().includes('anniversary');
            
            const isDateSensitiveTask = isBirthdayTask || 
                                      task.tags?.includes('bills') ||
                                      task.tags?.includes('rent') ||
                                      task.tags?.includes('mortgage') ||
                                      task.title?.toLowerCase().includes('rent') ||
                                      task.title?.toLowerCase().includes('mortgage') ||
                                      task.title?.toLowerCase().includes('bill') ||
                                      task.title?.toLowerCase().includes('payment') ||
                                      task.title?.toLowerCase().includes('due');
            
            if (isDateSensitiveTask && task.dueDate) {
              const dueDate = new Date(task.dueDate);
              let nextDate;
              
              // Calculate next date based on recurrence pattern
              switch (task.recurrence) {
                case 'monthly':
                  nextDate = new Date(dueDate);
                  nextDate.setMonth(nextDate.getMonth() + 1);
                  break;
                case 'quarterly':
                  nextDate = new Date(dueDate);
                  nextDate.setMonth(nextDate.getMonth() + 3);
                  break;
                case 'yearly':
                default:
                  nextDate = new Date(dueDate);
                  nextDate.setFullYear(nextDate.getFullYear() + 1);
                  break;
              }
              
              const nextDateStr = nextDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });
              
              if (isBirthdayTask) {
                message = `🎂 ${task.title} completed! Next reminder: ${nextDateStr}`;
              } else {
                message = `💳 ${task.title} completed! Next due: ${nextDateStr}`;
              }
            } else {
              // Regular recurring task
              const recurrenceMap = {
                'daily': 'tomorrow',
                'weekly': 'next week',
                'biweekly': 'in 2 weeks',
                'monthly': 'next month',
                'quarterly': 'in 3 months',
                'yearly': 'next year'
              };
              const nextTime = recurrenceMap[task.recurrence] || `next ${task.recurrence}`;
              message = `🔄 Task completed! Next occurrence: ${nextTime}`;
            }
          }
          
          // Dismiss any existing notifications for this task pattern
          toast.dismiss(`task-complete-${taskId}`);
          toast.dismiss(`task-error-${taskId}`);
          toast.dismiss(`task-reopen-${taskId}`);
          
          // Add slight delay to ensure cleanup
          setTimeout(() => {
            toast.success(message, {
              id: `task-complete-${taskId}`,
              ...toastConfig.success,
            });
          }, 50);
          triggerCelebration();
        } else {
          toast.success("Task reopened", {
            id: `task-reopen-${taskId}`,
            duration: 2000,
          });
        }
      } else {
        toast.error("Failed to update task", {
          id: `task-error-${taskId}`,
          ...toastConfig.error,
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error("Failed to update task", {
        id: `task-error-${taskId}`,
        ...toastConfig.error,
      });
    } finally {
      // Always remove task from processing set
      setProcessingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditTags(task.tags || []);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
    setEditRecurrence(task.recurrence || "");
    setEditCustomTagInput("");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;

    // Auto-assign today's date to recurring tasks if no due date is set
    let finalEditDueDate = editDueDate || null;
    if (!finalEditDueDate && editRecurrence) {
      finalEditDueDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    }

    // Check if this is a duplicate operation (no $id means it's a new task)
    if (!editingTask.$id) {
      // This is a duplicate - create new task
      const success = await ideas.add({
        title: editTitle.trim(),
        description: editDescription.trim(),
        tags: editTags,
        dueDate: finalEditDueDate,
        recurrence: editRecurrence || null,
        completed: false,
        entryDate: new Date().toISOString(),
        userId: user.current.$id,
        userName: user.current.name,
      });

      if (success) {
        toast.success("Task duplicated successfully!");
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to duplicate task");
      }
    } else {
      // This is an update - modify existing task
      const success = await ideas.update(editingTask.$id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        tags: editTags,
        dueDate: finalEditDueDate,
        recurrence: editRecurrence || null,
      });

      if (success) {
        toast.success("Task updated successfully!");
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update task");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    setDeleteModalOpen(true);
    setDeleteId(taskId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const success = await ideas.remove(deleteId);
      if (success) {
        toast.success("Task deleted successfully!");
      } else {
        toast.error("Failed to delete task");
      }
    }
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleQuickDateUpdate = async (taskId, dateType) => {
    const task = ideas.current.find(t => t.$id === taskId);
    if (!task) return;

    let dueDate = new Date();
    
    if (dateType === 'today') {
      dueDate.setHours(23, 59, 0, 0);
    } else if (dateType === 'tomorrow') {
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(23, 59, 0, 0);
    } else if (dateType === 'week') {
      dueDate.setDate(dueDate.getDate() + 7);
      dueDate.setHours(23, 59, 0, 0);
    } else if (dateType === 'month') {
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setHours(23, 59, 0, 0);
    } else if (dateType === 'weekend') {
      // Calculate days until Friday (day 5, where 0=Sunday)
      const currentDay = dueDate.getDay()
      let daysUntilFriday = 5 - currentDay
      
      // If today is Friday or after (Sat/Sun), get next Friday
      if (daysUntilFriday <= 0) {
        daysUntilFriday += 7
      }
      
      dueDate.setDate(dueDate.getDate() + daysUntilFriday)
      dueDate.setHours(18, 0, 0, 0) // 6:00 PM
    }

    const success = await ideas.update(taskId, {
      dueDate: dueDate.toISOString().slice(0, 16)
    });

    if (success) {
      const messageMap = {
        'today': 'today',
        'tomorrow': 'tomorrow', 
        'week': 'in a week',
        'month': 'in a month',
        'weekend': 'this weekend (Friday 6pm)'
      };
      toast.success(`Due date updated to ${messageMap[dateType] || dateType}`);
    } else {
      toast.error("Failed to update due date");
    }
  };

  const handleCustomTagAdd = (e, isEdit = false, isDetail = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = isEdit ? editCustomTagInput : isDetail ? detailCustomTagInput : '';
      const tag = input.trim().toLowerCase();
      if (tag) {
        if (isEdit) {
          if (!editTags.includes(tag)) {
            setEditTags([...editTags, tag]);
          }
          setEditCustomTagInput("");
        } else if (isDetail) {
          if (!detailTags.includes(tag)) {
            setDetailTags([...detailTags, tag]);
          }
          setDetailCustomTagInput("");
        }
      }
    }
  };

  const handleOpenDetailModal = (task) => {
    setDetailTask(task);
    setDetailTitle(task.title);
    setDetailDescription(task.description || "");
    setDetailTags(task.tags || []);
    setDetailDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
    setDetailRecurrence(task.recurrence || "");
    setDetailCustomTagInput("");
    setDetailLocked(true);
    setDetailModalOpen(true);
  };

  const handleSaveDetailChanges = async () => {
    if (!detailTask || !detailTitle.trim()) return;

    let finalDueDate = detailDueDate || null;
    if (!finalDueDate && detailRecurrence) {
      finalDueDate = new Date().toISOString().split('T')[0];
    }

    const success = await ideas.update(detailTask.$id, {
      title: detailTitle.trim(),
      description: detailDescription.trim(),
      tags: detailTags,
      dueDate: finalDueDate,
      recurrence: detailRecurrence || null,
    });

    if (success) {
      toast.success("Task updated successfully!");
      setDetailLocked(true);
    } else {
      toast.error("Failed to update task");
    }
  };

  const handleDuplicateTask = () => {
    if (!detailTask) return;
    
    // Open the edit modal with pre-filled data for duplication (no $id means it's a new task)
    setEditingTask({
      title: detailTitle.trim() + " (Copy)",
      description: detailDescription.trim(),
      tags: detailTags,
      dueDate: detailDueDate || null,
      recurrence: detailRecurrence || null,
      // No $id means this is a duplicate operation
    });
    setEditTitle(detailTitle.trim() + " (Copy)");
    setEditDescription(detailDescription.trim());
    setEditTags(detailTags);
    setEditDueDate(detailDueDate || "");
    setEditRecurrence(detailRecurrence || "");
    setEditCustomTagInput("");
    setIsEditModalOpen(true);
    setDetailModalOpen(false);
  };

  // Bulk upload functionality
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

  const handleBulkUpload = async () => {
    try {
      const tasksArray = getTaskPreview(bulkTasksInput).map(task => {
        let tags = [...task.tags];
        
        // Shopping has priority - add it first if checked
        if (isShoppingList) {
          tags.push('shopping');
        }
        
        // Add common tag if provided
        if (commonTag.trim()) {
          const cleanTag = commonTag.trim().toLowerCase().replace(/\s+/g, '');
          if (!tags.includes(cleanTag)) {
            tags.push(cleanTag);
          }
        }
        
        return { ...task, tags };
      });

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
        toast.success(`Successfully added ${successCount} tasks!`, {
          id: `bulk-upload-success`,
          ...toastConfig.success,
        });
        setIsBulkUploadOpen(false);
        setBulkTasksInput("");
        setIsShoppingList(false);
        setCommonTag("");
      }
    } catch (error) {
      toast.error("Failed to create tasks");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 py-2 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Tasks ({filteredTasks.length})</h1>
            
            <div className="flex items-center gap-2">
              {/* Bulk Upload */}
              <button
                onClick={() => setIsBulkUploadOpen(true)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUpload} className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'timeline' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Timeline view"
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('tags')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'tags' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Tag view"
                >
                  Tags
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="List view"
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by title, description, or tags..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Hide Completed */}
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  hideCompleted 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={hideCompleted ? 'Show completed tasks' : 'Hide completed tasks'}
              >
                <FontAwesomeIcon icon={hideCompleted ? faEyeSlash : faEye} className="h-4 w-4" />
                <span className="hidden sm:inline">{hideCompleted ? 'Show Done' : 'Hide Done'}</span>
              </button>

              {/* Shopping List */}
              <button
                onClick={() => setIsShoppingList(!isShoppingList)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isShoppingList
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isShoppingList ? 'Show all tasks' : 'Show shopping list only'}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4" />
                <span className="hidden sm:inline">{isShoppingList ? 'All Tasks' : 'Shopping'}</span>
              </button>
              
              {/* Advanced Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  showFilters || selectedTags.length > 0 || timeFilter || userFilter
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Filters
                  {(selectedTags.length + (timeFilter ? 1 : 0) + (userFilter ? 1 : 0)) > 0 && 
                    ` (${selectedTags.length + (timeFilter ? 1 : 0) + (userFilter ? 1 : 0)})`
                  }
                </span>
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-2 p-2 sm:mt-4 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-4">
              {/* Time Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Time</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'today', label: 'Today', icon: faCalendarDay },
                    { key: 'tomorrow', label: 'Tomorrow', icon: faCalendarPlus },
                    { key: 'overdue', label: 'Overdue', icon: faExclamationTriangle },
                    { key: 'week', label: 'This Week', icon: faCalendarWeek },
                    { key: 'next_week', label: 'Next Week', icon: faCalendarWeek },
                    { key: 'next_month', label: 'Next Month', icon: faCalendar },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => setTimeFilter(timeFilter === key ? null : key)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        timeFilter === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={icon} className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by User</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setUserFilter(userFilter === user.current.$id ? null : user.current.$id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      userFilter === user.current.$id
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUserClock} className="h-3 w-3" />
                    My Tasks
                  </button>
                  {Object.values(uniqueUsers).map((userInfo) => (
                    userInfo.id !== user.current.$id && (
                      <button
                        key={userInfo.id}
                        onClick={() => setUserFilter(userFilter === userInfo.id ? null : userInfo.id)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                          userFilter === userInfo.id
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                        {userInfo.name}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Filter by Tags</h3>
                  <button
                    onClick={() => setShowRecurringInfo(true)}
                    className="text-blue-500 hover:text-blue-600 p-1 rounded"
                    title="Learn about special recurring task tags"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                      <span className="ml-1 text-xs opacity-75">
                        ({ideas.current.filter(task => task.tags?.includes(tag)).length})
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Clear Filters */}
                {(selectedTags.length > 0 || timeFilter || userFilter) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedTags([]);
                        setTimeFilter(null);
                        setUserFilter(null);
                      }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-2 py-3 sm:px-4 sm:py-6">
        {/* Task Layout - Timeline, Tags, or List */}
        {viewMode === 'timeline' || viewMode === 'tags' ? (
          <div className="space-y-3 sm:space-y-6">
            {/* Mobile Navigation - Single Column View */}
            <div className="block lg:hidden">
              {filteredColumns.length > 0 && (
                <div className="space-y-2 sm:space-y-4">
                  {/* Mobile Navigation Header */}
                  <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-2 sm:p-3 shadow-sm">
                    <button
                      onClick={() => navigateColumn(-1)}
                      disabled={currentColumnIndex === 0}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                    </button>
                    
                    <div className="text-center flex-1 mx-4">
                      <div className="text-sm font-bold text-gray-900">
                        {filteredColumns[currentColumnIndex]?.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {filteredColumns[currentColumnIndex]?.subtitle}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ({filteredColumns[currentColumnIndex]?.tasks?.length || 0} task{filteredColumns[currentColumnIndex]?.tasks?.length !== 1 ? 's' : ''}) • {currentColumnIndex + 1} of {filteredColumns.length}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigateColumn(1)}
                      disabled={currentColumnIndex === filteredColumns.length - 1}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Column Content */}
                  <div className="w-full">
                    {(() => {
                      const column = filteredColumns[currentColumnIndex];
                      if (!column) return null;
                      
                      const getAddTaskHandler = () => {
                        if (column.isTag && column.tagName) {
                          return (taskData) => handleAddTask({
                            ...taskData,
                            tags: [...(taskData.tags || []), column.tagName]
                          });
                        }
                        return column.targetDate ? 
                          (taskData) => handleAddTask(taskData, column.targetDate) : 
                          handleAddTask;
                      };
                      
                      return (
                        <TimelineColumn
                          title={column.title}
                          subtitle={column.subtitle}
                          tasks={column.tasks}
                          onAddTask={getAddTaskHandler()}
                          type={column.key}
                          targetDate={column.targetDate}
                          isToday={column.isToday}
                          isOverdue={column.isOverdue}
                          processingTasks={processingTasks}
                          hideMobileHeader={true}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onQuickDateUpdate={handleQuickDateUpdate}
                          onOpenDetail={handleOpenDetailModal}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop/Tablet Layout - All Columns */}
            <div className="hidden lg:block">
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-4">
                {filteredColumns.map((column) => {
                  const getAddTaskHandler = () => {
                    if (column.isTag && column.tagName) {
                      return (taskData) => handleAddTask({
                        ...taskData,
                        tags: [...(taskData.tags || []), column.tagName]
                      });
                    }
                    return column.targetDate ? 
                      (taskData) => handleAddTask(taskData, column.targetDate) : 
                      handleAddTask;
                  };
                  
                  return (
                    <TimelineColumn
                      key={column.key}
                      title={column.title}
                      subtitle={column.subtitle}
                      tasks={column.tasks}
                      onAddTask={getAddTaskHandler()}
                      type={column.key}
                      targetDate={column.targetDate}
                      isToday={column.isToday}
                      isOverdue={column.isOverdue}
                      processingTasks={processingTasks}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onQuickDateUpdate={handleQuickDateUpdate}
                      onOpenDetail={handleOpenDetailModal}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Tasks</h2>
              <QuickAddTask onAdd={(taskData) => handleAddTask(taskData)} placeholder="Add new task..." />
            </div>
            <div className="grid gap-3">
              {filteredTasks.length > 0 ? (
                filteredTasks
                  .sort((a, b) => {
                    // Sort by completion status first
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    // Then by due date
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate) - new Date(b.dueDate);
                    }
                    if (a.dueDate && !b.dueDate) return -1;
                    if (!a.dueDate && b.dueDate) return 1;
                    // Finally by created date
                    return new Date(b.entryDate || 0) - new Date(a.entryDate || 0);
                  })
                  .map((task) => (
                    <TaskItem
                      key={task.$id}
                      task={task}
                      isProcessing={processingTasks.has(task.$id)}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onQuickDateUpdate={handleQuickDateUpdate}
                      onOpenDetail={handleOpenDetailModal}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No tasks match your current filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Bulk Upload Tasks</h3>
                <button
                  onClick={() => {
                    setIsBulkUploadOpen(false);
                    setBulkTasksInput("");
                    setIsShoppingList(false);
                    setCommonTag("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                    rows="8"
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
                      <span className="font-medium text-green-700">Tag all tasks as shopping items</span>
                    </label>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Common Tag (optional)
                    </label>
                    <input
                      type="text"
                      value={commonTag}
                      onChange={(e) => setCommonTag(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="e.g., movieday, vacation, workout"
                      maxLength="20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add a tag that will be applied to all tasks in this upload
                    </p>
                  </div>
                  
                  {bulkTasksInput && (
                    <div className="mt-3 space-y-2">
                      <div className="font-medium text-gray-700 text-sm">
                        Preview ({getTaskPreview(bulkTasksInput).length} tasks):
                      </div>
                      <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                        {getTaskPreview(bulkTasksInput).map((task, index) => (
                          <div key={index} className="text-xs text-gray-600 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{index + 1}.</span>
                              <span className="truncate">{task.title}</span>
                            </div>
                            <div className="ml-6 flex gap-1 flex-wrap">
                              {task.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px]">
                                  {tag}
                                </span>
                              ))}
                              {isShoppingList && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-medium">
                                  shopping
                                </span>
                              )}
                              {commonTag.trim() && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px]">
                                  {commonTag.trim().toLowerCase().replace(/\s+/g, '')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBulkUpload}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={getTaskPreview(bulkTasksInput).length === 0}
                  >
                    Upload {getTaskPreview(bulkTasksInput).length} Tasks
                  </button>
                  <button
                    onClick={() => {
                      setIsBulkUploadOpen(false);
                      setBulkTasksInput("");
                      setIsShoppingList(false);
                      setCommonTag("");
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTask && !editingTask.$id ? "Duplicate Task" : "Edit Task"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editTags.map((tag) => (
                      <TaskTag
                        key={tag}
                        tag={tag}
                        onRemove={(tagToRemove) => setEditTags(editTags.filter(t => t !== tagToRemove))}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editCustomTagInput}
                    onChange={(e) => setEditCustomTagInput(e.target.value)}
                    onKeyDown={(e) => handleCustomTagAdd(e, true)}
                    placeholder="Add tags (press Enter)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repeat
                    </label>
                    <select
                      value={editRecurrence}
                      onChange={(e) => setEditRecurrence(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">No repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>

                    {/* Recurring task notice */}
                    {editRecurrence && !editDueDate && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mt-2">
                        💡 This recurring task will be scheduled for today
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingTask && !editingTask.$id ? "Create Duplicate" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Task Info Modal */}
      {showRecurringInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                  Recurring Task Scheduling Guide
                </h3>
                <button
                  onClick={() => setShowRecurringInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Date-Sensitive Tasks */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    🎂 Date-Sensitive Tasks (Use Original Date)
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-gray-700">
                      These tasks always reschedule to the same date, regardless of when you complete them:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Special Tags:</h5>
                        <div className="space-y-1">
                          {['birthday', 'anniversary', 'bills', 'rent', 'mortgage'].map(tag => (
                            <div key={tag} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {tag}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Title Keywords:</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>• "birthday" or "anniversary"</div>
                          <div>• "rent", "mortgage", or "bill"</div>
                          <div>• "payment" or "due"</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-gray-600">
                        <strong>Example:</strong> "Mom's Birthday" due Jan 15th → Always reschedules to Jan 15th next year, 
                        even if completed late.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regular Tasks */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    📅 Regular Tasks (Use Completion Date)
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-gray-700">
                      These tasks reschedule based on when you complete them, allowing flexible timing:
                    </p>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-green-400">
                      <p className="text-sm text-gray-600">
                        <strong>Example:</strong> "Clean garage" (weekly) completed on Wednesday → 
                        Next occurrence scheduled for next Wednesday.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recurrence Patterns */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">📊 Recurrence Patterns</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><strong>Daily:</strong> Every day</div>
                      <div><strong>Weekly:</strong> Every 7 days</div>
                      <div><strong>Biweekly:</strong> Every 14 days</div>
                      <div><strong>Monthly:</strong> Same date next month</div>
                      <div><strong>Quarterly:</strong> Every 3 months</div>
                      <div><strong>Yearly:</strong> Same date next year</div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Use #birthday or #anniversary tags for special dates</li>
                    <li>• Use #bills for payments that must stay on specific dates</li>
                    <li>• Regular tasks without special tags are flexible with timing</li>
                    <li>• Yearly tasks handle leap years automatically (Feb 29 → Feb 28)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowRecurringInfo(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailModalOpen && detailTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailLocked(!detailLocked)}
                  className={`p-2 rounded-lg transition-colors ${
                    detailLocked 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title={detailLocked ? 'Click to unlock and edit' : 'Click to lock'}
                >
                  <FontAwesomeIcon icon={detailLocked ? faLock : faLockOpen} className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setDetailLocked(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Status Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleComplete(detailTask.$id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              detailTask.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {detailTask.completed && <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />}
                          </button>
                          <span className="text-sm font-medium text-gray-700">
                            {detailTask.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(detailTask.entryDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={detailTitle}
                        onChange={(e) => setDetailTitle(e.target.value)}
                        disabled={detailLocked}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                          detailLocked 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Enter task title"
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={detailDescription}
                        onChange={(e) => setDetailDescription(e.target.value)}
                        disabled={detailLocked}
                        rows="3"
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${
                          detailLocked 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Add a detailed description..."
                      />
                    </div>

                    {/* Due Date and Recurrence */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          value={detailDueDate}
                          onChange={(e) => setDetailDueDate(e.target.value)}
                          disabled={detailLocked}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            detailLocked 
                              ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recurrence
                        </label>
                        <select
                          value={detailRecurrence}
                          onChange={(e) => setDetailRecurrence(e.target.value)}
                          disabled={detailLocked}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            detailLocked 
                              ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        >
                          <option value="">No repeat</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>

                    {/* Recurring task notice */}
                    {detailRecurrence && !detailDueDate && !detailLocked && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="h-3 w-3" />
                        <span>This recurring task will be scheduled for today</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {detailTags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {tag}
                            {!detailLocked && (
                              <button
                                onClick={() => setDetailTags(detailTags.filter(t => t !== tag))}
                                className="ml-1 text-current hover:text-red-600"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {!detailLocked && (
                        <>
                          <input
                            type="text"
                            value={detailCustomTagInput}
                            onChange={(e) => setDetailCustomTagInput(e.target.value)}
                            onKeyDown={(e) => handleCustomTagAdd(e, false, true)}
                            placeholder="Add tags (press Enter)"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                          />
                          <div className="flex flex-wrap gap-1">
                            {PREDEFINED_TAGS.filter(tag => !detailTags.includes(tag)).slice(0, 8).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (!detailTags.includes(tag)) {
                                    setDetailTags([...detailTags, tag]);
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Created by:</span> {detailTask.userName || 'Unknown'}
                      </div>
                      {detailTask.$updatedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(detailTask.$updatedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!detailLocked ? (
                      <>
                        <button
                          onClick={handleSaveDetailChanges}
                          disabled={!detailTitle.trim()}
                          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setDetailTitle(detailTask.title);
                            setDetailDescription(detailTask.description || "");
                            setDetailTags(detailTask.tags || []);
                            setDetailDueDate(detailTask.dueDate ? new Date(detailTask.dueDate).toISOString().slice(0, 16) : "");
                            setDetailRecurrence(detailTask.recurrence || "");
                            setDetailLocked(true);
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleDuplicateTask}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                          Duplicate Task
                        </button>
                        <button
                          onClick={() => {
                            setDetailModalOpen(false);
                            handleDeleteTask(detailTask.$id);
                          }}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Delete Task
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
