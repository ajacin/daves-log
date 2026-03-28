import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faTrash,
  faSync,
  faFilter,
  faSearch,
  faEllipsisV,
  faShoppingCart,
  faEye,
  faEyeSlash,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faInfoCircle,
  faUpload,
  faBriefcase,
  faCopy
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

// Format a Date as YYYY-MM-DD in *local* time (not UTC)
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Parse a dueDate string to a local-midnight Date for comparison.
// Handles both "YYYY-MM-DD" and ISO datetime "2026-03-01T00:00:00.000+00:00".
// IMPORTANT: Always extract the date portion from the string directly,
// never through new Date() which applies timezone conversion.
// e.g. "2026-03-01T00:00:00.000+00:00" in EST becomes Feb 28 7pm via new Date(),
// but the intended date is Mar 1 — so we split on 'T' and parse the date part.
const parseDueDateToLocal = (dueDateStr) => {
  if (!dueDateStr) return null;
  try {
    // Extract just the YYYY-MM-DD portion, whether it's a plain date or ISO datetime
    const datePart = dueDateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return null;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
};

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
          className="text-td-muted hover:text-td-text underline break-all"
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
  return (
    <span className="inline-flex items-center text-td-xs text-td-faint">
      {tag}
      {!readOnly && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 text-td-faint hover:text-td-text"
        >
          <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}

// Quick Add Task Component — inline, minimal, TeuxDeux-like
function QuickAddTask({ onAdd, placeholder = "Add…" }) {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalDueDate = dueDate || null;
    if (!finalDueDate && recurrence) {
      finalDueDate = toLocalDateString(new Date());
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      tags,
      dueDate: finalDueDate,
      recurrence: recurrence || null,
      subtasks: subtasks.length > 0 ? JSON.stringify(subtasks) : null,
    };

    const success = await onAdd(taskData);
    if (success) {
      setTitle("");
      setDescription("");
      setTags([]);
      setDueDate("");
      setRecurrence("");
      setCustomTagInput("");
      setSubtasks([]);
      setNewSubtaskInput("");
      // Keep focus in input for fast successive entry
      if (!isExpanded) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isExpanded && !e.shiftKey) {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setTitle("");
      setDescription("");
      setTags([]);
      setDueDate("");
      setRecurrence("");
      setCustomTagInput("");
      setSubtasks([]);
      setNewSubtaskInput("");
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
    <div className="border-b border-td-border">
      <form onSubmit={handleSubmit}>
        <div className="py-1.5 px-1">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {}}
            placeholder={placeholder}
            className="w-full text-td-base border-none outline-none bg-transparent placeholder-td-faint"
          />

          {/* Expand link */}
          {title.trim() && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-td-xs text-td-faint hover:text-td-muted mt-0.5"
            >
              + details
            </button>
          )}

          {isExpanded && (
            <div className="mt-2 space-y-2 pb-1">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description…"
                className="w-full text-td-sm border-b border-td-border bg-transparent p-0 resize-none outline-none placeholder-td-faint"
                rows="2"
              />

              {/* Tags */}
              <div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center text-td-xs text-td-muted">
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTags(tags.filter(t => t !== tag));
                          }}
                          className="ml-0.5 text-td-faint hover:text-td-text"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagAdd}
                  placeholder="Tag (enter to add)"
                  className="w-full text-td-xs border-b border-td-border bg-transparent py-0.5 outline-none placeholder-td-faint"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagAdd(tag)}
                      className="text-td-xs text-td-faint hover:text-td-muted"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date and Recurrence */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 text-td-xs border-b border-td-border bg-transparent py-0.5 outline-none"
                />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="flex-1 text-td-xs border-b border-td-border bg-transparent py-0.5 outline-none"
                >
                  <option value="">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurrence && !dueDate && (
                <div className="text-td-xs text-td-muted">
                  Recurring — starts today
                </div>
              )}

              {/* Subtasks / Checklist */}
              <div>
                <label className="text-td-xs text-td-muted">Checklist</label>
                {subtasks.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {subtasks.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => {
                            const updated = [...subtasks];
                            updated[idx] = { ...updated[idx], done: !updated[idx].done };
                            setSubtasks(updated);
                          }}
                          className="h-3 w-3 accent-current flex-shrink-0"
                        />
                        <span className={`text-td-xs flex-1 ${item.done ? 'line-through text-td-faint' : 'text-td-text'}`}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                          className="text-td-faint hover:text-td-text"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const text = newSubtaskInput.trim();
                      if (text) {
                        setSubtasks([...subtasks, { text, done: false }]);
                        setNewSubtaskInput("");
                      }
                    }
                  }}
                  placeholder="Add item (enter)"
                  className="w-full text-td-xs border-b border-td-border bg-transparent py-0.5 mt-1 outline-none placeholder-td-faint"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-1">
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
                    setSubtasks([]);
                    setNewSubtaskInput("");
                  }}
                  className="text-td-xs text-td-faint hover:text-td-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="text-td-xs text-td-text border border-td-border rounded px-2 py-0.5 hover:bg-td-hover disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// Task Row Component — flat row, not a card
