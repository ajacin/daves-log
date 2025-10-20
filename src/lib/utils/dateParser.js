/**
 * Smart Date Parser for Task Management
 * Handles relative dates, recurring patterns, and natural language date expressions
 */

// Common date patterns and their meanings
const DATE_PATTERNS = {
  // Relative dates
  'today': 0,
  'tomorrow': 1,
  'day after tomorrow': 2,
  'next week': 7,
  'next month': 'nextMonth',
  'next year': 365,
  
  // Time periods
  'in 1 day': 1,
  'in 2 days': 2,
  'in 3 days': 3,
  'in 1 week': 7,
  'in 2 weeks': 14,
  'in 1 month': 30,
  'in 3 months': 90,
  'in 6 months': 180,
  'in 1 year': 365,
  
  // End of periods
  'end of week': 'endOfWeek',
  'end of month': 'endOfMonth',
  'end of year': 'endOfYear',
  'end of next week': 'endOfNextWeek',
  'end of next month': 'endOfNextMonth',
  'end of next year': 'endOfNextYear',
  
  // Days of week
  'monday': 'nextMonday',
  'tuesday': 'nextTuesday',
  'wednesday': 'nextWednesday',
  'thursday': 'nextThursday',
  'friday': 'nextFriday',
  'saturday': 'nextSaturday',
  'sunday': 'nextSunday',
  'next monday': 'nextMonday',
  'next tuesday': 'nextTuesday',
  'next wednesday': 'nextWednesday',
  'next thursday': 'nextThursday',
  'next friday': 'nextFriday',
  'next saturday': 'nextSaturday',
  'next sunday': 'nextSunday',
  
  // Recurring patterns
  'daily': 'daily',
  'weekly': 'weekly',
  'monthly': 'monthly',
  'yearly': 'yearly',
  'every monday': 'everyMonday',
  'every tuesday': 'everyTuesday',
  'every wednesday': 'everyWednesday',
  'every thursday': 'everyThursday',
  'every friday': 'everyFriday',
  'every saturday': 'everySaturday',
  'every sunday': 'everySunday'
}

// Auto-suggestion patterns for partial matches
const SUGGESTION_PATTERNS = {
  'tom': ['tomorrow'],
  'tomorrow': ['tomorrow'],
  'next': ['next week', 'next month', 'next year', 'next monday', 'next tuesday', 'next wednesday', 'next thursday', 'next friday', 'next saturday', 'next sunday'],
  'nex': ['next week', 'next month', 'next year', 'next monday', 'next tuesday', 'next wednesday', 'next thursday', 'next friday', 'next saturday', 'next sunday'],
  'end': ['end of week', 'end of month', 'end of year', 'end of next week', 'end of next month', 'end of next year'],
  'to': ['today', 'tomorrow'],
  'in': ['in 1 day', 'in 2 days', 'in 3 days', 'in 1 week', 'in 2 weeks', 'in 1 month', 'in 3 months', 'in 6 months', 'in 1 year'],
  'every': ['every monday', 'every tuesday', 'every wednesday', 'every thursday', 'every friday', 'every saturday', 'every sunday'],
  'daily': ['daily'],
  'weekly': ['weekly'],
  'monthly': ['monthly']
}

/**
 * Get current date as a reference point
 */
function getCurrentDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Calculate date based on pattern
 */
function calculateDate(pattern, baseDate = null) {
  const base = baseDate || getCurrentDate()
  
  if (typeof pattern === 'number') {
    const result = new Date(base)
    result.setDate(result.getDate() + pattern)
    return result
  }
  
  switch (pattern) {
    case 'endOfWeek':
      const endOfWeek = new Date(base)
      endOfWeek.setDate(base.getDate() + (6 - base.getDay()))
      return endOfWeek
      
    case 'endOfMonth':
      const endOfMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0)
      return endOfMonth
      
    case 'endOfYear':
      const endOfYear = new Date(base.getFullYear(), 11, 31)
      return endOfYear
      
    case 'endOfNextWeek':
      const endOfNextWeek = new Date(base)
      endOfNextWeek.setDate(base.getDate() + (13 - base.getDay()))
      return endOfNextWeek
      
    case 'endOfNextMonth':
      // End of next month should be one week before the next month's end date
      const nextMonthEnd = new Date(base.getFullYear(), base.getMonth() + 2, 0)
      const endOfNextMonth = new Date(nextMonthEnd)
      endOfNextMonth.setDate(nextMonthEnd.getDate() - 7)
      return endOfNextMonth
      
    case 'endOfNextYear':
      const endOfNextYear = new Date(base.getFullYear() + 1, 11, 31)
      return endOfNextYear
      
    case 'nextMonth':
      const nextMonth = new Date(base.getFullYear(), base.getMonth() + 1, base.getDate())
      return nextMonth
      
    case 'nextMonday':
      const nextMonday = new Date(base)
      nextMonday.setDate(base.getDate() + (1 + 7 - base.getDay()) % 7)
      return nextMonday
      
    case 'nextTuesday':
      const nextTuesday = new Date(base)
      nextTuesday.setDate(base.getDate() + (2 + 7 - base.getDay()) % 7)
      return nextTuesday
      
    case 'nextWednesday':
      const nextWednesday = new Date(base)
      nextWednesday.setDate(base.getDate() + (3 + 7 - base.getDay()) % 7)
      return nextWednesday
      
    case 'nextThursday':
      const nextThursday = new Date(base)
      nextThursday.setDate(base.getDate() + (4 + 7 - base.getDay()) % 7)
      return nextThursday
      
    case 'nextFriday':
      const nextFriday = new Date(base)
      nextFriday.setDate(base.getDate() + (5 + 7 - base.getDay()) % 7)
      return nextFriday
      
    case 'nextSaturday':
      const nextSaturday = new Date(base)
      nextSaturday.setDate(base.getDate() + (6 + 7 - base.getDay()) % 7)
      return nextSaturday
      
    case 'nextSunday':
      const nextSunday = new Date(base)
      nextSunday.setDate(base.getDate() + (7 - base.getDay()) % 7)
      return nextSunday
      
    default:
      return base
  }
}

