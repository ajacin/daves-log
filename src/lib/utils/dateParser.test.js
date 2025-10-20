/**
 * Test file for dateParser utility
 * Run with: node src/lib/utils/dateParser.test.js
 */

import { parseDateString, getDateSuggestions, processTaskWithDate, formatDateForDisplay } from './dateParser.js'

// Test cases
const testCases = [
  // Basic relative dates
  'today',
  'tomorrow', 
  'next week',
  'next month',
  
  // Time periods
  'in 3 days',
  'in 2 weeks',
  'in 1 month',
  
  // End of periods
  'end of month',
  'end of next week',
  'end of next month',
  'end of year',
  
  // Days of week
  'next monday',
  'next friday',
  'saturday',
  
  // Recurring patterns
  'every monday',
  'daily',
  'weekly',
  
  // Partial matches for auto-suggestions
  'tom',
  'nex',
  'end',
  'to',
  'in',
  'every'
]

console.log('🧪 Testing Smart Date Parser\n')

// Test date parsing
console.log('📅 Date Parsing Tests:')
testCases.forEach(testCase => {
  const result = parseDateString(testCase)
  if (result) {
    console.log(`✅ "${testCase}" -> ${result.confidence} confidence`)
    if (result.date) {
      console.log(`   📆 Date: ${formatDateForDisplay(result.date)}`)
    }
    if (result.suggestions) {
      console.log(`   💡 Suggestions: ${result.suggestions.join(', ')}`)
    }
  } else {
    console.log(`❌ "${testCase}" -> No match`)
  }
  console.log('')
})

// Test auto-suggestions
console.log('💡 Auto-Suggestion Tests:')
const suggestionTests = ['tom', 'nex', 'end', 'to', 'in', 'every']
suggestionTests.forEach(testCase => {
  const suggestions = getDateSuggestions(testCase)
  console.log(`✅ "${testCase}" -> ${suggestions.length} suggestions:`)
  suggestions.forEach(suggestion => {
    console.log(`   - ${suggestion.text} (${formatDateForDisplay(suggestion.date)})`)
  })
  console.log('')
})

// Test task processing
console.log('📝 Task Processing Tests:')
const taskTests = [
  'Buy groceries tomorrow',
  'Call dentist next week',
  'Meeting next monday',
  'Chess end of month',
  'Daily workout every friday',
  'Chess nex', // Partial match
  'Meeting to' // Partial match
]

taskTests.forEach(task => {
  const result = processTaskWithDate(task)
  console.log(`✅ "${task}"`)
  console.log(`   Title: "${result.title}"`)
  console.log(`   Has Date: ${result.hasDate}`)
  if (result.dueDate) {
    console.log(`   Due Date: ${formatDateForDisplay(result.dueDate)}`)
  }
  if (result.dateInfo?.isPartial) {
    console.log(`   ⚠️ Partial match: "${result.dateInfo.normalized}"`)
  }
  console.log('')
})

// Test specific date logic
console.log('🔍 Specific Date Logic Tests:')
const specificTests = [
  'next month',
  'end of next month'
]

specificTests.forEach(testCase => {
  const result = parseDateString(testCase)
  if (result && result.date) {
    console.log(`✅ "${testCase}" -> ${formatDateForDisplay(result.date)}`)
    
    // Show the calculation logic
    const now = new Date()
    if (testCase === 'next month') {
      const expected = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      console.log(`   📊 Expected: ${formatDateForDisplay(expected)} (one month from today)`)
    } else if (testCase === 'end of next month') {
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
      const expected = new Date(nextMonthEnd)
      expected.setDate(nextMonthEnd.getDate() - 7)
      console.log(`   📊 Expected: ${formatDateForDisplay(expected)} (one week before next month end)`)
    }
  }
  console.log('')
})

console.log('🎉 All tests completed!')
