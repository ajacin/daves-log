import { useState, useRef, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faWandMagicSparkles,
  faPlus,
  faXmark,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { generateTasks } from "../../lib/api/aiTaskGen";

// ─── Helpers ────────────────────────────────────────────────

let _taskIdCounter = 0;
function nextId() {
  _taskIdCounter += 1;
  return `ai-gen-${Date.now()}-${_taskIdCounter}`;
}

const MAX_INPUT_LENGTH = 8000;

const TAG_SUGGESTIONS = [
  "shopping", "groceries", "health", "fitness", "work", "meeting",
  "finance", "bills", "kids", "school", "home", "maintenance",
  "urgent", "important", "personal", "travel", "social", "hobby",
  "gift", "appointment", "errands", "call", "email", "research",
];

// ─── Component ─────────────────────────────────────────────

export function AITaskGenerator({ isOpen, onClose, onTasksApproved, userId }) {
  // Phase: 'input' | 'generating' | 'review'
  const [phase, setPhase] = useState("input");
  const [inputText, setInputText] = useState("");
  const [tasks, setTasks] = useState([]); // { id, title, description, dueDate, tags, selected }
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const abortRef = useRef(null);
  const textareaRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase("input");
      setInputText("");
      setTasks([]);
      setError(null);
      setWarnings([]);
      setIsSubmitting(false);
      setExpandedTaskId(null);
    }
  }, [isOpen]);

  // Focus textarea on input phase
  useEffect(() => {
    if (phase === "input" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase]);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    setError(null);
    setWarnings([]);
    setPhase("generating");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateTasks(text, userId || undefined);

      if (controller.signal.aborted) return;

      const enriched = (result.tasks || []).map((t) => ({
        ...t,
        id: nextId(),
        selected: true,
      }));

      if (enriched.length === 0) {
        setError("No tasks could be extracted. Try being more specific or adding more detail.");
        setPhase("input");
        return;
      }

      setTasks(enriched);
      setWarnings(result.warnings || []);
      setPhase("review");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err.message || "Failed to generate tasks");
      setPhase("input");
    } finally {
      abortRef.current = null;
    }
  }, [inputText, userId]);

  const handleCancelGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setPhase("input");
    setError(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    setTasks([]);
    setWarnings([]);
    setError(null);
    setPhase("input");
  }, []);

  const handleApprove = useCallback(async () => {
    const selected = tasks.filter((t) => t.selected && t.title.trim());
    if (selected.length === 0) return;

    setIsSubmitting(true);
    try {
      await onTasksApproved(
        selected.map((t) => ({
          title: t.title.trim(),
          description: t.description || "",
          dueDate: t.dueDate || null,
          tags: t.tags || [],
        }))
      );
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save tasks");
    } finally {
      setIsSubmitting(false);
    }
  }, [tasks, onTasksApproved, onClose]);

  // ─── Task mutations (for review phase) ─────────────────

  const updateTask = useCallback((id, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }, []);

  const toggleSelected = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  }, []);

  const removeTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleExpanded = useCallback((id) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  }, []);

  const addTag = useCallback((taskId, tag) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!clean) return;
    updateTask(taskId, "tags", [
      ...(tasks.find((t) => t.id === taskId)?.tags || []),
      clean,
    ].filter((v, i, a) => a.indexOf(v) === i));
  }, [tasks, updateTask]);

  const removeTag = useCallback((taskId, tag) => {
    updateTask(
      taskId,
      "tags",
      (tasks.find((t) => t.id === taskId)?.tags || []).filter((t) => t !== tag)
    );
  }, [tasks, updateTask]);

  // ─── Derived ───────────────────────────────────────────

  const selectedCount = tasks.filter((t) => t.selected && t.title.trim()).length;
  const hasEdits = phase === "review" && tasks.length > 0;

  // ─── Render ────────────────────────────────────────────

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/15 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (phase === "generating") return; // block close during generation
          if (hasEdits && !window.confirm("Discard generated tasks?")) return;
          onClose();
        }}
      />

      {/* Modal card */}
      <div className="relative bg-td-bg border border-td-border max-w-xl w-full max-h-[90vh] mx-4 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-td-border shrink-0">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="h-4 w-4 text-td-muted"
            />
            <h3 className="text-td-base font-medium text-td-text">
              AI Task Generator
            </h3>
          </div>
          <button
            onClick={() => {
              if (phase === "generating") return;
              if (hasEdits && !window.confirm("Discard generated tasks?")) return;
              onClose();
            }}
            className="text-td-faint hover:text-td-text min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* ─── Error banner ─── */}
          {error && (
            <div className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-td-xs text-red-400">
              {error}
            </div>
          )}

          {/* ─── PHASE 1: Input ─── */}
          {phase === "input" && (
            <>
              <div className="text-td-xs text-td-muted flex justify-between">
                <span>
                  Paste your notes, thoughts, or a brain dump below. AI will
                  extract tasks with dates and tags.
                </span>
                <span className="text-td-faint tabular-nums">
                  {inputText.length}/{MAX_INPUT_LENGTH}
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={(e) => {
                  // Cmd/Ctrl+Enter to generate
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                className="w-full p-3 border border-td-border text-td-sm bg-transparent focus:outline-none focus:border-td-muted resize-y"
                rows={10}
                placeholder={`Buy groceries and milk tomorrow at Walmart\nCall the dentist about teeth cleaning next Tuesday\nPay rent by the 1st of next month\nPrepare slides for team meeting on Friday\nGym workout every weekday\nPick up kids from school today at 3pm`}
              />

              <div className="text-td-xs text-td-faint">
                <span className="text-td-muted">Today:</span> {todayStr} ·{" "}
                <kbd className="text-td-faint border border-td-border px-1 rounded">
                  ⌘
                </kbd>
                +
                <kbd className="text-td-faint border border-td-border px-1 rounded">
                  ↵
                </kbd>{" "}
                to generate
              </div>

              <button
                onClick={handleGenerate}
                disabled={!inputText.trim()}
                className="w-full py-2.5 border border-td-text text-td-text text-td-sm font-medium hover:bg-td-hover disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-3 w-3 mr-1.5" />
                Generate Tasks
              </button>
            </>
          )}

          {/* ─── PHASE 2: Generating ─── */}
          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-2 border-td-border" />
                <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-td-text animate-spin" />
              </div>
              <p className="text-td-sm text-td-muted">Analyzing your text…</p>
              <button
                onClick={handleCancelGeneration}
                className="text-td-xs text-td-faint hover:text-td-muted underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ─── PHASE 3: Review ─── */}
          {phase === "review" && (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between text-td-xs">
                <span className="text-td-muted">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""} generated
                  {selectedCount !== tasks.length && (
                    <span> · {selectedCount} selected</span>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t) => ({ ...t, selected: true }))
                      )
                    }
                    className="text-td-faint hover:text-td-muted"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t) => ({ ...t, selected: false }))
                      )
                    }
                    className="text-td-faint hover:text-td-muted"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-td-xs text-yellow-500/80">
                  {warnings.length} task{warnings.length !== 1 ? "s" : ""} were
                  skipped (invalid format)
                </div>
              )}

              {/* Task cards */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isExpanded={expandedTaskId === task.id}
                    onToggleSelected={() => toggleSelected(task.id)}
                    onUpdate={(field, value) => updateTask(task.id, field, value)}
                    onRemove={() => removeTask(task.id)}
                    onToggleExpand={() => toggleExpanded(task.id)}
                    onAddTag={(tag) => addTag(task.id, tag)}
                    onRemoveTag={(tag) => removeTag(task.id, tag)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer (review phase only) */}
        {phase === "review" && (
          <div className="flex gap-2 px-5 py-3 border-t border-td-border shrink-0">
            <button
              onClick={handleApprove}
              disabled={selectedCount === 0 || isSubmitting}
              className="flex-1 py-2 border border-td-text text-td-text text-td-sm font-medium hover:bg-td-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                  Adding…
                </span>
              ) : (
                `Add ${selectedCount} task${selectedCount !== 1 ? "s" : ""}`
              )}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isSubmitting}
              className="flex-1 py-2 border border-td-border text-td-muted text-td-sm hover:bg-td-hover disabled:opacity-30"
            >
              Regenerate
            </button>
            <button
              onClick={() => {
                if (hasEdits && !window.confirm("Discard generated tasks?")) return;
                onClose();
              }}
              disabled={isSubmitting}
              className="flex-1 py-2 border border-td-border text-td-faint text-td-sm hover:text-td-muted hover:bg-td-hover disabled:opacity-30"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TaskCard sub-component ────────────────────────────────

