/**
 * Call the Netlify Function that proxies to DeepSeek.
 *
 * @param {string} prompt - The user's freeform text
 * @param {string} [userId] - Optional Appwrite user ID for server-side admin verification
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the in-flight request
 * @returns {Promise<{ tasks: Array, warnings?: string[] }>}
 */
export async function generateTasks(prompt, userId, signal) {
  const res = await fetch("/.netlify/functions/ai-task-gen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, userId }),
    signal,
  });

  const data = await res.json().catch(() => ({
    error: `Unexpected error (${res.status})`,
  }));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data; // { tasks: [...], warnings: [...] }
}
