import { useState, useEffect } from 'react'
import { processTaskWithDate, parseDateString, formatDateForDisplay } from '../lib/utils/dateParser'
import { DateSuggestionDropdown } from './DateSuggestionDropdown'

export function EnhancedTaskParser({ 
  taskText, 
  onTaskUpdate, 
  showDateSuggestions = true,
  className = ""
}) {
  const [parsedTask, setParsedTask] = useState(null)
  const [showDateInput, setShowDateInput] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Parse task when text changes
  useEffect(() => {
    if (taskText && taskText.trim()) {
      const parsed = processTaskWithDate(taskText)
      setParsedTask(parsed)
      
      // Show date input if task has partial date match
      if (parsed.dateInfo?.isPartial && showDateSuggestions) {
        setShowDateInput(true)
        setDateInput(parsed.dateInfo.normalized)
      }
    } else {
      setParsedTask(null)
      setShowDateInput(false)
    }
  }, [taskText, showDateSuggestions])

  const handleDateSuggestionSelect = (suggestion) => {
    const newTaskText = taskText.replace(
      parsedTask.dateInfo.normalized, 
      suggestion
    )
    onTaskUpdate(newTaskText)
    setShowDateInput(false)
  }

  const handleManualDateInput = (dateString) => {
    setDateInput(dateString)
    
    if (dateString.trim()) {
      const parsed = parseDateString(dateString)
      if (parsed && parsed.confidence === 'high') {
        const newTaskText = taskText.replace(
          parsedTask.dateInfo.normalized, 
          dateString
        )
        onTaskUpdate(newTaskText)
        setShowDateInput(false)
      }
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setDateInput(parsedTask?.dateInfo?.normalized || '')
    }
  }

  const handleDateConfirm = () => {
    if (dateInput.trim()) {
      const parsed = parseDateString(dateInput)
      if (parsed && parsed.confidence === 'high') {
        const newTaskText = taskText.replace(
          parsedTask.dateInfo.normalized, 
          dateInput
        )
        onTaskUpdate(newTaskText)
        setShowDateInput(false)
      }
    }
  }

  const handleDateCancel = () => {
    setShowDateInput(false)
    setDateInput('')
  }

  if (!parsedTask) {
    return null
  }

  const { title, dateInfo, hasDate, dueDate } = parsedTask

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Task Title */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 truncate flex-1">{title}</span>
        {hasDate && dateInfo && (
          <button
            onClick={handleEditToggle}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-300"
          >
            {isEditing ? 'Done' : 'Edit Date'}
          </button>
        )}
      </div>

      {/* Date Information */}
      {hasDate && dateInfo && (
        <div className="flex items-center gap-2 text-xs">
          {dateInfo.confidence === 'high' && dueDate && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Due:</span>
              <span className="font-medium text-blue-600">
                {formatDateForDisplay(dueDate)}
              </span>
              {dateInfo.isRecurring && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                  Recurring
                </span>
              )}
            </div>
          )}
          
          {dateInfo.confidence === 'partial' && (
            <div className="flex items-center gap-1">
              <span className="text-orange-600">Partial match:</span>
              <span className="text-gray-600">{dateInfo.normalized}</span>
            </div>
          )}
        </div>
      )}

      {/* Date Input for Partial Matches */}
      {showDateInput && dateInfo?.isPartial && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
          <div className="text-xs text-orange-700 font-medium">
            Complete the date for "{dateInfo.normalized}":
          </div>
          
          <DateSuggestionDropdown
            value={dateInput}
            onChange={handleManualDateInput}
            onSuggestionSelect={handleDateSuggestionSelect}
            placeholder="Type to see suggestions..."
            className="w-full"
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleDateConfirm}
              className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
            >
              Confirm
            </button>
            <button
              onClick={handleDateCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manual Date Input for Editing */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <div className="text-xs text-blue-700 font-medium">
            Edit due date:
          </div>
          
          <DateSuggestionDropdown
            value={dateInput}
            onChange={handleManualDateInput}
            onSuggestionSelect={handleDateSuggestionSelect}
            placeholder="Enter new date..."
            className="w-full"
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleDateConfirm}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Update
            </button>
            <button
              onClick={handleDateCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
