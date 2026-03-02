import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faCalendarAlt,
  faCheck,
  faUndo,
  faTrash,
  faSync,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { ActivityLogProvider, useActivityLog } from "../lib/context/activityLog";

const ACTION_CONFIG = {
  task_created:           { icon: faPlus,        color: 'text-green-600',   bg: 'bg-green-50',   label: 'Created' },
  task_updated:           { icon: faEdit,        color: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Updated' },
  task_rescheduled:       { icon: faCalendarAlt, color: 'text-yellow-600',  bg: 'bg-yellow-50',  label: 'Rescheduled' },
  task_completed:         { icon: faCheck,       color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  task_reopened:          { icon: faUndo,        color: 'text-orange-600',  bg: 'bg-orange-50',  label: 'Reopened' },
  task_deleted:           { icon: faTrash,       color: 'text-red-600',     bg: 'bg-red-50',     label: 'Deleted' },
  recurring_task_created: { icon: faSync,        color: 'text-purple-600',  bg: 'bg-purple-50',  label: 'Recurring' },
};

const ACTION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'task_created', label: 'Created' },
  { value: 'task_completed', label: 'Completed' },
  { value: 'task_rescheduled', label: 'Rescheduled' },
  { value: 'task_updated', label: 'Updated' },
  { value: 'task_deleted', label: 'Deleted' },
  { value: 'recurring_task_created', label: 'Recurring' },
];

function safeParse(jsonStr) {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDueDate(dateStr) {
  if (!dateStr) return 'none';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function ChangeSummary({ entry }) {
  const before = safeParse(entry.before);
  const after = safeParse(entry.after);

  if (entry.action === 'task_rescheduled') {
    return (
      <span className="text-td-muted text-td-sm">
        {formatDueDate(before?.dueDate)} &rarr; {formatDueDate(after?.dueDate)}
      </span>
    );
  }

  if (entry.action === 'task_updated' && before && after) {
    const changes = [];
    for (const key of Object.keys(after)) {
      if (key === 'completed' || key === 'completedAt') continue;
      const oldVal = before[key];
      const newVal = after[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        if (key === 'tags') {
          changes.push(`tags changed`);
        } else if (key === 'dueDate') {
          changes.push(`due: ${formatDueDate(oldVal)} \u2192 ${formatDueDate(newVal)}`);
        } else {
          changes.push(`${key} changed`);
        }
      }
    }
    if (changes.length === 0) return null;
    return <span className="text-td-muted text-td-sm">{changes.join(', ')}</span>;
  }

  if (entry.action === 'task_created' || entry.action === 'recurring_task_created') {
    const dueDate = after?.dueDate;
    const recurrence = after?.recurrence;
    const parts = [];
    if (dueDate) parts.push(`due ${formatDueDate(dueDate)}`);
    if (recurrence) parts.push(recurrence);
    if (parts.length === 0) return null;
    return <span className="text-td-muted text-td-sm">{parts.join(' \u00b7 ')}</span>;
  }

  if (entry.action === 'task_deleted' && before) {
    const tags = before.tags?.length > 0 ? before.tags.join(', ') : null;
    return tags ? <span className="text-td-muted text-td-sm">tags: {tags}</span> : null;
  }

  return null;
}

function toLocalDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDefaultDateFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return toLocalDateString(d);
}

function getDefaultDateTo() {
  return toLocalDateString(new Date());
}

function ActivityLogContent() {
  const { entries, isLoading, error, hasMore, init, loadMore } = useActivityLog();
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom);
  const [dateTo, setDateTo] = useState(getDefaultDateTo);
  const [search, setSearch] = useState('');

  const filters = useMemo(() => ({
    action: actionFilter,
    dateFrom,
    dateTo,
  }), [actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    init(filters);
  }, [filters, init]);

  const handleLoadMore = useCallback(() => {
    loadMore(filters);
  }, [filters, loadMore]);

  // Client-side search filter on loaded entries
  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      e.taskTitle?.toLowerCase().includes(q) ||
      e.userName?.toLowerCase().includes(q) ||
      e.action?.toLowerCase().includes(q)
    );
  }, [entries, search]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {};
    for (const entry of filteredEntries) {
      const dateKey = formatDate(entry.$createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  const dateGroups = Object.keys(groupedEntries);

  return (
    <div className="container mx-auto p-4 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-td-text mb-6">Activity Log</h1>

      {/* Filter bar */}
      <div className="mb-6 space-y-3">
        {/* Action type pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ACTION_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActionFilter(f.value)}
              className={`px-3 py-1 rounded-full text-td-sm whitespace-nowrap transition-colors ${
                actionFilter === f.value
                  ? 'bg-td-text text-white'
                  : 'border border-td-border text-td-muted hover:bg-td-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date range + search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-td-border rounded px-2 py-1 text-td-sm text-td-text"
            />
            <span className="text-td-faint text-td-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-td-border rounded px-2 py-1 text-td-sm text-td-text"
            />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-td-border rounded px-3 py-1 text-td-sm text-td-text flex-1"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && entries.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-td-text"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faList} className="h-10 w-10 text-td-faint mb-3" />
          <p className="text-td-muted text-td-base">No activity found</p>
          <p className="text-td-faint text-td-sm mt-1">Task actions will appear here as you use the app.</p>
        </div>
      )}

      {/* Timeline */}
      {dateGroups.map(dateKey => (
        <div key={dateKey} className="mb-6">
          <div className="text-td-header uppercase text-td-faint tracking-wider mb-3 border-b border-td-border pb-1">
            {dateKey}
          </div>
          <div className="space-y-2">
            {groupedEntries[dateKey].map(entry => {
              const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.task_updated;
              return (
                <div key={entry.$id} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-td-hover transition-colors">
                  {/* Icon */}
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <FontAwesomeIcon icon={config.icon} className={`${config.color} text-xs`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-td-sm font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-td-base text-td-text font-medium truncate">{entry.taskTitle}</span>
                    </div>
                    <div className="mt-0.5">
                      <ChangeSummary entry={entry} />
                    </div>
                    <div className="text-td-xs text-td-faint mt-0.5">
                      {entry.userName} &middot; {formatTime(entry.$createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && filteredEntries.length > 0 && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="border border-td-border px-4 py-2 rounded text-td-muted text-td-sm hover:bg-td-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

export function ActivityLog() {
  return (
    <ActivityLogProvider>
      <ActivityLogContent />
    </ActivityLogProvider>
  );
}
