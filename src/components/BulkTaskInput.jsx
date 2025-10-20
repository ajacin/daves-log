import { useState, useRef, useEffect } from 'react'
import { getDateSuggestions, formatDateForDisplay } from '../lib/utils/dateParser'

export function BulkTaskInput({ 
  value, 
  onChange, 
  placeholder = "Enter tasks here...",
  className = "",
  rows = 8
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [currentWord, setCurrentWord] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get current word at cursor position
  const getCurrentWord = (text, cursorPos) => {
    const lines = text.split('\n')
    let currentLineIndex = 0
    let currentLineStart = 0
    
    // Find which line the cursor is on
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1 // +1 for newline
      if (cursorPos <= currentLineStart + lineLength) {
        currentLineIndex = i
        break
      }
      currentLineStart += lineLength
    }
    
    const currentLine = lines[currentLineIndex] || ''
    const cursorInLine = cursorPos - currentLineStart
    
    // Find word boundaries
    let wordStart = cursorInLine
    let wordEnd = cursorInLine
    
    // Find start of word
    while (wordStart > 0 && /\S/.test(currentLine[wordStart - 1])) {
      wordStart--
    }
    
    // Find end of word
    while (wordEnd < currentLine.length && /\S/.test(currentLine[wordEnd])) {
      wordEnd++
    }
    
    return {
      word: currentLine.substring(wordStart, wordEnd).trim(),
      wordStart: currentLineStart + wordStart,
      wordEnd: currentLineStart + wordEnd,
      lineIndex: currentLineIndex
    }
  }

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 }

    const textarea = textareaRef.current
    const rect = textarea.getBoundingClientRect()
    
    // Calculate approximate cursor position
    const lines = value.split('\n')
    const currentLineIndex = lines.findIndex((line, index) => {
      const lineStart = lines.slice(0, index).join('\n').length + index
      const lineEnd = lineStart + line.length
      return cursorPosition >= lineStart && cursorPosition <= lineEnd
    })
    
    const lineHeight = 20 // Approximate line height
    const padding = 12 // Textarea padding
    
    return {
      top: rect.top + ((currentLineIndex + 1) * lineHeight) + padding,
      left: rect.left + padding
    }
  }

  // Check for suggestions
  const checkForSuggestions = (text, cursorPos) => {
    const wordInfo = getCurrentWord(text, cursorPos)
    const word = wordInfo.word.toLowerCase()
    
    if (word.length >= 2) {
      const wordSuggestions = getDateSuggestions(word)
      if (wordSuggestions.length > 0) {
        setSuggestions(wordSuggestions)
        setShowSuggestions(true)
        setCurrentWord(word)
        setSuggestionPosition(calculateDropdownPosition())
        setSelectedSuggestionIndex(-1)
        return
      }
    }
    
    setShowSuggestions(false)
    setCurrentWord('')
  }

  // Handle textarea change
  const handleChange = (e) => {
    const newValue = e.target.value
    const newCursorPos = e.target.selectionStart
    
    onChange(newValue)
    setCursorPosition(newCursorPos)
    checkForSuggestions(newValue, newCursorPos)
  }

  // Handle cursor position change
  const handleSelectionChange = (e) => {
    setCursorPosition(e.target.selectionStart)
    checkForSuggestions(value, e.target.selectionStart)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    if (!currentWord) return

    const wordInfo = getCurrentWord(value, cursorPosition)
    const beforeWord = value.substring(0, wordInfo.wordStart)
    const afterWord = value.substring(wordInfo.wordEnd)
    const newValue = beforeWord + suggestion + afterWord
    
    onChange(newValue)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setCurrentWord('')
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = wordInfo.wordStart + suggestion.length
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Handle mouse down on suggestion button to prevent blur
  const handleSuggestionMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      // Update cursor position for regular typing
      setTimeout(() => {
        if (textareaRef.current) {
          setCursorPosition(textareaRef.current.selectionStart)
          checkForSuggestions(value, textareaRef.current.selectionStart)
        }
      }, 0)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex].text)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        setCurrentWord('')
        break
      case 'Tab':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex].text)
        }
        break
      default:
        // Update cursor position for regular typing
        setTimeout(() => {
          if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart)
            checkForSuggestions(value, textareaRef.current.selectionStart)
          }
        }, 0)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      {/* Main textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onFocus={handleSelectionChange}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm ${className}`}
        rows={rows}
      />
      
      {/* Suggestion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            minWidth: '250px',
            maxWidth: '400px'
          }}
        >
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
            Smart date suggestions for "{currentWord}"
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect(suggestion.text)}
              onMouseDown={handleSuggestionMouseDown}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.text}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDateForDisplay(suggestion.date)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
