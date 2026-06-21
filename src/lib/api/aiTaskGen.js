/**
 * Call the Netlify Function that proxies to DeepSeek.
 *
 * @param {string} prompt - The user's freeform text
 * @param {string} [userId] - Optional Appwrite user ID for server-side admin verification
 * @returns {Promise<{ tasks: Array, warnings?: string[] }>}
 */
export async function generateTasks(prompt, userId) {
  const res = await fetch("/.netlify/functions/ai-task-gen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, userId }),
  });

  const data = await res.json().catch(() => ({
    error: `Unexpected error (${res.status})`,
  }));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data; // { tasks: [...], warnings: [...] }
}
