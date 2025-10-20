/**
 * Test file for SimpleBulkInput component
 * This tests the suggestion functionality
 */

import { getDateSuggestions, formatDateForDisplay } from '../lib/utils/dateParser'

console.log('🧪 Testing SimpleBulkInput Suggestions\n')

// Test cases
const testCases = [
  'tom',
  'nex', 
  'end',
  'to',
  'in',
  'every',
  'daily',
  'weekly'
]

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`)
  
  const suggestions = getDateSuggestions(testCase)
  console.log(`  Suggestions: ${suggestions.length}`)
  
  if (suggestions.length > 0) {
    suggestions.forEach((suggestion, i) => {
      console.log(`    ${i + 1}. "${suggestion.text}" → ${formatDateForDisplay(suggestion.date)}`)
    })
  } else {
    console.log(`    ❌ No suggestions found`)
  }
  
  console.log('')
})

console.log('🎯 Expected behavior:')
console.log('  1. Type "tom" → Should show "tomorrow"')
console.log('  2. Type "nex" → Should show "next week", "next monday", etc.')
console.log('  3. Type "end" → Should show "end of month", "end of year", etc.')
console.log('  4. Use ↑↓ arrows to navigate')
console.log('  5. Press Enter or click to select')
console.log('')
console.log('🔍 Debug info will show in development mode')
console.log('🎉 Test completed!')
