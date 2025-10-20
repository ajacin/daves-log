/**
 * Test file for dateParser utility
 * Run with: node src/lib/utils/dateParser.test.js
 */

import { parseDateString, getDateSuggestions, processTaskWithDate, formatDateForDisplay } from './dateParser.js'

describe('dateParser Utility', () => {
  describe('parseDateString', () => {
    test('returns result for "today"', () => {
      const result = parseDateString('today')
      expect(result).toBeDefined()
    })

    test('returns result for "tomorrow"', () => {
      const result = parseDateString('tomorrow')
      expect(result).toBeDefined()
    })

    test('returns result for "next week"', () => {
      const result = parseDateString('next week')
      expect(result).toBeDefined()
    })
  })

  describe('getDateSuggestions', () => {
    test('returns array for "tom"', () => {
      const suggestions = getDateSuggestions('tom')
      expect(Array.isArray(suggestions)).toBe(true)
    })

    test('returns array for "nex"', () => {
      const suggestions = getDateSuggestions('nex')
      expect(Array.isArray(suggestions)).toBe(true)
    })

    test('returns array for "end"', () => {
      const suggestions = getDateSuggestions('end')
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })

  describe('formatDateForDisplay', () => {
    test('formats a date object to string', () => {
      const date = new Date()
      const formatted = formatDateForDisplay(date)
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('processTaskWithDate', () => {
    test('processes task with date', () => {
      const result = processTaskWithDate('Buy groceries tomorrow')
      expect(result).toBeDefined()
      expect(result.title).toBeTruthy()
    })

    test('processes task without date', () => {
      const result = processTaskWithDate('Just a regular task')
      expect(result).toBeDefined()
      expect(result.title).toBeTruthy()
    })
  })
})
