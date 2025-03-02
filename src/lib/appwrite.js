import { Client, Databases, Account } from "appwrite";

// Create a client with retry logic
const createClientWithRetry = () => {
  const client = new Client();
  
  // Configure retry logic
  client.setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.REACT_APP_PROJECT_ID);

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

// Export helper to check connection
export const checkConnection = async () => {
  try {
    await client.call('get', '/health/time');
    return true;
  } catch (error) {
    return false;
  }
};