/**
 * Parse a date string and return parsed information
 */
export function parseDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }
  
  const normalized = dateString.toLowerCase().trim()
  
  // Check for exact matches first
  if (DATE_PATTERNS[normalized]) {
    const pattern = DATE_PATTERNS[normalized]
    const calculatedDate = calculateDate(pattern)
    
    return {
      original: dateString,
      normalized,
      pattern,
      date: calculatedDate,
      isRecurring: typeof pattern === 'string' && pattern.startsWith('every'),
      isRelative: typeof pattern === 'number' || pattern.startsWith('next') || pattern.startsWith('endOf'),
      confidence: 'high'
    }
  }
  
  // Check for partial matches for auto-suggestions
  for (const [prefix, suggestions] of Object.entries(SUGGESTION_PATTERNS)) {
    if (normalized.startsWith(prefix)) {
      return {
        original: dateString,
        normalized,
        suggestions,
        confidence: 'partial',
        isPartial: true
      }
    }
  }
  
  return null
}

/**
 * Get auto-suggestions for a partial date string
 */
export function getDateSuggestions(partialString) {
  if (!partialString || typeof partialString !== 'string') {
    return []
  }
  
  const normalized = partialString.toLowerCase().trim()
  
  for (const [prefix, suggestions] of Object.entries(SUGGESTION_PATTERNS)) {
    if (normalized.startsWith(prefix)) {
      return suggestions.map(suggestion => ({
        text: suggestion,
        date: calculateDate(DATE_PATTERNS[suggestion]),
        confidence: 'suggestion'
      }))
    }
  }
  
  return []
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date) {
  if (!date || !(date instanceof Date)) {
    return ''
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Today'
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

/**
 * Extract date information from task text
 */
export function extractDateFromTask(taskText) {
  if (!taskText || typeof taskText !== 'string') {
    return null
  }
  
  // Look for date patterns in the task text
  const words = taskText.toLowerCase().split(/\s+/)
  
  for (let i = 0; i < words.length; i++) {
    // Check for single word patterns
    if (DATE_PATTERNS[words[i]]) {
      return {
        dateString: words[i],
        parsed: parseDateString(words[i]),
        startIndex: taskText.toLowerCase().indexOf(words[i]),
        endIndex: taskText.toLowerCase().indexOf(words[i]) + words[i].length
      }
    }
    
    // Check for multi-word patterns
    for (let j = i + 1; j <= Math.min(i + 3, words.length); j++) {
      const phrase = words.slice(i, j).join(' ')
      if (DATE_PATTERNS[phrase]) {
        return {
          dateString: phrase,
          parsed: parseDateString(phrase),
          startIndex: taskText.toLowerCase().indexOf(phrase),
          endIndex: taskText.toLowerCase().indexOf(phrase) + phrase.length
        }
      }
    }
  }
  
  return null
}

/**
 * Process task text and extract/parse dates
 */
export function processTaskWithDate(taskText) {
  const dateInfo = extractDateFromTask(taskText)
  
  if (!dateInfo) {
    return {
      originalText: taskText,
      title: taskText,
      dateInfo: null,
      hasDate: false
    }
  }
  
  const { dateString, parsed, startIndex, endIndex } = dateInfo
  
  // Remove the date string from the title
  const title = taskText.substring(0, startIndex).trim() + 
                taskText.substring(endIndex).trim()
  
  return {
    originalText: taskText,
    title: title.replace(/\s+/g, ' ').trim(),
    dateInfo: parsed,
    hasDate: true,
    dateString,
    dueDate: parsed?.date
  }
}
