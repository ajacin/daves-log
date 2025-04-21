import { Client, Databases, Account, ID, Query } from "appwrite";

// Create a client with retry logic
const createClientWithRetry = () => {
  const client = new Client();
  
  // Configure retry logic
  const endpoint = process.env.REACT_APP_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.REACT_APP_PROJECT_ID;

  if (!projectId) {
    throw new Error("REACT_APP_PROJECT_ID is not defined in environment variables");
  }

  client.setEndpoint(endpoint).setProject(projectId);

  // Add request interceptor for retry logic
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const originalRequest = client.call.bind(client);
  client.call = async (...args) => {
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await originalRequest(...args);
      } catch (error) {
        lastError = error;
        // Only retry on network errors or 5xx server errors
        if (!error.code || error.code < 500) {
          throw error;
        }
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError;
  };

  return client;
};

const client = createClientWithRetry();

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };

// Export helper to check connection
export const checkConnection = async () => {
  try {
    await client.call('get', '/health/time');
    return true;
  } catch (error) {
    return false;
  }
};

