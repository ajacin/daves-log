import { databases, ID } from './appwrite';

const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID_ACTIVITY_LOG;

/**
 * Determine the action type from an update payload.
 * - Only dueDate changed → task_rescheduled
 * - completed changed → task_completed or task_reopened
 * - Otherwise → task_updated
 */
export function determineAction(updates) {
  const keys = Object.keys(updates);
  if (keys.length === 1 && keys[0] === 'dueDate') return 'task_rescheduled';
  if ('completed' in updates) {
    return updates.completed ? 'task_completed' : 'task_reopened';
  }
  return 'task_updated';
}

/**
 * Extract only the fields from `task` that are present in `updates`,
 * producing a minimal before-snapshot.
 */
export function extractRelevantBefore(task, updates) {
  if (!task) return null;
  const before = {};
  for (const key of Object.keys(updates)) {
    if (key in task) {
      before[key] = task[key];
    }
  }
  return before;
}

function safeStringify(obj, maxLen) {
  if (obj == null) return null;
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLen ? str.slice(0, maxLen) : str;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget: log a task action to the activity-log collection.
 * Never throws — failures are silently logged to console.
 */
export async function logAction({ action, taskId, taskTitle, userId, userName, before, after, meta }) {
  if (!COLLECTION_ID) return;
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        action,
        taskId: taskId || '',
        taskTitle: (taskTitle || 'Unknown').slice(0, 255),
        userId: userId || '',
        userName: userName || 'Unknown',
        before: safeStringify(before, 2000),
        after: safeStringify(after, 2000),
        meta: safeStringify(meta, 200),
      }
    );
  } catch (err) {
    console.error('Activity log write failed (non-blocking):', err);
  }
}
