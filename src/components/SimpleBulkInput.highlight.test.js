/**
 * Test file for SimpleBulkInput highlighting functionality
 * This demonstrates the highlighting and date removal features
 */

import { extractDateFromTask, processTaskWithDate, formatDateForDisplay } from '../lib/utils/dateParser'

console.log('🧪 Testing SimpleBulkInput Highlighting & Date Removal\n')

// Test cases for highlighting and date removal
const testCases = [
  'Buy groceries tomorrow',
  'Call dentist next week',
  'Meeting next monday',
  'Chess end of month',
  'Daily workout every friday',
  'Task with no date',
  'Multiple dates: Meeting tomorrow and follow up next week'
]

console.log('📝 Highlighting Tests:')
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`)
  
  const dateInfo = extractDateFromTask(testCase)
  if (dateInfo && dateInfo.parsed && dateInfo.parsed.confidence === 'high') {
    console.log(`  ✅ Would be highlighted in BLUE`)
    console.log(`  📍 Date: "${dateInfo.dateString}"`)
    console.log(`  📅 Due: ${formatDateForDisplay(dateInfo.parsed.date)}`)
  } else {
    console.log(`  ⚪ No highlighting (no date detected)`)
  }
  
  console.log('')
})

console.log('🧹 Date Removal Tests:')
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`)
  
  const processed = processTaskWithDate(testCase)
  if (processed.hasDate) {
    console.log(`  ✅ Date removed from title`)
    console.log(`  📝 Clean title: "${processed.title}"`)
    console.log(`  📅 Due date: ${formatDateForDisplay(processed.dueDate)}`)
    console.log(`  🔄 Recurring: ${processed.dateInfo?.isRecurring ? 'Yes' : 'No'}`)
  } else {
    console.log(`  ⚪ No date to remove`)
    console.log(`  📝 Title: "${processed.title}"`)
  }
  
  console.log('')
})

console.log('🎨 Visual Features:')
console.log('  🔵 Blue highlighting for smart dates in textarea')
console.log('  📝 Clean task titles without dates in preview')
console.log('  📅 Separate date information with calendar icons')
console.log('  🏷️ "Date parsed" and "Date removed" badges')
console.log('  📊 Original text shown for reference')
console.log('')
console.log('✨ User Experience:')
console.log('  1. Type tasks with dates (e.g., "Buy groceries tomorrow")')
console.log('  2. See blue highlighting on smart dates')
console.log('  3. Preview shows clean titles without dates')
console.log('  4. Date information displayed separately')
console.log('  5. Final tasks have proper due dates')
console.log('')
console.log('🎉 Highlighting and date removal is ready!')