function TaskCard({
  task,
  isExpanded,
  onToggleSelected,
  onUpdate,
  onRemove,
  onToggleExpand,
  onAddTag,
  onRemoveTag,
}) {
  const [tagInput, setTagInput] = useState("");

  const titleEmpty = !task.title.trim();

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAddTag(tagInput);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && task.tags.length > 0) {
      onRemoveTag(task.tags[task.tags.length - 1]);
    }
  };

  return (
    <div
      className={`border ${
        task.selected ? "border-td-border" : "border-td-border/40 opacity-60"
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-2 p-2.5">
        {/* Checkbox */}
        <label className="mt-1 shrink-0 flex items-center">
          <input
            type="checkbox"
            checked={task.selected}
            onChange={onToggleSelected}
            className="border-td-border"
          />
        </label>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            className={`w-full bg-transparent text-td-sm focus:outline-none border-b ${
              titleEmpty ? "border-red-400/50 text-red-400" : "border-transparent text-td-text"
            }`}
            placeholder="Task title (required)"
          />
          {isExpanded && (
            <textarea
              value={task.description || ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              className="w-full mt-1.5 bg-transparent text-td-xs text-td-muted focus:outline-none border border-td-border/50 p-1.5 resize-y"
              rows={2}
              placeholder="Description (optional)"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleExpand}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-td-faint hover:text-td-muted md:min-h-0 md:min-w-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="h-2.5 w-2.5"
            />
          </button>
          <button
            onClick={onRemove}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-td-faint hover:text-red-400 md:min-h-0 md:min-w-0"
            aria-label="Remove task"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-2.5 pb-2.5 space-y-2 border-t border-td-border/30 pt-2">
          {/* Due date */}
          <div className="flex items-center gap-2">
            <label className="text-td-xs text-td-faint shrink-0 w-16">
              Due date
            </label>
            <input
              type="date"
              value={task.dueDate || ""}
              onChange={(e) => onUpdate("dueDate", e.target.value || null)}
              className="flex-1 bg-transparent border border-td-border p-1 text-td-xs text-td-text focus:outline-none"
            />
            {task.dueDate && (
              <button
                onClick={() => onUpdate("dueDate", null)}
                className="text-td-faint hover:text-td-muted text-td-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-start gap-2">
            <label className="text-td-xs text-td-faint shrink-0 w-16 pt-1">
              Tags
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1 mb-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 border border-td-border text-td-xs text-td-muted"
                  >
                    {tag}
                    <button
                      onClick={() => onRemoveTag(tag)}
                      className="text-td-faint hover:text-td-text"
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-2 w-2" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 bg-transparent border border-td-border p-1 text-td-xs text-td-text focus:outline-none"
                  placeholder="Add tag… (enter to add)"
                />
                <button
                  onClick={() => {
                    onAddTag(tagInput);
                    setTagInput("");
                  }}
                  disabled={!tagInput.trim()}
                  className="px-2 border border-td-border text-td-faint hover:text-td-muted disabled:opacity-30"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-2.5 w-2.5" />
                </button>
              </div>
              {/* Tag suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {TAG_SUGGESTIONS.filter(
                  (s) =>
                    !task.tags.includes(s) &&
                    s.includes(tagInput.toLowerCase())
                )
                  .slice(0, 8)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onAddTag(s);
                        setTagInput("");
                      }}
                      className="px-1.5 py-0.5 border border-td-border text-td-xs text-td-faint hover:text-td-muted hover:bg-td-hover"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
