/**
 * Netlify Function: AI Task Generator
 *
 * Proxies user prompt to DeepSeek API and returns structured task objects.
 * Verifies the calling user is an admin (Appwrite labels check) before calling DeepSeek.
 *
 * Env vars required (set in Netlify dashboard):
 *   DEEPSEEK_API_KEY       - DeepSeek API key
 *   APPWRITE_PROJECT_ID    - Appwrite project ID
 *   APPWRITE_API_KEY       - Appwrite server API key (to look up user labels)
 *   APPWRITE_ENDPOINT      - (optional) defaults to https://cloud.appwrite.io/v1
 */

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * Build the system prompt that constrains DeepSeek to structured JSON output.
 * Includes today's date so relative dates are interpreted correctly.
 */
function buildSystemPrompt(todayDate) {
  return `You are a task extraction engine. Given freeform text, identify all actionable tasks and return ONLY a JSON array of task objects.

TODAY'S DATE: ${todayDate} — use this as the reference when interpreting relative dates (tomorrow = the day after today, next Tuesday = the upcoming Tuesday after today, "by the 1st" = the 1st of the next month if today is past the 1st).

Output ONLY valid JSON. No markdown, no code fences, no explanation.

Each task object must follow this schema:
{
  "title": "string (required, max 200 chars, use imperative form like 'Buy groceries' not 'Need to buy groceries')",
  "description": "string (optional, default empty string, include extra context or notes from the text)",
  "dueDate": "YYYY-MM-DD string or null (optional, infer from natural language, null if no date mentioned)",
  "tags": ["string"] (optional, default empty array, 1-4 lowercase tags inferred from content)
}

Tag inference guidelines:
- groceries/walmart/costco/shopping → ["shopping"] or ["groceries"]
- dentist/doctor/medication/pharmacy → ["health"]
- meeting/call/zoom/email/presentation → ["work"]
- workout/gym/yoga/run → ["fitness"]
- rent/bills/taxes/bank → ["finance"]
- kids/school/homework → ["kids"] or ["school"]
- car/repair/oil change → ["maintenance"]
- Use common sense and keep tags concise (1-4 per task).

Rules:
- Extract EVERY actionable item. Break compound sentences into separate tasks.
- If no actionable tasks are found, return [].
- If text describes only one task, return an array with one object.
- Never invent details not present in the text.`;
}

/**
 * Call Appwrite Users API to check if a user has the "admin" label.
 */
async function verifyAdmin(userId, appwriteEndpoint, projectId, apiKey) {
  const url = `${appwriteEndpoint}/users/${userId}`;
  const res = await fetch(url, {
    headers: {
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to verify user (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const user = await res.json();
  const labels = user.labels || [];
  return labels.includes("admin");
}

/**
 * Validate a single task object.
 * Returns { valid: boolean, task?: normalized, error?: string }
 */
function validateTask(raw, index) {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: `Task ${index}: not an object` };
  }

  const title = (raw.title || "").toString().trim();
  if (!title || title.length > 500) {
    return { valid: false, error: `Task ${index}: title missing or too long` };
  }

  const task = {
    title: title.slice(0, 200),
    description: (raw.description || "").toString().trim().slice(0, 2000),
    dueDate: null,
    tags: [],
  };

  // Validate dueDate
  if (raw.dueDate && typeof raw.dueDate === "string") {
    const dateStr = raw.dueDate.trim();
    // Must be YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const d = new Date(dateStr + "T00:00:00");
      if (!isNaN(d.getTime())) {
        task.dueDate = dateStr;
      }
    }
    // Invalid dates are silently dropped (null is fine)
  }

  // Validate tags
  if (Array.isArray(raw.tags)) {
    task.tags = raw.tags
      .filter((t) => typeof t === "string" && t.trim())
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 30))
      .slice(0, 6); // max 6 tags
  }

  return { valid: true, task };
}

/**
 * Parse the DeepSeek response content into an array of task objects.
 * Handles common failure modes: markdown fences, extra whitespace, partial JSON.
 */