function TaskItem({ task, onToggleComplete, onEdit, onDelete, onQuickDateUpdate, onToggleSubtask, isProcessing }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef(null);

  const parsedSubtasks = useMemo(() => {
    if (!task.subtasks) return [];
    try {
      const items = JSON.parse(task.subtasks);
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }, [task.subtasks]);

  const hasExpandableContent = Boolean(task.description?.trim()) || parsedSubtasks.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleContentClick = () => {
    if (!hasExpandableContent) return;
    setIsExpanded((prev) => !prev);
  };

  const handleContentKeyDown = (e) => {
    if (!hasExpandableContent) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    }
  };

  const isOverdue = task.dueDate && (() => {
    const dueDate = parseDueDateToLocal(task.dueDate);
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  })() && !task.completed;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task.$id,
      sourceColumn: task.dueDate || 'unscheduled'
    }));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const formatDate = (dateStr) => {
    try {
      const d = parseDueDateToLocal(dateStr);
      if (!d) return '';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div
      draggable={!task.completed}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-start gap-2 py-1.5 px-2 transition-colors border-b border-td-border ${
        task.completed ? 'opacity-55' : ''
      } ${!task.completed ? 'cursor-move' : 'cursor-default'} ${task.tags?.includes('fs') ? 'border-l-2 border-l-blue-400' : ''} hover:bg-td-hover`}
    >
      {/* Checkbox — small ring */}
      <button
        onClick={() => onToggleComplete(task.$id)}
        disabled={isProcessing}
        className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
          isProcessing
            ? 'opacity-50 cursor-not-allowed border-td-border'
            : task.completed
              ? 'border-td-muted bg-td-muted'
              : 'border-td-border-strong hover:border-td-text'
        }`}
      >
        {task.completed && (
          <FontAwesomeIcon icon={faCheck} className="h-2 w-2 text-white" />
        )}
      </button>

      {/* Main content — tap/click to expand description & checklist */}
      <div
        className={`flex-1 min-w-0 outline-none ${hasExpandableContent ? 'cursor-pointer' : ''}`}
        onClick={handleContentClick}
        onKeyDown={handleContentKeyDown}
        role={hasExpandableContent ? 'button' : undefined}
        tabIndex={hasExpandableContent ? 0 : undefined}
        aria-expanded={hasExpandableContent ? isExpanded : undefined}
        aria-label={hasExpandableContent ? (isExpanded ? 'Collapse task details' : 'Expand task details') : undefined}
      >
        <div className="flex items-start gap-1">
          {hasExpandableContent && (
            <span className="text-td-faint mt-0.5 flex-shrink-0" aria-hidden>
              <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="h-2.5 w-2.5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <span className={`text-td-base ${task.completed ? 'line-through text-td-faint' : 'text-td-text'}`}>
              {task.title}
            </span>
            {/* Inline meta: date + recurrence + tags */}
            {(task.dueDate || (task.tags && task.tags.length > 0)) && (
              <div className="flex items-center gap-2 mt-0.5">
                {task.dueDate && (
                  <span className={`text-td-xs whitespace-nowrap ${isOverdue ? 'text-red-500' : 'text-td-faint'}`}>
                    {formatDate(task.dueDate)}
                    {task.recurrence && (
                      <span className="ml-0.5">
                        <FontAwesomeIcon icon={faSync} className="h-2 w-2" />
                      </span>
                    )}
                  </span>
                )}
                {task.tags && task.tags.length > 0 && (
                  <span className="text-td-xs text-td-faint whitespace-nowrap">
                    <span className="sm:hidden">{task.tags[0]}{task.tags.length > 1 && ` +${task.tags.length - 1}`}</span>
                    <span className="hidden sm:inline">{task.tags.slice(0, 2).join(', ')}{task.tags.length > 2 && ` +${task.tags.length - 2}`}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description — one line collapsed, full when expanded */}
        {task.description && (
          <div
            className={`text-td-xs text-td-faint mt-0.5 ${hasExpandableContent ? 'pl-4' : ''} ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`}
          >
            {renderTextWithLinks(task.description)}
          </div>
        )}

        {/* Subtasks — summary when collapsed, full checklist when expanded */}
        {parsedSubtasks.length > 0 && !isExpanded && (
          <span className="text-td-xs text-td-faint mt-0.5 inline-block pl-4">
            [{parsedSubtasks.filter((i) => i.done).length}/{parsedSubtasks.length} items]
          </span>
        )}
        {isExpanded && parsedSubtasks.length > 0 && onToggleSubtask && (
          <ul
            className="mt-1.5 space-y-1 pl-4 list-none"
            onClick={(e) => e.stopPropagation()}
          >
            {parsedSubtasks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <button
                  type="button"
                  disabled={task.completed || isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubtask(task.$id, idx);
                  }}
                  className={`mt-0.5 w-3.5 h-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                    task.completed || isProcessing ? 'opacity-50 cursor-not-allowed border-td-border' : 'border-td-border-strong hover:border-td-text'
                  } ${item.done ? 'border-td-muted bg-td-muted' : ''}`}
                  aria-label={item.done ? `Mark "${item.text}" not done` : `Mark "${item.text}" done`}
                >
                  {item.done && (
                    <FontAwesomeIcon icon={faCheck} className="h-2 w-2 text-white" />
                  )}
                </button>
                <span className={`text-td-xs flex-1 pt-0.5 ${item.done ? 'line-through text-td-faint' : 'text-td-text'}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Quick actions — visible on hover (desktop) or menu open (mobile) */}
        {!task.completed && (isHovered || isMenuOpen) && (
          <div className="flex gap-2 mt-1 pl-4" onClick={(e) => e.stopPropagation()}>
            {[
              { label: 'Today', key: 'today' },
              { label: 'Tomorrow', key: 'tomorrow' },
              { label: '+7d', key: 'week' },
              { label: '+30d', key: 'month' },
            ].map(({ label, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => onQuickDateUpdate(task.$id, key)}
                className="text-td-xs text-td-faint hover:text-td-text transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3-dot menu — visible on hover */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 text-td-faint hover:text-td-text"
        >
          <FontAwesomeIcon icon={faEllipsisV} className="h-3 w-3" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-5 bg-white border border-td-border z-10 py-0.5 min-w-[80px]">
            <button
              onClick={() => { onEdit(task); setIsMenuOpen(false); }}
              className="w-full text-left px-2 py-1 text-td-sm text-td-text hover:bg-td-hover flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faEdit} className="h-2.5 w-2.5 text-td-muted" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(task.$id); setIsMenuOpen(false); }}
              className="w-full text-left px-2 py-1 text-td-sm text-red-500 hover:bg-td-hover flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Timeline Column Component — minimal, grid-like
function TimelineColumn({ title, subtitle, tasks, onAddTask, type, targetDate, isToday = false, isOverdue = false, processingTasks, hideMobileHeader = false, onTaskDrop, showWorkSection = false, ...taskActions }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fsTasks = showWorkSection ? tasks.filter(t => t.tags?.includes('fs')) : [];
  const regularTasks = showWorkSection ? tasks.filter(t => !t.tags?.includes('fs')) : tasks;

  const handleAddTask = async (taskData) => {
    if (type === 'unscheduled') {
      return await onAddTask(taskData);
    }
    return await onAddTask(taskData, targetDate);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId } = data;
      if (onTaskDrop) {
        await onTaskDrop(taskId, type, targetDate);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div
      className={`flex-1 min-w-[220px] w-full bg-td-bg border-r border-td-border last:border-r-0 transition-colors ${
        isDragOver ? 'bg-td-hover' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      {!hideMobileHeader && (
        <div className="px-3 py-2 border-b border-td-border">
          <div className="text-td-header uppercase font-medium text-td-muted tracking-wider">
            {title}
          </div>
          {subtitle && (
            <div className="text-td-xs text-td-faint">
              {subtitle}
            </div>
          )}
          <div className="text-td-xs text-td-faint">
            {tasks.length}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`min-h-[300px] max-h-[calc(100vh-140px)] overflow-y-auto ${hideMobileHeader ? 'pt-2' : ''}`}>
        {/* Inline Add */}
        <QuickAddTask
          onAdd={handleAddTask}
          placeholder="Add…"
        />

        {/* Pinned Work Section */}
        {showWorkSection && fsTasks.length > 0 && (
          <div className="border-b-2 border-blue-400/30 pb-1 mb-1">
            <div className="px-3 pt-1 pb-0.5">
              <span className="text-[10px] uppercase font-medium text-blue-400 tracking-wider">Work</span>
            </div>
            {fsTasks.map((task) => (
              <TaskItem
                key={task.$id}
                task={task}
                isProcessing={processingTasks?.has(task.$id)}
                {...taskActions}
              />
            ))}
          </div>
        )}

        {/* Task List */}
        {regularTasks.map((task) => (
          <TaskItem
            key={task.$id}
            task={task}
            isProcessing={processingTasks?.has(task.$id)}
            {...taskActions}
          />
        ))}

        {tasks.length === 0 && (
          <div className="py-8 px-3 text-td-faint text-td-xs text-center">
            No tasks
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
  const [showTimezoneWarning, setShowTimezoneWarning] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeFilter, setTimeFilter] = useState(null); // 'today', 'tomorrow', 'overdue', 'week', 'next_week', 'next_month'
  const [userFilter, setUserFilter] = useState(null);
  const [isShoppingList, setIsShoppingList] = useState(false);
  const [showWorkSection, setShowWorkSection] = useState(false);
  const [commonTag, setCommonTag] = useState("");
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'tags', or 'list'
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkTasksInput, setBulkTasksInput] = useState("");
  const [bulkUploadMode, setBulkUploadMode] = useState('text');
  const [jsonInput, setJsonInput] = useState("");
  const [jsonParsedTasks, setJsonParsedTasks] = useState([]);
  const [jsonError, setJsonError] = useState("");
  const [jsonPromptCopied, setJsonPromptCopied] = useState(false);
  const jsonFileInputRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editDueDate, setEditDueDate] = useState("");
  const [editRecurrence, setEditRecurrence] = useState("");
  const [editCustomTagInput, setEditCustomTagInput] = useState("");
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [showRecurringInfo, setShowRecurringInfo] = useState(false);
  
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

  // Check for timezone/date shift issues
  const checkForTimezoneIssues = useCallback(() => {
    if (!ideas.current || ideas.current.length === 0) return false;

    let hasIssues = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    ideas.current.forEach(task => {
      if (task.dueDate) {
        try {
          // Check if task due date parsing creates unexpected results
          const dueDate1 = new Date(task.dueDate);
          const dueDate2 = new Date(task.dueDate + 'T00:00:00');
          
          // If the dates differ by a day, there's likely a timezone issue
          const diff = Math.abs(dueDate1.getTime() - dueDate2.getTime());
          if (diff >= 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
            hasIssues = true;
          }

          // Also check for "Invalid Date" scenarios
          if (isNaN(dueDate1.getTime()) || task.dueDate.includes('Invalid')) {
            hasIssues = true;
          }
        } catch (error) {
          hasIssues = true;
        }
      }
    });

    return hasIssues;
  }, [ideas]);

  // Check for timezone issues whenever tasks change
  useEffect(() => {
    const hasIssues = checkForTimezoneIssues();
    setShowTimezoneWarning(hasIssues);
  }, [checkForTimezoneIssues]);

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
        const taskDate = parseDueDateToLocal(task.dueDate || task.entryDate) || new Date(0);
        
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

        const dueDate = parseDueDateToLocal(task.dueDate);
        if (!dueDate) {
          periods.unscheduled.push(task);
          return;
        }

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

  // Mobile navigation functions
  const navigateColumn = (direction) => {
    const newIndex = currentColumnIndex + direction;
    if (newIndex >= 0 && newIndex < currentColumns.length) {
      setCurrentColumnIndex(newIndex);
    }
  };

  // Swipe gesture for mobile column navigation
  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigateColumn(dx < 0 ? 1 : -1);
    }
    touchStartRef.current = null;
  };

  // Reset column index when view mode changes
  useEffect(() => {
    setCurrentColumnIndex(0);
  }, [viewMode]);

  // Task actions
  const handleAddTask = async (taskData, targetDate = null) => {
    let dueDate = taskData.dueDate;
    
    if (targetDate instanceof Date) {
      const date = new Date(targetDate);
      dueDate = toLocalDateString(date);
    } else if (targetDate === 'today') {
      const date = new Date();
      dueDate = toLocalDateString(date);
    } else if (targetDate === 'tomorrow') {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      dueDate = toLocalDateString(date);
    }

    const success = await ideas.add({
      ...taskData,
      dueDate,
      completed: false,
      entryDate: new Date().toISOString(),
      userId: user.current.$id,
      userName: user.current.name,
    }, { source: 'manual' });

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

    // Block completion if there are unfinished subtasks
    if (newCompletedState && task.subtasks) {
      try {
        const items = JSON.parse(task.subtasks);
        const unfinished = items.filter(st => !st.done);
        if (unfinished.length > 0) {
          toast.error(`Complete all subtasks first (${unfinished.length} remaining)`, { id: `subtask-block-${taskId}` });
          return;
        }
      } catch { /* ignore parse errors */ }
    }
    
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
              try {
                const dueDate = parseDueDateToLocal(task.dueDate);
                if (!dueDate) {
                  message = "🎉 Task completed!";
                } else {
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
                }
              } catch (error) {
                console.error('Error processing date for notification:', error);
                message = "🎉 Task completed!";
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
          
          toast((t) => (
            <div className="flex items-center gap-3">
              <span className="text-sm">{message}</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  ideas.update(taskId, { completed: false, completedAt: null }, { source: 'undo' });
                  setTimeout(() => {
                    const toastId = `task-reopen-${taskId}`;
                    toast.success("Task reopened", { id: toastId, duration: 2000 });
                    setTimeout(() => toast.dismiss(toastId), 2000);
                  }, 100);
                }}
                className="text-sm font-bold underline whitespace-nowrap"
              >
                Undo
              </button>
            </div>
          ), {
            id: `task-complete-${taskId}`,
            duration: 5000,
            style: toastConfig.success.style,
          });
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

  const handleToggleSubtask = async (taskId, index) => {
    const task = ideas.current.find((t) => t.$id === taskId);
    if (!task?.subtasks) return;
    let items;
    try {
      items = JSON.parse(task.subtasks);
    } catch {
      return;
    }
    if (!Array.isArray(items) || index < 0 || index >= items.length) return;
    const next = items.map((st, i) =>
      (i === index ? { ...st, done: !st.done } : st)
    );
    const success = await ideas.update(taskId, { subtasks: JSON.stringify(next) }, { source: 'task-item-subtask' });
    if (!success) {
      toast.error('Failed to update checklist', { duration: 2500 });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditTags(task.tags || []);
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : "");
    setEditRecurrence(task.recurrence || "");
    setEditCustomTagInput("");
    setEditSubtasks(task.subtasks ? JSON.parse(task.subtasks) : []);
    setNewSubtaskText("");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;

    // Auto-assign today's date to recurring tasks if no due date is set
    let finalEditDueDate = editDueDate || null;
    if (!finalEditDueDate && editRecurrence) {
      finalEditDueDate = toLocalDateString(new Date());
    }

    const success = await ideas.update(editingTask.$id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags: editTags,
      dueDate: finalEditDueDate,
      recurrence: editRecurrence || null,
      subtasks: editSubtasks.length > 0 ? JSON.stringify(editSubtasks) : null,
    }, { source: 'edit-modal' });

    if (success) {
      toast.success("Task updated successfully!");
      setIsEditModalOpen(false);
    } else {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const success = await ideas.remove(taskId, { source: 'manual-delete' });
    if (success) {
      toast.success("Task deleted successfully!");
    } else {
      toast.error("Failed to delete task");
    }
  };

  const handleQuickDateUpdate = async (taskId, dateType) => {
    const task = ideas.current.find(t => t.$id === taskId);
    if (!task) return;

    let dueDate = new Date();
    
    if (dateType === 'today') {
      // Keep current date
    } else if (dateType === 'tomorrow') {
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (dateType === 'week') {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (dateType === 'month') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else if (dateType === 'weekend') {
      const daysUntilSaturday = (6 - dueDate.getDay() + 7) % 7;
      dueDate.setDate(dueDate.getDate() + daysUntilSaturday);
    }

    const success = await ideas.update(taskId, {
      dueDate: toLocalDateString(dueDate)
    }, { source: 'quick-date', dateType });

    if (success) {
      const messageMap = {
        'today': 'today',
        'tomorrow': 'tomorrow',
        'week': 'in a week',
        'month': 'in a month',
        'weekend': 'this weekend'
      };
      toast.success(`Due date updated to ${messageMap[dateType] || dateType}`);
    } else {
      toast.error("Failed to update due date");
    }
  };

  const handleTaskDrop = async (taskId, columnType, targetDate) => {
    console.log('🚀 handleTaskDrop called:', { taskId, columnType, targetDate });
    
    const task = ideas.current.find(t => t.$id === taskId);
    if (!task) {
      console.error('❌ Task not found:', taskId);
      return;
    }

    console.log('📋 Current task:', { title: task.title, currentDueDate: task.dueDate });

    let newDueDate = null;

    // Determine the new due date based on the column type
    if (columnType === 'unscheduled') {
      newDueDate = null; // Unscheduled tasks have no due date
    } else if (columnType === 'today') {
      const today = new Date();
      newDueDate = toLocalDateString(today);
    } else if (columnType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      newDueDate = toLocalDateString(tomorrow);
    } else if (columnType === 'dayAfterTomorrow') {
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      newDueDate = toLocalDateString(dayAfter);
    } else if (columnType === 'overdue') {
      // For overdue column, set to yesterday to make it overdue
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newDueDate = toLocalDateString(yesterday);
    } else if (targetDate) {
      // For specific date columns, use the target date
      if (targetDate instanceof Date) {
        newDueDate = toLocalDateString(targetDate);
      } else if (typeof targetDate === 'string') {
        newDueDate = targetDate.split('T')[0]; // Handle both date and datetime strings
      }
    } else {
      // For columns without specific target dates (remainingWeek, future), keep current date or set to today
      console.log('⚠️ No target date for column type:', columnType);
      const today = new Date();
      newDueDate = toLocalDateString(today);
    }

    console.log('📅 Calculated newDueDate:', newDueDate);
    console.log('🔄 Comparison:', { current: task.dueDate, new: newDueDate, same: task.dueDate === newDueDate });

    // Don't update if the date is the same
    if (task.dueDate === newDueDate) {
      console.log('⏭️ Skipping update - dates are the same');
      return;
    }

    console.log('💾 Updating task with new due date...');
    const success = await ideas.update(taskId, {
      dueDate: newDueDate
    }, { source: 'drag-drop', columnType });

    console.log('✅ Update result:', success);

    if (success) {
      const columnName = columnType === 'unscheduled' ? 'unscheduled' : 
                        columnType === 'today' ? 'today' :
                        columnType === 'tomorrow' ? 'tomorrow' :
                        columnType === 'dayAfterTomorrow' ? 'day after tomorrow' :
                        columnType === 'overdue' ? 'overdue' :
                        columnType === 'remainingWeek' ? 'this week' :
                        columnType === 'future' ? 'future' :
                        'the selected date';
      toast.success(`Task moved to ${columnName}!`);
    } else {
      toast.error("Failed to move task");
    }
  };

  const handleCustomTagAdd = (e, isEdit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = isEdit ? editCustomTagInput : '';
      const tag = input.trim().toLowerCase();
      if (tag) {
        if (isEdit) {
          if (!editTags.includes(tag)) {
            setEditTags([...editTags, tag]);
          }
          setEditCustomTagInput("");
        }
      }
    }
  };

  // Bulk upload functionality
  const [showBulkSyntaxHelp, setShowBulkSyntaxHelp] = useState(false);
  const [bulkSuggestions, setBulkSuggestions] = useState([]);
  const [bulkSuggestionIndex, setBulkSuggestionIndex] = useState(0);
  const [bulkTrigger, setBulkTrigger] = useState(null); // { type: ':' | '@', start: number, query: '' }
  const bulkTextareaRef = useRef(null);

  const DATE_SUGGESTIONS = [
    { label: ':today', desc: 'Today' },
    { label: ':tomorrow', desc: 'Tomorrow' },
    { label: ':monday', desc: 'Next Monday' },
    { label: ':tuesday', desc: 'Next Tuesday' },
    { label: ':wednesday', desc: 'Next Wednesday' },
    { label: ':thursday', desc: 'Next Thursday' },
    { label: ':friday', desc: 'Next Friday' },
    { label: ':saturday', desc: 'Next Saturday' },
    { label: ':sunday', desc: 'Next Sunday' },
    { label: ':+1d', desc: 'In 1 day' },
    { label: ':+3d', desc: 'In 3 days' },
    { label: ':+7d', desc: 'In 7 days' },
    { label: ':+1w', desc: 'In 1 week' },
    { label: ':+2w', desc: 'In 2 weeks' },
    { label: ':+1m', desc: 'In 1 month' },
    { label: ':+3m', desc: 'In 3 months' },
    { label: ':jan', desc: 'January' },
    { label: ':feb', desc: 'February' },
    { label: ':mar', desc: 'March' },
    { label: ':apr', desc: 'April' },
    { label: ':may', desc: 'May' },
    { label: ':jun', desc: 'June' },
    { label: ':jul', desc: 'July' },
    { label: ':aug', desc: 'August' },
    { label: ':sep', desc: 'September' },
    { label: ':oct', desc: 'October' },
    { label: ':nov', desc: 'November' },
    { label: ':dec', desc: 'December' },
  ];

  const RECURRENCE_SUGGESTIONS = [
    { label: '@daily', desc: 'Every day' },
    { label: '@weekly', desc: 'Every week' },
    { label: '@biweekly', desc: 'Every 2 weeks' },
    { label: '@monthly', desc: 'Every month' },
    { label: '@quarterly', desc: 'Every 3 months' },
    { label: '@yearly', desc: 'Every year' },
  ];

  const handleBulkInputChange = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setBulkTasksInput(value);

    // Find the trigger token being typed at cursor
    const textBeforeCursor = value.slice(0, cursor);
    // Look for : or @ not preceded by a non-space char (so it's the start of a token)
    const triggerMatch = textBeforeCursor.match(/(?:^|[\s])([:|@])([\w+]*)$/);

    if (triggerMatch) {
      const type = triggerMatch[1];
      const query = triggerMatch[2].toLowerCase();
      const start = cursor - triggerMatch[2].length - 1; // position of : or @

      const pool = type === ':' ? DATE_SUGGESTIONS : RECURRENCE_SUGGESTIONS;
      const filtered = pool.filter(s =>
        s.label.slice(1).toLowerCase().startsWith(query)
      );

      if (filtered.length > 0) {
        setBulkTrigger({ type, start, query });
        setBulkSuggestions(filtered);
        setBulkSuggestionIndex(0);
        return;
      }
    }

    setBulkTrigger(null);
    setBulkSuggestions([]);
  };

  const insertSuggestion = (suggestion) => {
    if (!bulkTrigger || !bulkTextareaRef.current) return;
    const ta = bulkTextareaRef.current;
    const before = bulkTasksInput.slice(0, bulkTrigger.start);
    const after = bulkTasksInput.slice(bulkTrigger.start + 1 + bulkTrigger.query.length);
    const newValue = before + suggestion.label + ' ' + after;
    setBulkTasksInput(newValue);
    setBulkTrigger(null);
    setBulkSuggestions([]);

    // Restore focus and cursor position
    const newCursor = before.length + suggestion.label.length + 1;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleBulkKeyDown = (e) => {
    if (bulkSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBulkSuggestionIndex(i => (i + 1) % bulkSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBulkSuggestionIndex(i => (i - 1 + bulkSuggestions.length) % bulkSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertSuggestion(bulkSuggestions[bulkSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setBulkTrigger(null);
      setBulkSuggestions([]);
    }
  };

  const MONTH_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const DAY_MAP = {
    sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2,
    wednesday: 3, wed: 3, thursday: 4, thu: 4, friday: 5, fri: 5,
    saturday: 6, sat: 6
  };

  const parseBulkLine = (line) => {
    let remaining = line;
    let dueDate = null;
    let recurrence = null;
    let description = "";

    // 1. Extract description (-- at the end)
    const descMatch = remaining.match(/\s--\s(.+)$/);
    if (descMatch) {
      description = descMatch[1].trim();
      remaining = remaining.slice(0, descMatch.index);
    }

    // 2. Extract recurrence (@daily, @weekly, etc.)
    const recurrenceMatch = remaining.match(/@(daily|weekly|biweekly|monthly|quarterly|yearly)\b/i);
    if (recurrenceMatch) {
      recurrence = recurrenceMatch[1].toLowerCase();
      remaining = remaining.replace(recurrenceMatch[0], '');
    }

    // 3. Extract tags (#tag)
    const hashtags = remaining.match(/#[\w][\w-]*/g) || [];
    const tags = hashtags.map(tag => tag.substring(1));
    remaining = remaining.replace(/#[\w][\w-]*/g, '');

    // 4. Extract date tokens (first match wins)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // :today
    if (!dueDate && /:(today)\b/i.test(remaining)) {
      dueDate = toLocalDateString(today);
      remaining = remaining.replace(/:(today)\b/i, '');
    }

    // :tomorrow
    if (!dueDate && /:(tomorrow)\b/i.test(remaining)) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      dueDate = toLocalDateString(d);
      remaining = remaining.replace(/:(tomorrow)\b/i, '');
    }

    // :monday, :tue, etc.
    if (!dueDate) {
      const dayPattern = /:(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b/i;
      const dayMatch = remaining.match(dayPattern);
      if (dayMatch) {
        const targetDay = DAY_MAP[dayMatch[1].toLowerCase()];
        const d = new Date(today);
        const currentDay = d.getDay();
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7; // always next occurrence
        d.setDate(d.getDate() + diff);
        dueDate = toLocalDateString(d);
        remaining = remaining.replace(dayMatch[0], '');
      }
    }

    // :+3d, :+1w, :+2m
    if (!dueDate) {
      const relMatch = remaining.match(/:\+(\d+)(d|w|m)\b/i);
      if (relMatch) {
        const num = parseInt(relMatch[1], 10);
        const unit = relMatch[2].toLowerCase();
        const d = new Date(today);
        if (unit === 'd') d.setDate(d.getDate() + num);
        else if (unit === 'w') d.setDate(d.getDate() + num * 7);
        else if (unit === 'm') d.setMonth(d.getMonth() + num);
        dueDate = toLocalDateString(d);
        remaining = remaining.replace(relMatch[0], '');
      }
    }

    // :mar15, :dec25
    if (!dueDate) {
      const absMatch = remaining.match(/:([a-z]{3})(\d{1,2})\b/i);
      if (absMatch) {
        const monthIdx = MONTH_MAP[absMatch[1].toLowerCase()];
        if (monthIdx !== undefined) {
          const day = parseInt(absMatch[2], 10);
          let year = today.getFullYear();
          const candidate = new Date(year, monthIdx, day);
          // If date is in the past, use next year
          if (candidate < today) {
            candidate.setFullYear(year + 1);
          }
          dueDate = toLocalDateString(candidate);
          remaining = remaining.replace(absMatch[0], '');
        }
      }
    }

    // :2026-03-15 (explicit YYYY-MM-DD)
    if (!dueDate) {
      const isoMatch = remaining.match(/:(\d{4}-\d{2}-\d{2})\b/);
      if (isoMatch) {
        const [y, m, d] = isoMatch[1].split('-').map(Number);
        dueDate = toLocalDateString(new Date(y, m - 1, d));
        remaining = remaining.replace(isoMatch[0], '');
      }
    }

    const title = remaining.replace(/\s+/g, ' ').trim();
    return { title, tags, dueDate, recurrence, description };
  };

  const formatPreviewDate = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Show day name if within next 7 days
    const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) {
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }
    return `${months[date.getMonth()]} ${date.getDate()}${date.getFullYear() !== today.getFullYear() ? `, ${date.getFullYear()}` : ''}`;
  };

  const getTaskPreview = (input) => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => parseBulkLine(line))
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
          description: task.description || "",
          entryDate: new Date().toISOString(),
          tags: task.tags,
          completed: false,
          dueDate: task.dueDate || null,
          recurrence: task.recurrence || null,
        }, { source: 'bulk-upload' });
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

  const VALID_RECURRENCES = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

  const parseAndValidateJson = (rawText) => {
    setJsonError("");
    setJsonParsedTasks([]);

    if (!rawText.trim()) return;

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      setJsonError(`Invalid JSON: ${e.message}`);
      return;
    }

    if (!Array.isArray(parsed)) {
      setJsonError("JSON must be an array of task objects: [ {...}, {...} ]");
      return;
    }

    if (parsed.length === 0) {
      setJsonError("Array is empty — add at least one task object.");
      return;
    }

    const errors = [];
    const validTasks = [];

    parsed.forEach((item, i) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        errors.push(`Item ${i + 1}: must be an object`);
        return;
      }

      if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
        errors.push(`Item ${i + 1}: "title" is required and must be a non-empty string`);
        return;
      }

      if (item.description !== undefined && typeof item.description !== 'string') {
        errors.push(`Item ${i + 1}: "description" must be a string`);
        return;
      }

      if (item.tags !== undefined) {
        if (!Array.isArray(item.tags) || !item.tags.every(t => typeof t === 'string')) {
          errors.push(`Item ${i + 1}: "tags" must be an array of strings`);
          return;
        }
      }

      if (item.dueDate !== undefined && item.dueDate !== null) {
        if (typeof item.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)) {
          errors.push(`Item ${i + 1}: "dueDate" must be YYYY-MM-DD format or null`);
          return;
        }
      }

      if (item.recurrence !== undefined && item.recurrence !== null) {
        if (!VALID_RECURRENCES.includes(item.recurrence)) {
          errors.push(`Item ${i + 1}: "recurrence" must be one of: ${VALID_RECURRENCES.join(', ')}`);
          return;
        }
      }

      if (item.subtasks !== undefined && item.subtasks !== null) {
        if (!Array.isArray(item.subtasks)) {
          errors.push(`Item ${i + 1}: "subtasks" must be an array`);
          return;
        }
        for (let j = 0; j < item.subtasks.length; j++) {
          const st = item.subtasks[j];
          if (typeof st !== 'object' || !st.text || typeof st.text !== 'string') {
            errors.push(`Item ${i + 1}, subtask ${j + 1}: must have a "text" string`);
            return;
          }
        }
      }

      validTasks.push({
        title: item.title.trim(),
        description: item.description || "",
        tags: (item.tags || []).map(t => t.toLowerCase().replace(/\s+/g, '')),
        dueDate: item.dueDate || null,
        recurrence: item.recurrence || null,
        subtasks: item.subtasks ? item.subtasks.map(st => ({ text: st.text, done: st.done === true })) : null,
      });
    });

    if (errors.length > 0) {
      setJsonError(errors.join('\n'));
    }
    setJsonParsedTasks(validTasks);
  };

  const handleJsonBulkUpload = async () => {
    try {
      if (jsonParsedTasks.length === 0) {
        toast.error("No valid tasks to upload");
        return;
      }

      let successCount = 0;
      for (const task of jsonParsedTasks) {
        const tags = [...task.tags];
        if (!tags.includes('json')) {
          tags.push('json');
        }
        if (commonTag.trim()) {
          const cleanTag = commonTag.trim().toLowerCase().replace(/\s+/g, '');
          if (!tags.includes(cleanTag)) {
            tags.push(cleanTag);
          }
        }

        const success = await ideas.add({
          userId: user.current.$id,
          userName: user.current.name,
          title: task.title,
          description: task.description || "",
          entryDate: new Date().toISOString(),
          tags,
          completed: false,
          dueDate: task.dueDate || null,
          recurrence: task.recurrence || null,
          subtasks: task.subtasks ? JSON.stringify(task.subtasks) : null,
        }, { source: 'json-upload' });
        if (success) successCount++;
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} tasks!`, {
          id: `json-upload-success`,
          ...toastConfig.success,
        });
        closeBulkUploadModal();
      }
    } catch (error) {
      toast.error("Failed to create tasks");
    }
  };

  const handleJsonFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setJsonError("File too large (max 500KB)");
      return;
    }

    if (!file.name.endsWith('.json')) {
      setJsonError("Please select a .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setJsonInput(text);
      parseAndValidateJson(text);
    };
    reader.onerror = () => {
      setJsonError("Failed to read file");
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleCopyAIPrompt = async () => {
    const prompt = `Analyze the data above — it could be plain text, a link, an email, meeting notes, a forwarded message, AI-generated analysis, or any other content. Identify all actionable tasks and convert them into a JSON array of task objects. Return ONLY valid JSON, no markdown, no explanation.

Each task object must follow this exact schema:
{
  "title": "string (REQUIRED)",
  "description": "string (optional, default "")",
  "tags": ["string"] (optional, default []),
  "dueDate": "YYYY-MM-DD" or null (optional),
  "recurrence": "daily"|"weekly"|"biweekly"|"monthly"|"quarterly"|"yearly"|null (optional),
  "subtasks": [{"text": "string", "done": false}] or null (optional)
}

Rules:
- Output a JSON array: [ {...}, {...} ]
- "title" is the only required field
- Tags should be lowercase, no spaces
- Infer due dates from context when mentioned (use today's date as reference)
- Use "subtasks" for checklists or sub-items
- Break compound sentences into separate tasks
- For emails/messages: extract action items, follow-ups, and deadlines
- For links/articles: extract key takeaways as tasks if applicable
- Add relevant tags based on the content category (e.g. "email", "meeting", "shopping")
`;
    try {
      await navigator.clipboard.writeText(prompt);
      setJsonPromptCopied(true);
      toast.success("AI prompt copied to clipboard!", { id: 'ai-prompt-copy', ...toastConfig.success });
      setTimeout(() => setJsonPromptCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const closeBulkUploadModal = () => {
    setIsBulkUploadOpen(false);
    setBulkTasksInput("");
    setIsShoppingList(false);
    setCommonTag("");
    setShowBulkSyntaxHelp(false);
    setBulkUploadMode('text');
    setJsonInput("");
    setJsonParsedTasks([]);
    setJsonError("");
    setJsonPromptCopied(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-td-bg">
        <div className="text-td-faint text-td-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-td-bg">
      {/* Timezone Warning — subtle banner */}
      {showTimezoneWarning && (
        <div className="border-b border-td-border px-4 py-2 flex items-center justify-between">
          <span className="text-td-xs text-td-muted">
            Some dates may appear shifted due to timezone settings.
          </span>
          <button onClick={() => setShowTimezoneWarning(false)} className="text-td-faint hover:text-td-text">
            <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Top Bar — minimal, 44px */}
      <div className="bg-td-bg border-b border-td-border sticky top-0 z-10">
        <div className="flex items-center h-11 px-3 gap-3">
          {/* Left: title + count */}
          <div className="flex items-baseline gap-1.5 pl-8">
            <span className="text-td-base font-medium text-td-text">Tasks</span>
            <span className="text-td-xs text-td-faint">{filteredTasks.length}</span>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-2 top-1.5 h-3 w-3 text-td-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full pl-7 pr-6 py-1 border border-td-border text-td-sm bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-td-faint hover:text-td-text"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: compact text buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="text-td-sm text-td-muted hover:text-td-text"
            >
              <FontAwesomeIcon icon={faUpload} className="h-3 w-3 sm:hidden" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* View toggle — text links */}
            <div className="flex items-center gap-0.5 border border-td-border px-1 py-0.5">
              {['timeline', 'tags', 'list'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-1.5 py-0.5 text-td-xs capitalize transition-colors ${
                    viewMode === mode
                      ? 'text-td-text font-medium bg-td-hover'
                      : 'text-td-faint hover:text-td-muted'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-td-sm transition-colors ${
                showFilters || selectedTags.length > 0 || timeFilter || userFilter
                  ? 'text-td-text font-medium'
                  : 'text-td-muted hover:text-td-text'
              }`}
            >
              <FontAwesomeIcon icon={faFilter} className="h-3 w-3" />
              {(selectedTags.length + (timeFilter ? 1 : 0) + (userFilter ? 1 : 0)) > 0 && (
                <span className="ml-0.5 text-td-xs">{selectedTags.length + (timeFilter ? 1 : 0) + (userFilter ? 1 : 0)}</span>
              )}
            </button>

            {/* Hide/show completed */}
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className="text-td-sm text-td-muted hover:text-td-text"
              title={hideCompleted ? 'Show done' : 'Hide done'}
            >
              <FontAwesomeIcon icon={hideCompleted ? faEyeSlash : faEye} className="h-3 w-3" />
            </button>

            {/* Shopping filter */}
            <button
              onClick={() => setIsShoppingList(!isShoppingList)}
              className={`text-td-sm ${isShoppingList ? 'text-td-text font-medium' : 'text-td-muted hover:text-td-text'}`}
              title={isShoppingList ? 'Show all' : 'Shopping only'}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="h-3 w-3" />
            </button>

            {/* Work section toggle */}
            <button
              onClick={() => setShowWorkSection(!showWorkSection)}
              className={`text-td-sm ${showWorkSection ? 'text-td-text font-medium' : 'text-td-muted hover:text-td-text'}`}
              title={showWorkSection ? 'Unpin work tasks' : 'Pin work tasks to top'}
            >
              <FontAwesomeIcon icon={faBriefcase} className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Filters panel — compact */}
        {showFilters && (
          <div className="border-t border-td-border px-3 py-2 space-y-2">
            {/* Time */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-td-xs text-td-faint w-12">Time</span>
              {[
                { key: 'today', label: 'Today' },
                { key: 'tomorrow', label: 'Tomorrow' },
                { key: 'overdue', label: 'Overdue' },
                { key: 'week', label: 'This Week' },
                { key: 'next_week', label: 'Next Week' },
                { key: 'next_month', label: 'Next Month' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeFilter(timeFilter === key ? null : key)}
                  className={`px-2 py-0.5 text-td-xs border transition-colors ${
                    timeFilter === key
                      ? 'border-td-text text-td-text'
                      : 'border-td-border text-td-muted hover:text-td-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* User */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-td-xs text-td-faint w-12">User</span>
              <button
                onClick={() => setUserFilter(userFilter === user.current.$id ? null : user.current.$id)}
                className={`px-2 py-0.5 text-td-xs border transition-colors ${
                  userFilter === user.current.$id
                    ? 'border-td-text text-td-text'
                    : 'border-td-border text-td-muted hover:text-td-text'
                }`}
              >
                Me
              </button>
              {Object.values(uniqueUsers).map((userInfo) => (
                userInfo.id !== user.current.$id && (
                  <button
                    key={userInfo.id}
                    onClick={() => setUserFilter(userFilter === userInfo.id ? null : userInfo.id)}
                    className={`px-2 py-0.5 text-td-xs border transition-colors ${
                      userFilter === userInfo.id
                        ? 'border-td-text text-td-text'
                        : 'border-td-border text-td-muted hover:text-td-text'
                    }`}
                  >
                    {userInfo.name}
                  </button>
                )
              ))}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-td-xs text-td-faint w-12">Tags</span>
              {availableTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                  }}
                  className={`px-2 py-0.5 text-td-xs border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-td-text text-td-text'
                      : 'border-td-border text-td-muted hover:text-td-text'
                  }`}
                >
                  {tag}
                </button>
              ))}
              <button
                onClick={() => setShowRecurringInfo(true)}
                className="text-td-faint hover:text-td-muted text-td-xs ml-1"
                title="Recurring task info"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="h-3 w-3" />
              </button>
            </div>

            {/* Clear */}
            {(selectedTags.length > 0 || timeFilter || userFilter) && (
              <div className="pt-1 border-t border-td-border">
                <button
                  onClick={() => { setSelectedTags([]); setTimeFilter(null); setUserFilter(null); }}
                  className="text-td-xs text-td-muted hover:text-td-text"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full">
        {viewMode === 'timeline' || viewMode === 'tags' ? (
          <>
            {/* Mobile Navigation — single column */}
            <div className="block lg:hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {currentColumns.length > 0 && (
                <div>
                  {/* Mobile nav header */}
                  <div className="flex items-center justify-between border-b border-td-border px-3 py-2">
                    <button
                      onClick={() => navigateColumn(-1)}
                      disabled={currentColumnIndex === 0}
                      className="p-2 text-td-muted disabled:opacity-30 hover:text-td-text"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                    </button>

                    <div className="text-center flex-1">
                      <div className="text-td-header uppercase font-medium text-td-muted tracking-wider">
                        {currentColumns[currentColumnIndex]?.title}
                      </div>
                      <div className="text-td-xs text-td-faint">
                        {currentColumns[currentColumnIndex]?.subtitle} · {currentColumns[currentColumnIndex]?.tasks?.length || 0} · {currentColumnIndex + 1}/{currentColumns.length}
                      </div>
                    </div>

                    <button
                      onClick={() => navigateColumn(1)}
                      disabled={currentColumnIndex === currentColumns.length - 1}
                      className="p-2 text-td-muted disabled:opacity-30 hover:text-td-text"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile column content */}
                  <div className="w-full">
                    {(() => {
                      const column = currentColumns[currentColumnIndex];
                      if (!column) return null;
                      const getAddTaskHandler = () => {
                        if (column.isTag && column.tagName) {
                          return (taskData) => handleAddTask({ ...taskData, tags: [...(taskData.tags || []), column.tagName] });
                        }
                        return column.targetDate ? (taskData) => handleAddTask(taskData, column.targetDate) : handleAddTask;
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
                          onTaskDrop={handleTaskDrop}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onQuickDateUpdate={handleQuickDateUpdate}
                          onToggleSubtask={handleToggleSubtask}
                          showWorkSection={showWorkSection}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop — CSS grid of columns */}
            <div className="hidden lg:flex overflow-x-auto" style={{ height: 'calc(100vh - 44px)' }}>
              {currentColumns.map((column) => {
                const getAddTaskHandler = () => {
                  if (column.isTag && column.tagName) {
                    return (taskData) => handleAddTask({ ...taskData, tags: [...(taskData.tags || []), column.tagName] });
                  }
                  return column.targetDate ? (taskData) => handleAddTask(taskData, column.targetDate) : handleAddTask;
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
                    onTaskDrop={handleTaskDrop}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onQuickDateUpdate={handleQuickDateUpdate}
                    onToggleSubtask={handleToggleSubtask}
                    showWorkSection={showWorkSection}
                  />
                );
              })}
            </div>
          </>
        ) : (
          /* List View */
          <div className="max-w-2xl mx-auto px-3 py-4">
            <div className="border-b border-td-border pb-2 mb-2">
              <QuickAddTask onAdd={(taskData) => handleAddTask(taskData)} placeholder="Add…" />
            </div>
            <div>
              {filteredTasks.length > 0 ? (
                <>
                  {/* Pinned Work section in list view */}
                  {showWorkSection && (() => {
                    const pinnedWork = filteredTasks.filter(t => t.tags?.includes('fs') && !t.completed);
                    if (pinnedWork.length === 0) return null;
                    const sorted = [...pinnedWork].sort((a, b) => {
                      if (a.dueDate && b.dueDate) {
                        try {
                          const aDate = parseDueDateToLocal(a.dueDate);
                          const bDate = parseDueDateToLocal(b.dueDate);
                          if (!aDate || !bDate) return 0;
                          return aDate - bDate;
                        } catch { return 0; }
                      }
                      if (a.dueDate && !b.dueDate) return -1;
                      if (!a.dueDate && b.dueDate) return 1;
                      return 0;
                    });
                    return (
                      <div className="border-b-2 border-blue-400/30 pb-1 mb-1">
                        <div className="px-3 pt-1 pb-0.5">
                          <span className="text-[10px] uppercase font-medium text-blue-400 tracking-wider">Work</span>
                        </div>
                        {sorted.map((task) => (
                          <TaskItem
                            key={task.$id}
                            task={task}
                            isProcessing={processingTasks.has(task.$id)}
                            onToggleComplete={handleToggleComplete}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onQuickDateUpdate={handleQuickDateUpdate}
                            onToggleSubtask={handleToggleSubtask}
                          />
                        ))}
                      </div>
                    );
                  })()}
                  {/* Regular task list */}
                  {(showWorkSection
                    ? filteredTasks.filter(t => !t.tags?.includes('fs') || t.completed)
                    : filteredTasks
                  )
                    .sort((a, b) => {
                      if (a.completed !== b.completed) return a.completed ? 1 : -1;
                      if (a.dueDate && b.dueDate) {
                        try {
                          let aDate, bDate;
                          aDate = parseDueDateToLocal(a.dueDate);
                          bDate = parseDueDateToLocal(b.dueDate);
                          if (!aDate || !bDate) return 0;
                          return aDate - bDate;
                        } catch { return 0; }
                      }
                      if (a.dueDate && !b.dueDate) return -1;
                      if (!a.dueDate && b.dueDate) return 1;
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
                        onToggleSubtask={handleToggleSubtask}
                      />
                    ))}
                </>
              ) : (
                <div className="py-12 text-center text-td-faint text-td-sm">
                  No tasks match your filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 bg-black/15 flex items-center justify-center z-50 safe-area-overlay">
          <div className="bg-td-bg border border-td-border max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-td-base font-medium text-td-text">Bulk Upload</h3>
                <button
                  onClick={closeBulkUploadModal}
                  className="text-td-faint hover:text-td-text"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-td-border mb-3">
                <button
                  onClick={() => setBulkUploadMode('text')}
                  className={`px-4 py-1.5 text-td-sm font-medium border-b-2 -mb-px ${
                    bulkUploadMode === 'text'
                      ? 'border-td-text text-td-text'
                      : 'border-transparent text-td-faint hover:text-td-muted'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setBulkUploadMode('json')}
                  className={`px-4 py-1.5 text-td-sm font-medium border-b-2 -mb-px ${
                    bulkUploadMode === 'json'
                      ? 'border-td-text text-td-text'
                      : 'border-transparent text-td-faint hover:text-td-muted'
                  }`}
                >
                  JSON
                </button>
              </div>

              <div className="space-y-3">
                {/* === TEXT TAB === */}
                {bulkUploadMode === 'text' && (
                <div>
                  <div className="text-td-xs text-td-faint mb-2 flex items-center justify-between">
                    <span>One task per line.</span>
                    <button
                      onClick={() => setShowBulkSyntaxHelp(!showBulkSyntaxHelp)}
                      className="text-td-muted hover:text-td-text underline"
                    >
                      {showBulkSyntaxHelp ? 'Hide' : 'Syntax'} help
                    </button>
                  </div>

                  {showBulkSyntaxHelp && (
                    <div className="border border-td-border p-3 mb-2 text-td-xs text-td-muted space-y-1.5 font-mono">
                      <div className="text-td-text font-medium font-sans mb-1">Dates</div>
                      <div><span className="text-td-text">:today</span> <span className="text-td-text">:tomorrow</span> — relative day</div>
                      <div><span className="text-td-text">:monday</span> <span className="text-td-text">:fri</span> — next weekday</div>
                      <div><span className="text-td-text">:+3d</span> <span className="text-td-text">:+1w</span> <span className="text-td-text">:+2m</span> — offset (days/weeks/months)</div>
                      <div><span className="text-td-text">:mar15</span> <span className="text-td-text">:dec25</span> — month + day</div>
                      <div><span className="text-td-text">:2026-03-15</span> — exact date</div>
                      <div className="text-td-text font-medium font-sans mt-2 mb-1">Recurrence</div>
                      <div><span className="text-td-text">@daily</span> <span className="text-td-text">@weekly</span> <span className="text-td-text">@monthly</span> <span className="text-td-text">@yearly</span></div>
                      <div><span className="text-td-text">@biweekly</span> <span className="text-td-text">@quarterly</span></div>
                      <div className="text-td-text font-medium font-sans mt-2 mb-1">Other</div>
                      <div><span className="text-td-text">#tag</span> — add tags</div>
                      <div><span className="text-td-text">-- note text</span> — add description</div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      ref={bulkTextareaRef}
                      value={bulkTasksInput}
                      onChange={handleBulkInputChange}
                      onKeyDown={handleBulkKeyDown}
                      onBlur={() => { setTimeout(() => { setBulkTrigger(null); setBulkSuggestions([]); }, 150); }}
                      className="w-full p-2 border border-td-border text-td-sm font-mono bg-transparent focus:outline-none"
                      rows="6"
                      placeholder={"Buy groceries :today #walmart\nCall dentist :tomorrow -- about cleaning\nTake vitamins :today @daily #health\nMom birthday :mar15 @yearly\nRenew subscription :+30d\nTeam meeting :monday @weekly #work"}
                    />
                    {bulkSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 bottom-0 translate-y-full border border-td-border bg-td-bg z-10 max-h-40 overflow-y-auto shadow-sm">
                        {bulkSuggestions.map((s, i) => (
                          <button
                            key={s.label}
                            className={`w-full text-left px-3 py-1.5 text-td-xs flex justify-between items-center ${
                              i === bulkSuggestionIndex ? 'bg-td-hover text-td-text' : 'text-td-muted hover:bg-td-hover'
                            }`}
                            onMouseDown={(e) => { e.preventDefault(); insertSuggestion(s); }}
                            onMouseEnter={() => setBulkSuggestionIndex(i)}
                          >
                            <span className="font-mono">{s.label}</span>
                            <span className="text-td-faint">{s.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-td-sm text-td-muted mt-2">
                    <input type="checkbox" checked={isShoppingList} onChange={() => setIsShoppingList(!isShoppingList)} className="border-td-border" />
                    Tag all as shopping
                  </label>

                  <div className="mt-2">
                    <input
                      type="text"
                      value={commonTag}
                      onChange={(e) => setCommonTag(e.target.value)}
                      className="w-full p-1.5 border border-td-border text-td-sm bg-transparent focus:outline-none"
                      placeholder="Common tag (optional)"
                      maxLength="20"
                    />
                  </div>

                  {bulkTasksInput && (
                    <div className="mt-2">
                      <div className="text-td-xs text-td-muted mb-1">
                        Preview ({getTaskPreview(bulkTasksInput).length}):
                      </div>
                      <div className="border border-td-border p-2 max-h-36 overflow-y-auto">
                        {getTaskPreview(bulkTasksInput).map((task, index) => (
                          <div key={index} className="text-td-xs text-td-muted mb-1">
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span>{index + 1}. {task.title}</span>
                              {task.tags.length > 0 && <span className="text-td-faint">{task.tags.join(', ')}</span>}
                              {isShoppingList && <span className="text-td-faint">shopping</span>}
                              {commonTag.trim() && <span className="text-td-faint">{commonTag.trim().toLowerCase().replace(/\s+/g, '')}</span>}
                              {task.dueDate && <span className="text-td-text ml-auto">→ {formatPreviewDate(task.dueDate)}</span>}
                              {task.recurrence && <span className="text-td-faint">↻ {task.recurrence}</span>}
                            </div>
                            {task.description && <div className="text-td-faint pl-3 italic">— {task.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* === JSON TAB === */}
                {bulkUploadMode === 'json' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-td-xs text-td-faint">Paste JSON array or upload a .json file</span>
                    <button
                      onClick={handleCopyAIPrompt}
                      className="flex items-center gap-1.5 px-2 py-1 text-td-xs text-td-muted hover:text-td-text border border-td-border hover:bg-td-hover"
                    >
                      <FontAwesomeIcon icon={faCopy} className="h-2.5 w-2.5" />
                      {jsonPromptCopied ? 'Copied!' : 'Copy AI prompt'}
                    </button>
                  </div>

                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleJsonFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="w-full py-3 mb-2 border-2 border-dashed border-td-border text-td-sm text-td-faint hover:text-td-muted hover:border-td-muted text-center"
                  >
                    Choose .json file
                  </button>

                  <textarea
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      parseAndValidateJson(e.target.value);
                    }}
                    className="w-full p-2 border border-td-border text-td-sm font-mono bg-transparent focus:outline-none"
                    rows="6"
                    placeholder={'[\n  {\n    "title": "Buy groceries",\n    "tags": ["shopping"],\n    "dueDate": "2026-03-15"\n  }\n]'}
                  />

                  {jsonError && (
                    <div className="mt-2 p-2 border border-red-400/50 bg-red-500/10 text-td-xs text-red-400 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {jsonError}
                    </div>
                  )}

                  <div className="mt-2">
                    <input
                      type="text"
                      value={commonTag}
                      onChange={(e) => setCommonTag(e.target.value)}
                      className="w-full p-1.5 border border-td-border text-td-sm bg-transparent focus:outline-none"
                      placeholder="Common tag (optional)"
                      maxLength="20"
                    />
                  </div>

                  {jsonParsedTasks.length > 0 && (
                    <div className="mt-2">
                      <div className="text-td-xs text-td-muted mb-1">
                        Preview ({jsonParsedTasks.length}):
                      </div>
                      <div className="border border-td-border p-2 max-h-36 overflow-y-auto">
                        {jsonParsedTasks.map((task, index) => (
                          <div key={index} className="text-td-xs text-td-muted mb-1">
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span>{index + 1}. {task.title}</span>
                              {task.tags.length > 0 && <span className="text-td-faint">{task.tags.join(', ')}</span>}
                              <span className="text-td-faint">json</span>
                              {commonTag.trim() && <span className="text-td-faint">{commonTag.trim().toLowerCase().replace(/\s+/g, '')}</span>}
                              {task.dueDate && <span className="text-td-text ml-auto">→ {formatPreviewDate(task.dueDate)}</span>}
                              {task.recurrence && <span className="text-td-faint">↻ {task.recurrence}</span>}
                            </div>
                            {task.description && <div className="text-td-faint pl-3 italic">— {task.description}</div>}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="text-td-faint pl-3">{task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Shared footer */}
                <div className="flex gap-2 pt-2 border-t border-td-border">
                  <button
                    onClick={bulkUploadMode === 'text' ? handleBulkUpload : handleJsonBulkUpload}
                    className="flex-1 py-1.5 border border-td-text text-td-text text-td-sm hover:bg-td-hover disabled:opacity-30"
                    disabled={bulkUploadMode === 'text' ? getTaskPreview(bulkTasksInput).length === 0 : jsonParsedTasks.length === 0}
                  >
                    Upload {bulkUploadMode === 'text' ? getTaskPreview(bulkTasksInput).length : jsonParsedTasks.length}
                  </button>
                  <button
                    onClick={closeBulkUploadModal}
                    className="flex-1 py-1.5 border border-td-border text-td-muted text-td-sm hover:bg-td-hover"
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
        <div className="fixed inset-0 bg-black/15 flex items-center justify-center z-50 safe-area-overlay">
          <div className="bg-td-bg border border-td-border max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-td-base font-medium text-td-text">Edit Task</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-td-faint hover:text-td-text">
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-td-xs text-td-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-td-border px-2 py-1.5 text-td-base bg-transparent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-td-xs text-td-muted mb-1">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows="3"
                    className="w-full border border-td-border px-2 py-1.5 text-td-sm bg-transparent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-td-xs text-td-muted mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editTags.map((tag) => (
                      <TaskTag key={tag} tag={tag} onRemove={(t) => setEditTags(editTags.filter(x => x !== t))} />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editCustomTagInput}
                    onChange={(e) => setEditCustomTagInput(e.target.value)}
                    onKeyDown={(e) => handleCustomTagAdd(e, true)}
                    placeholder="Add tag (enter)"
                    className="w-full border border-td-border px-2 py-1.5 text-td-sm bg-transparent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-td-xs text-td-muted mb-1">Checklist</label>
                  {editSubtasks.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {editSubtasks.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => {
                              const updated = [...editSubtasks];
                              updated[idx] = { ...updated[idx], done: !updated[idx].done };
                              setEditSubtasks(updated);
                            }}
                            className="h-3.5 w-3.5 accent-current flex-shrink-0"
                          />
                          <span className={`text-td-sm flex-1 ${item.done ? 'line-through text-td-faint' : 'text-td-text'}`}>
                            {item.text}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editSubtasks];
                                  [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                                  setEditSubtasks(updated);
                                }}
                                className="text-td-faint hover:text-td-text text-td-xs px-0.5"
                              >
                                ↑
                              </button>
                            )}
                            {idx < editSubtasks.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editSubtasks];
                                  [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                                  setEditSubtasks(updated);
                                }}
                                className="text-td-faint hover:text-td-text text-td-xs px-0.5"
                              >
                                ↓
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditSubtasks(editSubtasks.filter((_, i) => i !== idx))}
                              className="text-td-faint hover:text-td-text ml-1"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const text = newSubtaskText.trim();
                        if (text) {
                          setEditSubtasks([...editSubtasks, { text, done: false }]);
                          setNewSubtaskText("");
                        }
                      }
                    }}
                    placeholder="Add item (enter)"
                    className="w-full border border-td-border px-2 py-1.5 text-td-sm bg-transparent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-td-xs text-td-muted mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full border border-td-border px-2 py-1.5 text-td-sm bg-transparent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-td-xs text-td-muted mb-1">Repeat</label>
                    <select
                      value={editRecurrence}
                      onChange={(e) => setEditRecurrence(e.target.value)}
                      className="w-full border border-td-border px-2 py-1.5 text-td-sm bg-transparent focus:outline-none"
                    >
                      <option value="">No repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    {editRecurrence && !editDueDate && (
                      <div className="text-td-xs text-td-muted mt-1">Starts today</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-td-border">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-1.5 border border-td-text text-td-text text-td-sm hover:bg-td-hover"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-1.5 border border-td-border text-td-muted text-td-sm hover:bg-td-hover"
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
        <div className="fixed inset-0 bg-black/15 flex items-center justify-center z-50 safe-area-overlay">
          <div className="bg-td-bg border border-td-border max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-td-base font-medium text-td-text">Recurring Tasks</h3>
                <button onClick={() => setShowRecurringInfo(false)} className="text-td-faint hover:text-td-text">
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-4 text-td-sm text-td-muted">
                <div>
                  <h4 className="font-medium text-td-text mb-1">Date-Sensitive Tasks</h4>
                  <p>Tags like birthday, anniversary, bills, rent, mortgage always reschedule to the same date.</p>
                  <p className="text-td-xs text-td-faint mt-1">Example: "Mom's Birthday" due Jan 15 → Jan 15 next year, even if completed late.</p>
                </div>

                <div>
                  <h4 className="font-medium text-td-text mb-1">Regular Tasks</h4>
                  <p>Reschedule based on completion date.</p>
                  <p className="text-td-xs text-td-faint mt-1">Example: "Clean garage" (weekly) done Wed → next Wed.</p>
                </div>

                <div>
                  <h4 className="font-medium text-td-text mb-1">Patterns</h4>
                  <div className="grid grid-cols-3 gap-1 text-td-xs">
                    <span>Daily: every day</span>
                    <span>Weekly: 7 days</span>
                    <span>Biweekly: 14 days</span>
                    <span>Monthly: same date</span>
                    <span>Quarterly: 3 months</span>
                    <span>Yearly: same date</span>
                  </div>
                </div>

                <div className="text-td-xs text-td-faint">
                  Leap years handled automatically (Feb 29 → Feb 28).
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-td-border flex justify-end">
                <button
                  onClick={() => setShowRecurringInfo(false)}
                  className="px-3 py-1 border border-td-text text-td-text text-td-sm hover:bg-td-hover"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
