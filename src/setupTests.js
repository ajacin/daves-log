// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.REACT_APP_PROJECT_ID = 'test-project-id'
process.env.REACT_APP_ENDPOINT = 'https://cloud.appwrite.io/v1'
process.env.REACT_APP_DATABASE_ID = 'test-database-id'
process.env.REACT_APP_TASKS_COLLECTION_ID = 'test-tasks-collection'
process.env.REACT_APP_ACTIVITIES_COLLECTION_ID = 'test-activities-collection'
process.env.REACT_APP_IDEAS_COLLECTION_ID = 'test-ideas-collection'
process.env.REACT_APP_AUTOMATIONS_COLLECTION_ID = 'test-automations-collection'
process.env.REACT_APP_INVITEES_COLLECTION_ID = 'test-invitees-collection'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
}