function parseDeepSeekResponse(content) {
  if (!content || typeof content !== "string") {
    throw new Error("Empty response from AI model");
  }

  let json = content.trim();

  // Strip markdown code fences if present
  const fenceMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    json = fenceMatch[1].trim();
  }

  // Try to find the outermost JSON array
  const arrayMatch = json.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    json = arrayMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(
      `AI returned invalid JSON: ${e.message.slice(0, 100)}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not a JSON array");
  }

  return parsed;
}

// Netlify Function handler
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": event.headers.origin || "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // --- Configuration ---
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const appwriteProject = process.env.APPWRITE_PROJECT_ID;
  const appwriteKey = process.env.APPWRITE_API_KEY;
  const appwriteEndpoint =
    process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";

  if (!deepseekKey) {
    console.error("DEEPSEEK_API_KEY not configured");
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: "AI service not configured" }),
    };
  }

  // --- Parse request ---
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { prompt, userId } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: "prompt is required" }),
    };
  }

  if (prompt.length > 8000) {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: "prompt too long (max 8000 chars)" }),
    };
  }

  // --- Verify admin (if configured) ---
  if (appwriteProject && appwriteKey && userId) {
    try {
      const isAdmin = await verifyAdmin(
        userId,
        appwriteEndpoint,
        appwriteProject,
        appwriteKey
      );
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers: corsHeaders(event),
          body: JSON.stringify({ error: "Admin access required" }),
        };
      }
    } catch (err) {
      console.error("Admin verification failed:", err.message);
      return {
        statusCode: 502,
        headers: corsHeaders(event),
        body: JSON.stringify({
          error: "Unable to verify permissions. Try again later.",
        }),
      };
    }
  }

  // --- Call DeepSeek API ---
  const todayDate = new Date().toISOString().split("T")[0];

  let deepseekRes;
  try {
    deepseekRes = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(todayDate) },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.3, // low temp for structured extraction
        max_tokens: 4096,
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.code === "UND_ERR_HEADERS_TIMEOUT") {
      return {
        statusCode: 504,
        headers: corsHeaders(event),
        body: JSON.stringify({
          error: "AI service timed out. Try again or use shorter text.",
        }),
      };
    }
    console.error("DeepSeek fetch error:", err.message);
    return {
      statusCode: 502,
      headers: corsHeaders(event),
      body: JSON.stringify({
        error: "Unable to reach AI service. Try again later.",
      }),
    };
  }

  if (!deepseekRes.ok) {
    const errText = await deepseekRes.text().catch(() => "");
    console.error(`DeepSeek API error ${deepseekRes.status}:`, errText.slice(0, 300));

    if (deepseekRes.status === 429) {
      return {
        statusCode: 429,
        headers: corsHeaders(event),
        body: JSON.stringify({
          error: "AI service is busy. Wait a minute and try again.",
        }),
      };
    }

    return {
      statusCode: 502,
      headers: corsHeaders(event),
      body: JSON.stringify({
        error: `AI service returned an error (${deepseekRes.status})`,
      }),
    };
  }

  // --- Parse and validate response ---
  const aiData = await deepseekRes.json();
  const content = aiData?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("DeepSeek returned no content:", JSON.stringify(aiData).slice(0, 300));
    return {
      statusCode: 502,
      headers: corsHeaders(event),
      body: JSON.stringify({
        error: "AI returned an empty response. Try again with different text.",
      }),
    };
  }

  let rawTasks;
  try {
    rawTasks = parseDeepSeekResponse(content);
  } catch (err) {
    console.error("Parse error:", err.message);
    return {
      statusCode: 502,
      headers: corsHeaders(event),
      body: JSON.stringify({
        error: `AI response could not be parsed: ${err.message}`,
      }),
    };
  }

  // Validate each task, collect valid + warnings
  const tasks = [];
  const warnings = [];

  rawTasks.forEach((raw, i) => {
    const result = validateTask(raw, i);
    if (result.valid) {
      tasks.push(result.task);
    } else {
      warnings.push(result.error);
    }
  });

  return {
    statusCode: 200,
    headers: corsHeaders(event),
    body: JSON.stringify({ tasks, warnings }),
  };
};

/** CORS headers for all responses */
function corsHeaders(event) {
  return {
    "Access-Control-Allow-Origin": event.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };
}
